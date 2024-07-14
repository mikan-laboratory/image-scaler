# Image Scaler

Image Scaler is a powerful Node.js package from [Mikan Labs](https://mikanlabs.com) designed to optimize images for web use. It automatically scales images to appropriate dimensions based on screen size and converts them to WebP format for improved efficiency.

## Features

- Automatically scales images to optimal dimensions for various screen sizes
- Converts images to WebP format for better compression and faster loading times
- Supports both local and remote images
- Provides options for custom sizing and output formats
- Caching to avoid redundant processing

## Installation

Install the package using npm:

```bash
npm install @mikan-labs/image-scaler
```

## Usage

Here's a basic example of how to use Image Scaler:

```javascript
import { ImageScaler } from '@mikan-labs/image-scaler';

const scaler = new ImageScaler();

// Scale a local image
const scaledLocalImage = await scaler.scale({
  filePath: './path/to/local/image.jpg',
  width: 1920,
  outputType: 'file',
  outputDir: './optimized',
  imageName: 'scaled-image',
});

console.log(`Scaled image saved to: ${scaledLocalImage}`);

// Scale a remote image
const scaledRemoteImage = await scaler.scale({
  url: 'https://example.com/image.jpg',
  width: 800,
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
  xs: { width: 360 }, // Extra small devices (portrait phones)
  sm: { width: 640 }, // Small devices (landscape phones)
  md: { width: 768 }, // Medium devices (tablets)
  lg: { width: 1024 }, // Large devices (desktops)
  xl: { width: 1366 }, // Extra large devices (large desktops)
  fhd: { width: 1920 }, // Full HD (1080p monitors)
  qhd: { width: 2560 }, // Quad HD (2K monitors)
  uhd: { width: 3840 }, // Ultra HD (4K monitors)
  ```

#### Methods

##### `scale(params)`

Scales an image based on the provided parameters.

Parameters:

- `filePath` or `url`: Source of the image (local file path or remote URL)
- `width`: Target width
- `outputType`: 'file' or 'buffer'
- `format` (optional): Output format (default: 'webp')
- `outputDir` (required for 'file' output): Directory to save the scaled image
- `imageName` (required for 'file' output): Name for the output file
- `postfix` (optional for 'file' output): Postfix format for the output filename (default: 'size')

  - Options:
    - `'size'`: Uses the size name as the postfix (e.g., `image-md.webp`)
    - `'w'`: Uses the actual width and height as the postfix (e.g., `image-w=800.webp`)

Returns:

- For 'file' output: Path to the saved file
- For 'buffer' output: Buffer containing the scaled image

##### `scaleOrGetExisting(params)`

Checks if a scaled version of the image already exists. If it does, returns the existing file; otherwise, scales the image.

Parameters:

- Same as `scale()`, but `outputDir` and `imageName` are always required

Returns:

- Same as `scale()`
