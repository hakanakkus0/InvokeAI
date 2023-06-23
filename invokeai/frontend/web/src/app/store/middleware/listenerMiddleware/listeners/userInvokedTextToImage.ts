import { startAppListening } from '..';
import { sessionCreated } from 'services/thunks/session';
import { log } from 'app/logging/useLogger';
import { textToImageGraphBuilt } from 'features/nodes/store/actions';
import { userInvoked } from 'app/store/actions';
import { sessionReadyToInvoke } from 'features/system/store/actions';
import { buildLinearTextToImageGraph } from 'features/nodes/util/graphBuilders/buildLinearTextToImageGraph';

const moduleLog = log.child({ namespace: 'invoke' });

export const addUserInvokedTextToImageListener = () => {
  startAppListening({
    predicate: (action): action is ReturnType<typeof userInvoked> =>
      userInvoked.match(action) && action.payload === 'txt2img',
    effect: async (action, { getState, dispatch, take }) => {
      const state = getState();

      const graph = buildLinearTextToImageGraph(state);

      dispatch(textToImageGraphBuilt(graph));

      moduleLog.debug({ data: graph }, 'Text to Image graph built');

      dispatch(sessionCreated({ graph }));

      await take(sessionCreated.fulfilled.match);

      dispatch(sessionReadyToInvoke());
    },
  });
};
