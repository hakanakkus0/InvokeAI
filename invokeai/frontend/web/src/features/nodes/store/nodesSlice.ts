import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OpenAPIV3 } from 'openapi-types';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnectStartParams,
} from 'reactflow';
import { ImageDTO } from 'services/api';
import { receivedOpenAPISchema } from 'services/thunks/schema';
import { InvocationTemplate, InvocationValue } from '../types/types';
import { parseSchema } from '../util/parseSchema';
import { log } from 'app/logging/useLogger';
import { forEach, size } from 'lodash-es';
import { RgbaColor } from 'react-colorful';
import { imageUrlsReceived } from 'services/thunks/image';
import { RootState } from 'app/store/store';

export type NodesState = {
  nodes: Node<InvocationValue>[];
  edges: Edge[];
  schema: OpenAPIV3.Document | null;
  invocationTemplates: Record<string, InvocationTemplate>;
  connectionStartParams: OnConnectStartParams | null;
  shouldShowGraphOverlay: boolean;
};

export const initialNodesState: NodesState = {
  nodes: [],
  edges: [],
  schema: null,
  invocationTemplates: {},
  connectionStartParams: null,
  shouldShowGraphOverlay: false,
};

const nodesSlice = createSlice({
  name: 'nodes',
  initialState: initialNodesState,
  reducers: {
    nodesChanged: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
    nodeAdded: (state, action: PayloadAction<Node<InvocationValue>>) => {
      state.nodes.push(action.payload);
    },
    edgesChanged: (state, action: PayloadAction<EdgeChange[]>) => {
      state.edges = applyEdgeChanges(action.payload, state.edges);
    },
    connectionStarted: (state, action: PayloadAction<OnConnectStartParams>) => {
      state.connectionStartParams = action.payload;
    },
    connectionMade: (state, action: PayloadAction<Connection>) => {
      state.edges = addEdge(action.payload, state.edges);
    },
    connectionEnded: (state) => {
      state.connectionStartParams = null;
    },
    fieldValueChanged: (
      state,
      action: PayloadAction<{
        nodeId: string;
        fieldName: string;
        value: string | number | boolean | ImageDTO | RgbaColor | undefined;
      }>
    ) => {
      const { nodeId, fieldName, value } = action.payload;
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);

      if (nodeIndex > -1) {
        state.nodes[nodeIndex].data.inputs[fieldName].value = value;
      }
    },
    shouldShowGraphOverlayChanged: (state, action: PayloadAction<boolean>) => {
      state.shouldShowGraphOverlay = action.payload;
    },
    parsedOpenAPISchema: (state, action: PayloadAction<OpenAPIV3.Document>) => {
      try {
        const parsedSchema = parseSchema(action.payload);

        // TODO: Achtung! Side effect in a reducer!
        log.info(
          { namespace: 'schema', nodes: parsedSchema },
          `Parsed ${size(parsedSchema)} nodes`
        );
        state.invocationTemplates = parsedSchema;
      } catch (err) {
        console.error(err);
      }
    },
    nodeEditorReset: () => {
      return { ...initialNodesState };
    },
  },
  extraReducers(builder) {
    builder.addCase(receivedOpenAPISchema.fulfilled, (state, action) => {
      state.schema = action.payload;
    });
  },
});

export const {
  nodesChanged,
  edgesChanged,
  nodeAdded,
  fieldValueChanged,
  connectionMade,
  connectionStarted,
  connectionEnded,
  shouldShowGraphOverlayChanged,
  parsedOpenAPISchema,
  nodeEditorReset,
} = nodesSlice.actions;

export default nodesSlice.reducer;

export const nodesSelecter = (state: RootState) => state.nodes;
