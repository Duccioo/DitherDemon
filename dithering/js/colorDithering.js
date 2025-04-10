/**
 * Color Floyd-Steinberg dithering implementation
 * This algorithm applies dithering to each RGB channel separately
 * @param {ImageData} imageData - The image data to process
 * @param {number} scale - Scaling factor for error diffusion (higher values = less dithering)
 */
function colorFloydSteinbergDithering(imageData, scale) {
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
  
  // Apply Floyd-Steinberg dithering to each channel
  ditherChannel(redBuffer, width, height, scale);
  ditherChannel(greenBuffer, width, height, scale);
  ditherChannel(blueBuffer, width, height, scale);
  
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
 * Apply Floyd-Steinberg dithering to a single channel
 * @param {Array} buffer - The channel buffer
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} scale - Error scaling factor
 */
function ditherChannel(buffer, width, height, scale) {
  // Define color palette (for this example, we use 0 and 255)
  // For more colors, you could use [0, 85, 170, 255] or another palette
  const palette = [0, 255];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];
      
      // Find the closest palette color
      let newPixel = palette[0];
      let minDistance = Math.abs(oldPixel - palette[0]);
      
      for (let i = 1; i < palette.length; i++) {
        const distance = Math.abs(oldPixel - palette[i]);
        if (distance < minDistance) {
          minDistance = distance;
          newPixel = palette[i];
        }
      }
      
      // Set the new pixel value
      buffer[idx] = newPixel;
      
      // Calculate the error
      const error = (oldPixel - newPixel) / scale;
      
      // Distribute the error to neighboring pixels
      if (x + 1 < width) {
        buffer[idx + 1] += error * 7/16;
      }
      
      if (y + 1 < height) {
        if (x - 1 >= 0) {
          buffer[(y + 1) * width + (x - 1)] += error * 3/16;
        }
        
        buffer[(y + 1) * width + x] += error * 5/16;
        
        if (x + 1 < width) {
          buffer[(y + 1) * width + (x + 1)] += error * 1/16;
        }
      }
    }
  }
}

/**
 * Enhanced color Floyd-Steinberg with customizable color palette
 * @param {ImageData} imageData - The image data to process
 * @param {number} scale - Scaling factor for error diffusion
 * @param {number} levels - Number of color levels per channel (2-8)
 */
function colorFloydSteinbergWithPalette(imageData, scale, levels = 2) {
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
  
  // Apply Floyd-Steinberg dithering to each channel with the palette
  ditherChannelWithPalette(redBuffer, width, height, scale, palette);
  ditherChannelWithPalette(greenBuffer, width, height, scale, palette);
  ditherChannelWithPalette(blueBuffer, width, height, scale, palette);
  
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
 * Apply Floyd-Steinberg dithering to a single channel with custom palette
 * @param {Array} buffer - The channel buffer
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} scale - Error scaling factor
 * @param {Array} palette - Color palette to use
 */
function ditherChannelWithPalette(buffer, width, height, scale, palette) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];
      
      // Find the closest palette color
      let newPixel = palette[0];
      let minDistance = Math.abs(oldPixel - palette[0]);
      
      for (let i = 1; i < palette.length; i++) {
        const distance = Math.abs(oldPixel - palette[i]);
        if (distance < minDistance) {
          minDistance = distance;
          newPixel = palette[i];
        }
      }
      
      // Set the new pixel value
      buffer[idx] = newPixel;
      
      // Calculate the error
      const error = (oldPixel - newPixel) / scale;
      
      // Distribute the error to neighboring pixels
      if (x + 1 < width) {
        buffer[idx + 1] += error * 7/16;
      }
      
      if (y + 1 < height) {
        if (x - 1 >= 0) {
          buffer[(y + 1) * width + (x - 1)] += error * 3/16;
        }
        
        buffer[(y + 1) * width + x] += error * 5/16;
        
        if (x + 1 < width) {
          buffer[(y + 1) * width + (x + 1)] += error * 1/16;
        }
      }
    }
  }
}

export {
  colorFloydSteinbergDithering,
  colorFloydSteinbergWithPalette
};