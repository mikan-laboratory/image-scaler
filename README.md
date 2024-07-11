# Image Scaler

Image Scaler is a powerful Node.js package from [Mikan Labs](https://mikanlabs.com) designed to optimize images for web use. It automatically scales images to appropriate dimensions based on screen size and converts them to WebP format for improved efficiency.

## Features

- Automatically scales images to optimal dimensions for various screen sizes
- Converts images to WebP format for better compression and faster loading times
- Supports both local and remote images
- Provides options for custom sizing and output formats
- Efficient caching mechanism to avoid redundant processing

## Installation

Install the package using npm:

```bash
npm install @mikan-labs/image-scaler
```

## Usage

Here's a basic example of how to use Image Scaler:

```javascript
import { ImageScaler } from 'image-scaler';

const scaler = new ImageScaler();

// Scale a local image
const scaledLocalImage = await scaler.scale({
  filePath: './path/to/local/image.jpg',
  width: 1920,
  height: 1080,
  outputType: 'file',
  outputDir: './optimized',
  imageName: 'scaled-image',
});

console.log(`Scaled image saved to: ${scaledLocalImage}`);

// Scale a remote image
const scaledRemoteImage = await scaler.scale({
  url: 'https://example.com/image.jpg',
  width: 800,
  height: 600,
  outputType: 'buffer',
});

console.log(`Scaled image buffer size: ${scaledRemoteImage.length} bytes`);
```

## API

### `ImageScaler`

The main class for scaling images.

#### Constructor

```javascript
new ImageScaler(sizes?)
```

- `sizes` (optional): An object defining custom sizes. If not provided, the following default sizes are used:
  ```javascript
  small: { width: 640, height: 480 },
  medium: { width: 1280, height: 720 },
  large: { width: 1920, height: 1080 },
  xlarge: { width: 2560, height: 1440 },
  xxlarge: { width: 3840, height: 2160 },
  ```

#### Methods

##### `scale(params)`

Scales an image based on the provided parameters.

Parameters:

- `filePath` or `url`: Source of the image (local file path or remote URL)
- `width`: Target width
- `height`: Target height
- `outputType`: 'file' or 'buffer'
- `format` (optional): Output format (default: 'webp')
- `outputDir` (required for 'file' output): Directory to save the scaled image
- `imageName` (required for 'file' output): Name for the output file

Returns:

- For 'file' output: Path to the saved file
- For 'buffer' output: Buffer containing the scaled image

##### `scaleOrGetExisting(params)`

Checks if a scaled version of the image already exists. If it does, returns the existing file; otherwise, scales the image.

Parameters:

- Same as `scale()`, but `outputDir` and `imageName` are always required

Returns:

- Path to the existing or newly scaled image file
