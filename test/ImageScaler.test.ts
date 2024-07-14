import { ImageScaler } from '../src/ImageScaler';
import * as fs from 'fs';
import * as path from 'path';
import { exec, ChildProcess } from 'child_process';
import { TEST_SERVER_PORT, TEST_LOCAL_IMAGE_NAME, TEST_REMOTE_IMAGE_NAME } from '../util/constants';
import { Sizes } from '../src/types';
import { getDirname } from '../util/getDirname';

const __dirname = getDirname(import.meta.url);

describe('ImageScaler (integration tests)', () => {
  const testImagePath = path.join(__dirname, 'images', 'input', `${TEST_LOCAL_IMAGE_NAME}.png`);
  const outputDir = path.join(__dirname, 'images', 'output');
  const testImageURL = `http://127.0.0.1:${TEST_SERVER_PORT}/${TEST_REMOTE_IMAGE_NAME}.webp`;
  let serverProcess: ChildProcess;
  const scaler = new ImageScaler();

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      serverProcess = exec('npm run serve');
      serverProcess.stdout?.on('data', (data) => {
        if (data.includes('Test image server running')) {
          resolve();
        }
      });
    });
  });

  afterEach(() => {
    const files = fs.readdirSync(outputDir);

    for (const file of files) {
      fs.unlinkSync(path.join(outputDir, file));
    }
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      if (serverProcess) {
        serverProcess.kill('SIGTERM');
        serverProcess.on('exit', () => {
          fs.rmdirSync(outputDir, { recursive: true });
          resolve();
        });
      } else {
        resolve();
      }
    });
  });

  it('should initialize sizes correctly', () => {
    expect(scaler.sizes).toEqual([
      { size: 'xs', width: 360 },
      { size: 'sm', width: 640 },
      { size: 'md', width: 768 },
      { size: 'lg', width: 1024 },
      { size: 'xl', width: 1366 },
      { size: 'fhd', width: 1920 },
      { size: 'qhd', width: 2560 },
      { size: 'uhd', width: 3840 },
    ]);
  });

  it('should create image with w postfix', async () => {
    const filePath = await scaler.scale({
      filePath: testImagePath,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
      postfix: 'w',
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-w=360.webp`);

    expect(filePath).toBe(expectedPath);
  });

  it('should support converting to other formats', async () => {
    const filePath = await scaler.scale({
      filePath: testImagePath,
      width: 640,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
      format: 'jpeg',
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-sm.jpeg`);

    expect(filePath).toBe(expectedPath);
  });

  it('should select the correct size', async () => {
    const filePath = await scaler.scale({
      filePath: testImagePath,
      width: 1366,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-xl.webp`);

    expect(filePath).toBe(expectedPath);
  });

  it('should handle custom sizes', async () => {
    const ALTERNATIVE_SIZES: Sizes = {
      tiny: { width: 320 },
      small: { width: 800 },
      medium: { width: 1366 },
      large: { width: 1920 },
      xlarge: { width: 2560 },
      ultrawide: { width: 3440 },
    };

    const customScaler = new ImageScaler(ALTERNATIVE_SIZES);

    const filePath = await customScaler.scale({
      filePath: testImagePath,
      width: 3440,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-ultrawide.webp`);

    expect(filePath).toBe(expectedPath);
  });

  it('should resize a local image and return the buffer', async () => {
    const result = await scaler.scale({
      filePath: testImagePath,
      width: 360,
      outputType: 'buffer',
    });

    expect(result).toBeInstanceOf(Buffer);
  });

  it('should resize a local image and save to file', async () => {
    const result = await scaler.scale({
      filePath: testImagePath,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-xs.webp`);

    expect(result).toBe(expectedPath);
    expect(fs.existsSync(expectedPath)).toBe(true);
  });

  it('should resize a remote image and return the buffer', async () => {
    const result = await scaler.scale({
      url: testImageURL,
      width: 360,
      outputType: 'buffer',
    });

    expect(result).toBeInstanceOf(Buffer);
  });

  it('should resize a remote image and save to file', async () => {
    const result = await scaler.scale({
      url: testImageURL,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_REMOTE_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_REMOTE_IMAGE_NAME}-xs.webp`);

    expect(result).toBe(expectedPath);
    expect(fs.existsSync(expectedPath)).toBe(true);
  });

  it('should scale or get existing local image', async () => {
    // First run to scale and save the image
    const firstResult = await scaler.scaleOrGetExisting({
      filePath: testImagePath,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-xs.webp`);

    expect(firstResult).toBe(expectedPath);
    expect(fs.existsSync(expectedPath)).toBe(true);

    // Second run to get the existing image
    const secondResult = await scaler.scaleOrGetExisting({
      filePath: testImagePath,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    expect(secondResult).toBe(expectedPath);
  });

  it('should scale or get existing remote image', async () => {
    // First run to scale and save the image
    const firstResult = await scaler.scaleOrGetExisting({
      url: testImageURL,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_REMOTE_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_REMOTE_IMAGE_NAME}-xs.webp`);

    expect(firstResult).toBe(expectedPath);
    expect(fs.existsSync(expectedPath)).toBe(true);

    // Second run to get the existing image
    const secondResult = await scaler.scaleOrGetExisting({
      url: testImageURL,
      width: 360,
      outputType: 'file',
      outputDir,
      imageName: TEST_REMOTE_IMAGE_NAME,
    });

    expect(secondResult).toBe(expectedPath);
  });

  it('should save buffer request to file on scaleOrGetExisting', async () => {
    const firstResult = await scaler.scaleOrGetExisting({
      filePath: testImagePath,
      width: 360,
      outputType: 'buffer',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    const expectedPath = path.join(outputDir, `${TEST_LOCAL_IMAGE_NAME}-xs.webp`);

    expect(firstResult).toBeInstanceOf(Buffer);
    expect(fs.existsSync(expectedPath)).toBe(true);

    // Second run to get the existing image
    const secondResult = await scaler.scaleOrGetExisting({
      filePath: testImagePath,
      width: 360,
      outputType: 'buffer',
      outputDir,
      imageName: TEST_LOCAL_IMAGE_NAME,
    });

    expect(secondResult).toBeInstanceOf(Buffer);
  });
});
