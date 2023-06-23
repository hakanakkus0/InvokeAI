/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageField } from './ImageField';
import type { VaeField } from './VaeField';

/**
 * Encodes an image into latents.
 */
export type ImageToLatentsInvocation = {
  /**
   * The id of this node. Must be unique among all nodes.
   */
  id: string;
  /**
   * Whether or not this node is an intermediate node.
   */
  is_intermediate?: boolean;
  type?: 'i2l';
  /**
   * The image to encode
   */
  image?: ImageField;
  /**
   * Vae submodel
   */
  vae?: VaeField;
  /**
   * Encode latents by overlaping tiles(less memory consumption)
   */
  tiled?: boolean;
};

