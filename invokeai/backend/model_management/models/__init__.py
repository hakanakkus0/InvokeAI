import inspect
from enum import Enum
from pydantic import BaseModel
from typing import Literal, get_origin
from .base import BaseModelType, ModelType, SubModelType, ModelBase, ModelConfigBase, ModelVariantType, SchedulerPredictionType, ModelError, SilenceWarnings
from .stable_diffusion import StableDiffusion1Model, StableDiffusion2Model
from .vae import VaeModel
from .lora import LoRAModel
from .controlnet import ControlNetModel # TODO:
from .textual_inversion import TextualInversionModel

MODEL_CLASSES = {
    BaseModelType.StableDiffusion1: {
        ModelType.Pipeline: StableDiffusion1Model,
        ModelType.Vae: VaeModel,
        ModelType.Lora: LoRAModel,
        ModelType.ControlNet: ControlNetModel,
        ModelType.TextualInversion: TextualInversionModel,
    },
    BaseModelType.StableDiffusion2: {
        ModelType.Pipeline: StableDiffusion2Model,
        ModelType.Vae: VaeModel,
        ModelType.Lora: LoRAModel,
        ModelType.ControlNet: ControlNetModel,
        ModelType.TextualInversion: TextualInversionModel,
    },
    #BaseModelType.Kandinsky2_1: {
    #    ModelType.Pipeline: Kandinsky2_1Model,
    #    ModelType.MoVQ: MoVQModel,
    #    ModelType.Lora: LoRAModel,
    #    ModelType.ControlNet: ControlNetModel,
    #    ModelType.TextualInversion: TextualInversionModel,
    #},
}

MODEL_CONFIGS = list()
OPENAPI_MODEL_CONFIGS = list()

class OpenAPIModelInfoBase(BaseModel):
    name: str
    base_model: BaseModelType
    type: ModelType


for base_model, models in MODEL_CLASSES.items():
    for model_type, model_class in models.items():
        model_configs = set(model_class._get_configs().values())
        model_configs.discard(None)
        MODEL_CONFIGS.extend(model_configs)

        for cfg in model_configs:
            model_name, cfg_name = cfg.__qualname__.split('.')[-2:]
            openapi_cfg_name = model_name + cfg_name
            if openapi_cfg_name in vars():
                continue

            api_wrapper = type(openapi_cfg_name, (cfg, OpenAPIModelInfoBase), dict(
                __annotations__ = dict(
                    type=Literal[model_type.value],
                ),
            ))

            #globals()[openapi_cfg_name] = api_wrapper
            vars()[openapi_cfg_name] = api_wrapper
            OPENAPI_MODEL_CONFIGS.append(api_wrapper)

def get_model_config_enums():
    enums = list()

    for model_config in MODEL_CONFIGS:
        fields = inspect.get_annotations(model_config)
        try:
            field = fields["model_format"]
        except:
            raise Exception("format field not found")

        # model_format: None
        # model_format: SomeModelFormat
        # model_format: Literal[SomeModelFormat.Diffusers]
        # model_format: Literal[SomeModelFormat.Diffusers, SomeModelFormat.Checkpoint]

        if isinstance(field, type) and issubclass(field, str) and issubclass(field, Enum):
            enums.append(field)

        elif get_origin(field) is Literal and all(isinstance(arg, str) and isinstance(arg, Enum) for arg in field.__args__):
            enums.append(type(field.__args__[0]))

        elif field is None:
            pass

        else:
            raise Exception(f"Unsupported format definition in {model_configs.__qualname__}")

    return enums

