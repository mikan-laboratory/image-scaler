import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import {
  Sizes,
  ScaleImageParams,
  InferScaleImageReturnType,
  GeneratePostfixParams,
  ScaleOrGetExistingParams,
  GenerateImagePathParams,
  ResizeImageParams,
  GetPostfixFormatParams,
  PostfixFormat,
  WidthAndSize,
  Width,
} from './types';
import { DEFAULT_SIZES } from './constants';

export class ImageScaler {
  sizes: WidthAndSize[] = [];

  constructor(sizes: Sizes = DEFAULT_SIZES) {
    Object.entries(sizes).forEach(([key, value]) => {
      this.sizes.push({
        size: key,
        ...value,
      });
    });

    this.sizes.sort((a, b) => {
      if (a.width < b.width) return -1;
      if (a.width > b.width) return 1;
      return 0;
    });
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }

  private async resizeImage({ inputBuffer, width, format }: ResizeImageParams): Promise<Buffer> {
    return sharp(inputBuffer)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: sharp.fit.contain,
      })
      .toFormat(format)
      .toBuffer();
  }

  private selectSize(params: Width): WidthAndSize {
    for (const size of this.sizes) {
      if (params.width <= size.width) {
        return size;
      }
    }
    return this.sizes[this.sizes.length - 1];
  }

  private getPostfixFormat(params: GetPostfixFormatParams): PostfixFormat {
    return params.postfix ?? 'size';
  }

  private generatePostfix(params: GeneratePostfixParams): string {
    if (params.format === 'size') return params.widthAndSize.size;

    return `w=${params.widthAndSize.width}`;
  }

  private generateImagePath(params: GenerateImagePathParams): string {
    const postfixFormat = this.getPostfixFormat(params);

    const postfix = this.generatePostfix({
      format: postfixFormat,
      widthAndSize: params.widthAndSize,
    });

    return path.join(params.outputDir, `${params.imageName}-${postfix}.${params.format}`);
  }

  async scale<T extends ScaleImageParams>(params: T): Promise<InferScaleImageReturnType<T>> {
    const { outputType, format = 'webp' } = params;

    let inputBuffer: Buffer | undefined;

    if ('filePath' in params) {
      inputBuffer = fs.readFileSync(params.filePath);
    } else if ('url' in params) {
      inputBuffer = await this.downloadImage(params.url);
    }

    if (!inputBuffer) throw new Error('Could not fetch image');

    const targetSize = this.selectSize({
      width: params.width,
    });

    let outputPath: string | undefined;

    if (outputType === 'file' && 'outputDir' in params) {
      if (!params.outputDir) throw new Error('outputDir should not be empty');
      if (!params.imageName) throw new Error('imageName should not be empty');

      outputPath = this.generateImagePath({
        imageName: params.imageName,
        widthAndSize: targetSize,
        format,
        outputDir: params.outputDir,
        postfix: params.postfix,
      });
    }

    const resizedImageBuffer = await this.resizeImage({
      inputBuffer,
      width: targetSize.width,
      format,
    });

    if (outputType === 'file') {
      if (!outputPath) throw new Error('Could not generate output path');

      await sharp(resizedImageBuffer).toFile(outputPath);

      return outputPath as InferScaleImageReturnType<T>;
    }

    return resizedImageBuffer as InferScaleImageReturnType<T>;
  }

  async scaleOrGetExisting<T extends ScaleOrGetExistingParams>(params: T): Promise<InferScaleImageReturnType<T>> {
    const { outputDir, imageName, width, outputType, format = 'webp' } = params;

    if (!imageName) throw new Error('imageName should not be empty');

    const targetSize = this.selectSize({ width });

    const outputPath = this.generateImagePath({
      imageName,
      widthAndSize: targetSize,
      format,
      outputDir,
    });

    if (fs.existsSync(outputPath)) {
      if (outputType === 'file') {
        return outputPath as InferScaleImageReturnType<T>;
      }

      return fs.readFileSync(outputPath) as InferScaleImageReturnType<T>;
    }

    const scaled = await this.scale(params);

    if (params.outputType === 'buffer') {
      await sharp(scaled).toFile(outputPath);
    }

    return scaled;
  }
}
