/**
 * Functions for adding borders to images
 */

/**
 * Applies a border to the image data
 * @param {ImageData} imageData - The image data to process
 * @param {Object} options - Border options
 * @param {number} options.thickness - Border thickness in pixels
 * @param {string} options.color - Border color in hex format
 * @param {boolean} options.doubleBorder - Whether to apply a double border
 * @param {string} options.secondColor - Second border color for double border
 * @param {number} options.secondThickness - Second border thickness for double border
 * @param {boolean} options.transparentBorder - Whether to apply border around transparent areas
 */
function applyBorder(imageData, options) {
  const {thickness, color, doubleBorder, secondColor, secondThickness} =
    options;
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Convert hex color to RGB
  const borderRGB = hexToRgb(color);

  // Check if image has transparency
  const hasTransparency = checkForTransparency(data);

  // Apply primary border
  if (hasTransparency) {
    applyBorderAroundTransparentAreas(
      data,
      width,
      height,
      thickness,
      borderRGB
    );
  } else {
    applyBorderToImageData(data, width, height, thickness, borderRGB);
  }

  // Apply secondary border if double border is enabled
  if (doubleBorder && secondThickness > 0) {
    const secondBorderRGB = hexToRgb(secondColor);
    // Apply second border inside the first one
    const innerOffset = thickness;

    if (hasTransparency) {
      applyInnerBorderAroundTransparentAreas(
        data,
        width,
        height,
        secondThickness,
        secondBorderRGB,
        innerOffset
      );
    } else {
      applyInnerBorderToImageData(
        data,
        width,
        height,
        secondThickness,
        secondBorderRGB,
        innerOffset
      );
    }
  }
}

/**
 * Applies a border with specified thickness and color to image data
 * @param {Uint8ClampedArray} data - The image data array
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} thickness - Border thickness in pixels
 * @param {Object} rgb - RGB color object {r, g, b}
 */
function applyBorderToImageData(data, width, height, thickness, rgb) {
  const {r, g, b} = rgb;

  // Optimize by only iterating through border areas instead of the entire image
  // Top and bottom borders (full width)
  for (let y = 0; y < thickness; y++) {
    // Top border
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }

    // Bottom border
    const bottomY = height - y - 1;
    for (let x = 0; x < width; x++) {
      const idx = (bottomY * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }

  // Left and right borders (excluding corners already processed)
  for (let y = thickness; y < height - thickness; y++) {
    // Left border
    for (let x = 0; x < thickness; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }

    // Right border
    for (let x = width - thickness; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }
}

/**
 * Applies an inner border with specified thickness and color to image data
 * @param {Uint8ClampedArray} data - The image data array
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} thickness - Border thickness in pixels
 * @param {Object} rgb - RGB color object {r, g, b}
 * @param {number} offset - Offset from the edge in pixels
 */
function applyInnerBorderToImageData(
  data,
  width,
  height,
  thickness,
  rgb,
  offset
) {
  const {r, g, b} = rgb;

  // Optimize by only iterating through inner border areas
  // Top and bottom inner borders (full width)
  for (let y = offset; y < offset + thickness; y++) {
    // Top inner border
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }

    // Bottom inner border
    const bottomY = height - offset - (y - offset) - 1;
    for (let x = 0; x < width; x++) {
      const idx = (bottomY * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }

  // Left and right inner borders (excluding corners already processed)
  for (let y = offset + thickness; y < height - offset - thickness; y++) {
    // Left inner border
    for (let x = offset; x < offset + thickness; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }

    // Right inner border
    for (let x = width - offset - thickness; x < width - offset; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }
}

/**
 * Converts a hex color string to RGB object
 * @param {string} hex - Hex color string (e.g., "#FF0000")
 * @returns {Object} RGB color object {r, g, b}
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return {r, g, b};
}

/**
 * Checks if the image data contains any transparent pixels
 * @param {Uint8ClampedArray} data - The image data array
 * @returns {boolean} True if the image has transparent pixels
 */
function checkForTransparency(data) {
  // Check for any pixel with alpha < 255
  // Use a faster loop with early return
  const length = data.length;
  for (let i = 3; i < length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

/**
 * Applies a border around transparent areas in the image
 * @param {Uint8ClampedArray} data - The image data array
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} thickness - Border thickness in pixels
 * @param {Object} rgb - RGB color object {r, g, b}
 */
function applyBorderAroundTransparentAreas(
  data,
  width,
  height,
  thickness,
  rgb
) {
  const {r, g, b} = rgb;

  // Create a map to track border pixels for better performance
  const borderPixels = new Set();

  // First pass: identify transparent pixels and their neighbors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // If this pixel is transparent, mark its non-transparent neighbors as border pixels
      if (data[idx + 3] === 0) {
        // Only check the immediate surrounding area to find non-transparent pixels
        const startY = Math.max(0, y - thickness);
        const endY = Math.min(height - 1, y + thickness);
        const startX = Math.max(0, x - thickness);
        const endX = Math.min(width - 1, x + thickness);

        for (let ty = startY; ty <= endY; ty++) {
          for (let tx = startX; tx <= endX; tx++) {
            const targetIdx = (ty * width + tx) * 4;
            // If this neighbor is not transparent, mark it as a border pixel
            if (data[targetIdx + 3] !== 0) {
              borderPixels.add(ty * width + tx);
            }
          }
        }
      }
    }
  }

  // Second pass: color all identified border pixels
  for (const pixelPos of borderPixels) {
    const idx = pixelPos * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    // Alpha remains unchanged
  }
}

/**
 * Applies an inner border around transparent areas in the image
 * @param {Uint8ClampedArray} data - The image data array
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} thickness - Border thickness in pixels
 * @param {Object} rgb - RGB color object {r, g, b}
 * @param {number} offset - Offset from the edge in pixels
 */
function applyInnerBorderAroundTransparentAreas(
  data,
  width,
  height,
  thickness,
  rgb,
  offset
) {
  const {r, g, b} = rgb;

  // Create a map to track potential border pixels and pixels within offset
  const borderPixels = new Set();
  const transparentNeighbors = new Map();

  // First pass: identify transparent pixels and their distances to non-transparent neighbors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // If this pixel is transparent, check its non-transparent neighbors
      if (data[idx + 3] === 0) {
        // Check surrounding area to find non-transparent pixels
        const maxDistance = offset + thickness;
        const startY = Math.max(0, y - maxDistance);
        const endY = Math.min(height - 1, y + maxDistance);
        const startX = Math.max(0, x - maxDistance);
        const endX = Math.min(width - 1, x + maxDistance);

        for (let ty = startY; ty <= endY; ty++) {
          for (let tx = startX; tx <= endX; tx++) {
            const targetIdx = (ty * width + tx) * 4;
            const pixelPos = ty * width + tx;

            // If this neighbor is not transparent
            if (data[targetIdx + 3] !== 0) {
              // Calculate Manhattan distance (faster than Euclidean)
              const distance = Math.abs(tx - x) + Math.abs(ty - y);

              // Store the minimum distance to a transparent pixel for each non-transparent pixel
              if (
                !transparentNeighbors.has(pixelPos) ||
                distance < transparentNeighbors.get(pixelPos)
              ) {
                transparentNeighbors.set(pixelPos, distance);
              }
            }
          }
        }
      }
    }
  }

  // Second pass: identify pixels that are within the inner border range
  for (const [pixelPos, distance] of transparentNeighbors.entries()) {
    // If the pixel is beyond the offset but within offset+thickness range
    if (distance > offset && distance <= offset + thickness) {
      borderPixels.add(pixelPos);
    }
  }

  // Third pass: color all identified border pixels
  for (const pixelPos of borderPixels) {
    const idx = pixelPos * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    // Alpha remains unchanged
  }
}

export {applyBorder};
