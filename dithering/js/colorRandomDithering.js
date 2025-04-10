/**
 * Color Random-Ordered dithering implementation
 * This algorithm applies random dithering to each RGB channel separately
 * @param {ImageData} imageData - The image data to process
 * @param {number} scale - Scaling factor for threshold (higher values = less dithering)
 */
function colorRandomDithering(imageData, scale) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Create separate buffers for each color channel
  const redBuffer = new Array(width * height);
  const greenBuffer = new Array(width * height);
  const blueBuffer = new Array(width * height);
  
  // Extract color channels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      redBuffer[y * width + x] = data[idx];
      greenBuffer[y * width + x] = data[idx + 1];
      blueBuffer[y * width + x] = data[idx + 2];
    }
  }
  
  // Apply random dithering to each channel
  ditherChannelRandom(redBuffer, width, height, scale);
  ditherChannelRandom(greenBuffer, width, height, scale);
  ditherChannelRandom(blueBuffer, width, height, scale);
  
  // Copy back to image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = redBuffer[y * width + x];
      data[idx + 1] = greenBuffer[y * width + x];
      data[idx + 2] = blueBuffer[y * width + x];
    }
  }
}

/**
 * Apply random dithering to a single channel
 * @param {Array} buffer - The channel buffer
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} scale - Threshold scaling factor
 */
function ditherChannelRandom(buffer, width, height, scale) {
  // Define color palette (for this example, we use 0 and 255)
  const palette = [0, 255];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];
      
      // Generate random threshold scaled by the scale factor
      const threshold = Math.random() * 255 * scale;
      
      // Apply threshold to determine output pixel
      buffer[idx] = oldPixel < threshold ? palette[0] : palette[1];
    }
  }
}

/**
 * Enhanced color Random dithering with customizable color palette
 * @param {ImageData} imageData - The image data to process
 * @param {number} scale - Scaling factor for threshold
 * @param {number} levels - Number of color levels per channel (2-8)
 */
function colorRandomWithPalette(imageData, scale, levels = 2) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Create color palette with specified number of levels
  const palette = [];
  for (let i = 0; i < levels; i++) {
    palette.push(Math.round((i / (levels - 1)) * 255));
  }
  
  // Create separate buffers for each color channel
  const redBuffer = new Array(width * height);
  const greenBuffer = new Array(width * height);
  const blueBuffer = new Array(width * height);
  
  // Extract color channels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      redBuffer[y * width + x] = data[idx];
      greenBuffer[y * width + x] = data[idx + 1];
      blueBuffer[y * width + x] = data[idx + 2];
    }
  }
  
  // Apply random dithering to each channel with the palette
  ditherChannelRandomWithPalette(redBuffer, width, height, scale, palette);
  ditherChannelRandomWithPalette(greenBuffer, width, height, scale, palette);
  ditherChannelRandomWithPalette(blueBuffer, width, height, scale, palette);
  
  // Copy back to image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = redBuffer[y * width + x];
      data[idx + 1] = greenBuffer[y * width + x];
      data[idx + 2] = blueBuffer[y * width + x];
    }
  }
}

/**
 * Apply random dithering to a single channel with custom palette
 * @param {Array} buffer - The channel buffer
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} scale - Threshold scaling factor
 * @param {Array} palette - Color palette to use
 */
function ditherChannelRandomWithPalette(buffer, width, height, scale, palette) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];
      
      // Generate random threshold
      const threshold = Math.random() * 255 * scale;
      
      // Find the appropriate palette color based on the threshold
      const paletteIndex = Math.floor((threshold / 255) * palette.length);
      const clampedIndex = Math.min(paletteIndex, palette.length - 1);
      
      // Set the new pixel value
      buffer[idx] = palette[clampedIndex];
    }
  }
}

export {
  colorRandomDithering,
  colorRandomWithPalette
};