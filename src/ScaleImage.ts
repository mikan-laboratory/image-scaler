import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import {
  WidthHeightAndSize,
  Sizes,
  ScaleImageParams,
  InferScaleImageReturnType,
  WidthAndHeight,
  GeneratePostfixParams,
} from './types';
import { DEFAULT_SIZES } from './constants';

export class ScaleImage {
  sizes: WidthHeightAndSize[] = [];

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

  private async resizeImage(
    inputBuffer: Buffer,
    width: number,
    height: number,
    format: 'webp' | 'jpeg' | 'png',
  ): Promise<Buffer> {
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width!;
    const originalHeight = metadata.height!;

    const widthRatio = width / originalWidth;
    const heightRatio = height / originalHeight;
    const resizeRatio = Math.min(widthRatio, heightRatio);

    const targetWidth = Math.round(originalWidth * resizeRatio);
    const targetHeight = Math.round(originalHeight * resizeRatio);

    const resizedImageBuffer = await sharp(inputBuffer)
      .resize(targetWidth, targetHeight, {
        withoutEnlargement: true,
      })
      .toFormat(format)
      .toBuffer();

    return resizedImageBuffer;
  }

  private selectSize(params: WidthAndHeight): WidthHeightAndSize {
    for (const size of this.sizes) {
      if (size.width <= params.width) {
        return size;
      }
    }
    return this.sizes[this.sizes.length - 1];
  }

  private getPostfixFormat(params: { postfix?: 'size' | 'wxh' }): 'size' | 'wxh' {
    return params.postfix ?? 'size';
  }

  private generatePostfix(params: GeneratePostfixParams): string {
    if (params.format === 'size') return params.size.size;

    return `${params.size.width}x${params.size.height}`;
  }

  private generateImagePath(params: {
    outputDir: string;
    imageName: string;
    size: WidthHeightAndSize;
    format: string;
    postfix?: 'size' | 'wxh';
  }): string {
    const postfixFormat = this.getPostfixFormat(params);

    const postfix = this.generatePostfix({
      format: postfixFormat,
      size: params.size,
    });

    return path.join(params.outputDir, `${params.imageName}-${postfix}.${params.format}`);
  }

  async scale<T extends ScaleImageParams>(params: T): Promise<InferScaleImageReturnType<T>> {
    const { outputType } = params;

    let inputBuffer: Buffer;
    if ('filePath' in params) {
      inputBuffer = fs.readFileSync(params.filePath);
    } else if ('url' in params) {
      inputBuffer = await this.downloadImage(params.url);
    } else {
      throw new Error('Invalid input parameters.');
    }

    const targetSize = this.selectSize({
      width: params.width,
      height: params.height,
    });

    const format = 'webp';

    let outputPath: string | undefined;
    if (outputType === 'file' && 'outputDir' in params && 'imageName' in params) {
      outputPath = this.generateImagePath({
        ...params,
        size: targetSize,
        format,
        outputDir: params.outputDir,
      });
    }

    const resizedImageBuffer = await this.resizeImage(inputBuffer, targetSize.width, targetSize.height, format);

    if (outputType === 'buffer') {
      return resizedImageBuffer as InferScaleImageReturnType<T>;
    } else if (outputPath) {
      await sharp(resizedImageBuffer).toFile(outputPath);

      return outputPath as InferScaleImageReturnType<T>;
    } else {
      throw new Error('Output directory must be provided for file output.');
    }
  }

  async scaleOrGetExisting<T extends ScaleImageParams & { outputDir: string }>(
    params: T,
  ): Promise<InferScaleImageReturnType<T>> {
    const { outputDir, imageName, width, height, outputType } = params;

    const targetSize = this.selectSize({ width, height });
    const format = 'webp';

    const outputPath = this.generateImagePath({
      imageName,
      size: targetSize,
      format,
      outputDir,
    });

    if (fs.existsSync(outputPath)) {
      if (outputType === 'file') {
        return outputPath as InferScaleImageReturnType<T>;
      } else if (outputType === 'buffer') {
        const existingBuffer = fs.readFileSync(outputPath);
        return existingBuffer as InferScaleImageReturnType<T>;
      }
    }

    return this.scale(params);
  }
}
