// Basic Types
import { FormatEnum } from 'sharp';

export interface Width {
  width: number;
}

export interface WidthAndSize extends Width {
  size: string;
}

export type PostfixFormat = 'size' | 'w';

export interface Sizes {
  [x: string]: Width;
}

// Parameter Types
export interface GeneratePostfixParams {
  format: PostfixFormat;
  widthAndSize: WidthAndSize;
}

export interface ScaleImageBaseParams extends Width {
  format?: keyof FormatEnum;
}

// Local Image Scaling
export interface ScaleLocalImageBaseParams extends ScaleImageBaseParams {
  filePath: string;
}

export interface ScaleLocalImageToFileParams extends ScaleLocalImageBaseParams {
  outputDir: string;
  outputType: 'file';
  postfix?: PostfixFormat;
  imageName: string;
}

export interface ScaleLocalImageToBufferParams extends ScaleLocalImageBaseParams {
  outputType: 'buffer';
}

export type ScaleLocalImageParams = ScaleLocalImageToFileParams | ScaleLocalImageToBufferParams;

// Remote Image Scaling
export interface ScaleRemoteImageBaseParams extends ScaleImageBaseParams {
  url: string;
}

export interface ScaleRemoteImageToFileParams extends ScaleRemoteImageBaseParams {
  outputDir: string;
  outputType: 'file';
  postfix?: PostfixFormat;
  imageName: string;
}

export interface ScaleRemoteImageToBufferParams extends ScaleRemoteImageBaseParams {
  outputType: 'buffer';
}

export type ScaleRemoteImageParams = ScaleRemoteImageToFileParams | ScaleRemoteImageToBufferParams;

// Combined Scaling Types
export type ScaleImageParams = ScaleLocalImageParams | ScaleRemoteImageParams;

export type ScaleOrGetExistingParams = ScaleImageParams & { outputDir: string; imageName: string };

// Utility Types
export type InferScaleImageReturnType<T extends ScaleImageParams> = T extends { outputType: 'file' }
  ? string
  : T extends { outputType: 'buffer' }
    ? Buffer
    : never;

export interface GenerateImagePathParams {
  outputDir: string;
  imageName: string;
  widthAndSize: WidthAndSize;
  format: string;
  postfix?: PostfixFormat;
}

export interface ResizeImageParams {
  inputBuffer: Buffer;
  width: number;
  format: keyof FormatEnum;
}

export interface GetPostfixFormatParams {
  postfix?: PostfixFormat;
}
