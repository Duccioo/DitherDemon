import {
  floydSteinbergDithering,
  bayerDithering,
  randomDithering,
  atkinsonDithering,
  jarvisJudiceNinkeDithering,
  stuckiDithering,
  burkesDithering,
  sierraDithering,
} from "./dithering.js";

import {
  colorFloydSteinbergDithering,
  colorFloydSteinbergWithPalette,
} from "./colorDithering.js";

import {
  colorRandomDithering,
  colorRandomWithPalette,
} from "./colorRandomDithering.js";

import {applyBorder} from "./border.js";

// Image Processing Functions

function applyContrast(data, factor) {
  const factor128 = 128 * (1 - factor);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * factor + factor128;
    data[i + 1] = data[i + 1] * factor + factor128;
    data[i + 2] = data[i + 2] * factor + factor128;
  }
}

function applyMidtone(data, value) {
  const lookupTable = new Array(256);

  for (let i = 0; i < 256; i++) {
    lookupTable[i] = Math.pow(i / 255, 1 / value) * 255;
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i] = lookupTable[data[i]];
    data[i + 1] = lookupTable[data[i + 1]];
    data[i + 2] = lookupTable[data[i + 2]];
  }
}

function applyHighlights(data, value) {
  const threshold = 192; // High value threshold
  const factor = value / 100;

  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      if (data[i + j] > threshold) {
        data[i + j] = threshold + (data[i + j] - threshold) * factor;
      }
    }
  }
}

function applyLuminanceThreshold(data, value) {
  const threshold = value * 2.55; // Convert percentage to 0-255 range

  for (let i = 0; i < data.length; i += 4) {
    const luminance =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (luminance > threshold) {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
}

function applyGaussianNoise(data, intensity) {
  for (let i = 0; i < data.length; i += 4) {
    // Generate random noise for each channel
    const noise = () => (Math.random() - 0.5) * 2 * 255 * intensity;

    data[i] = Math.min(Math.max(data[i] + noise(), 0), 255);
    data[i + 1] = Math.min(Math.max(data[i + 1] + noise(), 0), 255);
    data[i + 2] = Math.min(Math.max(data[i + 2] + noise(), 0), 255);
  }
}

function applySaltPepperNoise(data, intensity) {
  for (let i = 0; i < data.length; i += 4) {
    // Apply salt and pepper noise with probability based on intensity
    if (Math.random() < intensity) {
      // 50% chance for salt (white) or pepper (black)
      const value = Math.random() < 0.5 ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = value;
    }
  }
}

function applyColorInversion(data) {
  for (let i = 0; i < data.length; i += 4) {
    // Invert each RGB channel (255 - value)
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
    // Alpha channel remains unchanged
  }
}

function applyDithering(imageData, type, scale, bayerMatrixSize = 8) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // If type is 'none', don't apply any dithering
  if (type === "none") {
    return;
  }

  // Handle color dithering separately
  if (type === "color-floyd-steinberg") {
    colorFloydSteinbergDithering(imageData, scale);
    return;
  } else if (type === "color-floyd-steinberg-palette") {
    // Use 4 levels for a more colorful result
    colorFloydSteinbergWithPalette(imageData, scale, 4);
    return;
  } else if (type === "color-random") {
    colorRandomDithering(imageData, scale);
    return;
  } else if (type === "color-random-palette") {
    // Use 4 levels for a more colorful result
    colorRandomWithPalette(imageData, scale, 4);
    return;
  }

  // For other dithering types, convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Create buffer for processing
  const buffer = new Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      buffer[y * width + x] = data[idx];
    }
  }

  if (type === "floyd-steinberg") {
    floydSteinbergDithering(buffer, width, height, scale);
  } else if (type === "bayer") {
    bayerDithering(buffer, width, height, scale, bayerMatrixSize);
  } else if (type === "random") {
    randomDithering(buffer, width, height, scale);
  } else if (type === "atkinson") {
    atkinsonDithering(buffer, width, height, scale);
  } else if (type === "jarvis-judice-ninke") {
    jarvisJudiceNinkeDithering(buffer, width, height, scale);
  } else if (type === "stucki") {
    stuckiDithering(buffer, width, height, scale);
  } else if (type === "burkes") {
    burkesDithering(buffer, width, height, scale);
  } else if (type === "sierra") {
    sierraDithering(buffer, width, height, scale);
  }

  // Copy back to image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = buffer[y * width + x];
    }
  }
}

function applyBlur(data, width, height, intensity) {
  // Create a copy of the original data to read from
  const originalData = new Uint8ClampedArray(data);

  // Kernel size based on intensity (1-10)
  const kernelSize = Math.max(3, Math.min(11, Math.floor(intensity * 10) + 1));
  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;
      let count = 0;

      // Apply kernel
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const posX = Math.min(width - 1, Math.max(0, x + kx));
          const posY = Math.min(height - 1, Math.max(0, y + ky));

          const idx = (posY * width + posX) * 4;
          r += originalData[idx];
          g += originalData[idx + 1];
          b += originalData[idx + 2];
          count++;
        }
      }

      // Write averaged values
      const idx = (y * width + x) * 4;
      data[idx] = r / count;
      data[idx + 1] = g / count;
      data[idx + 2] = b / count;
    }
  }
}

function applyPixelate(data, width, height, intensity) {
  // Block size based on intensity (1-100)
  const blockSize = Math.max(1, Math.min(100, Math.floor(intensity * 100)));

  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data);

  // Process each block
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      // Calculate average color in this block
      let r = 0,
        g = 0,
        b = 0;
      let count = 0;

      // Sample the block
      for (let by = 0; by < blockSize && y + by < height; by++) {
        for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
          const idx = ((y + by) * width + (x + bx)) * 4;
          r += originalData[idx];
          g += originalData[idx + 1];
          b += originalData[idx + 2];
          count++;
        }
      }

      // Calculate average
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Apply the average color to all pixels in this block
      for (let by = 0; by < blockSize && y + by < height; by++) {
        for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
          const idx = ((y + by) * width + (x + bx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }
}

// Export functions
export {
  applyContrast,
  applyMidtone,
  applyHighlights,
  applyLuminanceThreshold,
  applyGaussianNoise,
  applySaltPepperNoise,
  applyColorInversion,
  applyBlur,
  applyPixelate,
  applyDithering,
  applyBorder,
};
