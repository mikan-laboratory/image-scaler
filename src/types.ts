export interface WidthAndHeight {
  width: number;
  height: number;
}

export interface WidthHeightAndSize extends WidthAndHeight {
  size: string;
}

export interface GeneratePostfixParams {
  format: 'size' | 'wxh';
  size: WidthHeightAndSize;
}

export interface WidthHeightAndImageName extends WidthAndHeight {
  imageName: string;
}

export interface Sizes {
  [x: string]: WidthAndHeight;
}

export interface ScaleLocalImageBaseParams extends WidthHeightAndImageName {
  filePath: string;
}

export interface ScaleLocalImageToFileParams extends ScaleLocalImageBaseParams {
  outputDir: string;
  outputType: 'file';
  postfix?: 'size' | 'wxh';
}

export interface ScaleLocalImageToBufferParams extends ScaleLocalImageBaseParams {
  outputType: 'buffer';
}

export type ScaleLocalImageParams = ScaleLocalImageToFileParams | ScaleLocalImageToBufferParams;

export interface ScaleRemoteImageBaseParams extends WidthHeightAndImageName {
  url: string;
}

export interface ScaleRemoteImageToFileParams extends ScaleRemoteImageBaseParams {
  outputDir: string;
  outputType: 'file';
  postfix?: 'size' | 'wxh';
}

export interface ScaleRemoteImageToBufferParams extends ScaleRemoteImageBaseParams {
  outputType: 'buffer';
}

export type ScaleRemoteImageParams = ScaleRemoteImageToFileParams | ScaleRemoteImageToBufferParams;

export type ScaleImageParams = ScaleLocalImageParams | ScaleRemoteImageParams;

export type InferScaleImageReturnType<T extends ScaleImageParams> = T extends { outputType: 'file' }
  ? string
  : T extends { outputType: 'buffer' }
    ? Buffer
    : never;
