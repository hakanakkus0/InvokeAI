/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CkptModelInfo = {
  /**
   * A description of the model
   */
  description?: string;
  /**
   * The name of the model
   */
  model_name: string;
  /**
   * The type of the model
   */
  model_type: string;
  format?: 'ckpt';
  /**
   * The path to the model config
   */
  config: string;
  /**
   * The path to the model weights
   */
  weights: string;
  /**
   * The path to the model VAE
   */
  vae: string;
  /**
   * The width of the model
   */
  width?: number;
  /**
   * The height of the model
   */
  height?: number;
};

