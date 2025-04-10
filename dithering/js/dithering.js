/**
 * General error diffusion dithering function
 * @param {Uint8Array} buffer - Input image data buffer (grayscale values 0-255)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Array} diffusionMatrix - Error diffusion matrix as array of [dy, dx, weight] entries
 * @returns {Uint8Array} Dithered image data
 */
function errorDiffusionDithering(buffer, width, height, diffusionMatrix) {
  // Create a copy of the buffer to avoid modifying the original
  const result = new Uint8Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i];
  }

  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // Get original pixel value
      const oldPixel = result[idx];

      // Find the nearest palette color (0 or 255 for binary dithering)
      const newPixel = oldPixel < 128 ? 0 : 255;

      // Set the new pixel value
      result[idx] = newPixel;

      // Calculate the error
      const error = oldPixel - newPixel;

      // Distribute the error according to the diffusion matrix
      for (const [dy, dx, weight] of diffusionMatrix) {
        const newY = y + dy;
        const newX = x + dx;

        if (newY >= 0 && newY < height && newX >= 0 && newX < width) {
          const newIdx = newY * width + newX;
          result[newIdx] = Math.max(
            0,
            Math.min(255, result[newIdx] + error * weight)
          );
        }
      }
    }
  }

  return result;
}

function floydSteinbergDithering(buffer, width, height, scale) {
  const threshold = 128;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];
      const newPixel = oldPixel < threshold ? 0 : 255;
      buffer[idx] = newPixel;

      const error = (oldPixel - newPixel) / scale;

      if (x + 1 < width) buffer[idx + 1] += (error * 7) / 16;
      if (x - 1 >= 0 && y + 1 < height)
        buffer[(y + 1) * width + (x - 1)] += (error * 3) / 16;
      if (y + 1 < height) buffer[(y + 1) * width + x] += (error * 5) / 16;
      if (x + 1 < width && y + 1 < height)
        buffer[(y + 1) * width + (x + 1)] += (error * 1) / 16;
    }
  }
}

function bayerDithering(buffer, width, height, scale, matrixSize = 8) {
  // Creiamo una matrice di Bayer della dimensione specificata
  // Una matrice NxN ha valori da 0 a N²-1
  // Supportiamo dimensioni 2x2, 4x4, 8x8 e 16x16 (tutte potenze di 2)
  const bayerMatrix = createBayerMatrix(matrixSize);

  // Scaling factor per il controllo della densità del dithering
  // Valori più alti di 'scale' rendono l'immagine più scura
  const scaleFactor = scale;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // Otteniamo il valore di soglia normalizzato dalla matrice di Bayer
      // e lo applichiamo in base al fattore di scala
      const thresholdValue = bayerMatrix[y % matrixSize][x % matrixSize];
      const normalizedThreshold =
        (thresholdValue / (matrixSize * matrixSize)) * 255;

      // Applichiamo il fattore di scala, permettendo valori di soglia più alti o più bassi
      // Il range viene regolato per mantenere risultati visivamente coerenti
      const adjustedThreshold = normalizedThreshold / scaleFactor;

      // Confrontiamo il pixel con la soglia calcolata
      buffer[idx] = buffer[idx] < adjustedThreshold ? 0 : 255;
    }
  }
}

/**
 * Crea una matrice di Bayer di dimensione size x size.
 * @param {number} size - La dimensione della matrice (deve essere una potenza di 2)
 * @returns {number[][]} - La matrice di Bayer
 */
function createBayerMatrix(size) {
  // Verifichiamo che size sia una potenza di 2
  if (size & (size - 1)) {
    // Se non è una potenza di 2, usiamo la più vicina potenza di 2 inferiore
    size = Math.pow(2, Math.floor(Math.log2(size)));
  }

  if (size === 2) {
    // Matrice base 2x2 di Bayer
    return [
      [0, 2],
      [3, 1],
    ];
  }

  // Costruzione ricorsiva della matrice
  const halfSize = size / 2;
  const smallerMatrix = createBayerMatrix(halfSize);

  // Allocazione della nuova matrice
  const result = Array(size)
    .fill()
    .map(() => Array(size).fill(0));

  // Riempimento delle 4 sottomatrici secondo la definizione ricorsiva di Bayer
  for (let y = 0; y < halfSize; y++) {
    for (let x = 0; x < halfSize; x++) {
      const value = smallerMatrix[y][x];

      // Quadrante in alto a sinistra: 4*M + 0
      result[y][x] = 4 * value + 0;

      // Quadrante in alto a destra: 4*M + 2
      result[y][x + halfSize] = 4 * value + 2;

      // Quadrante in basso a sinistra: 4*M + 3
      result[y + halfSize][x] = 4 * value + 3;

      // Quadrante in basso a destra: 4*M + 1
      result[y + halfSize][x + halfSize] = 4 * value + 1;
    }
  }

  return result;
}

function randomDithering(buffer, width, height, scale) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const threshold = Math.random() * 255 * scale;

      buffer[idx] = buffer[idx] < threshold ? 0 : 255;
    }
  }
}

function atkinsonDithering(buffer, width, height, scale) {
  // Soglia per la binarizzazione
  const threshold = 128;

  // Coefficienti di diffusione Atkinson
  // Ogni pixel riceve 1/8 dell'errore, per un totale di 6/8 (il resto viene scartato)
  const coefficients = [
    {dx: 1, dy: 0, weight: 1 / 8}, // destra
    {dx: 2, dy: 0, weight: 1 / 8}, // due a destra
    {dx: -1, dy: 1, weight: 1 / 8}, // diagonale sinistra-sotto
    {dx: 0, dy: 1, weight: 1 / 8}, // sotto
    {dx: 1, dy: 1, weight: 1 / 8}, // diagonale destra-sotto
    {dx: 0, dy: 2, weight: 1 / 8}, // due sotto
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];

      // Binarizzazione del pixel corrente
      const newPixel = oldPixel < threshold ? 0 : 255;
      buffer[idx] = newPixel;

      // Calcolo dell'errore di quantizzazione
      // Applicazione del fattore di scala per controllare l'intensità
      const error = (oldPixel - newPixel) / scale;

      // Diffusione dell'errore ai pixel vicini secondo i coefficienti
      for (const {dx, dy, weight} of coefficients) {
        const nx = x + dx;
        const ny = y + dy;

        // Verifica che il pixel vicino sia all'interno dell'immagine
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborIdx = ny * width + nx;
          buffer[neighborIdx] += error * weight;
        }
      }
    }
  }
}
function jarvisJudiceNinkeDithering(buffer, width, height, scale) {
  const threshold = 128;

  // Coefficienti di diffusione Jarvis, Judice & Ninke
  const coefficients = [
    // Riga corrente
    {dx: 1, dy: 0, weight: 7 / 48},
    {dx: 2, dy: 0, weight: 5 / 48},

    // Prima riga sotto
    {dx: -2, dy: 1, weight: 3 / 48},
    {dx: -1, dy: 1, weight: 5 / 48},
    {dx: 0, dy: 1, weight: 7 / 48},
    {dx: 1, dy: 1, weight: 5 / 48},
    {dx: 2, dy: 1, weight: 3 / 48},

    // Seconda riga sotto
    {dx: -2, dy: 2, weight: 1 / 48},
    {dx: -1, dy: 2, weight: 3 / 48},
    {dx: 0, dy: 2, weight: 5 / 48},
    {dx: 1, dy: 2, weight: 3 / 48},
    {dx: 2, dy: 2, weight: 1 / 48},
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];

      // Binarizzazione del pixel corrente
      const newPixel = oldPixel < threshold ? 0 : 255;
      buffer[idx] = newPixel;

      // Calcolo dell'errore di quantizzazione
      const error = (oldPixel - newPixel) / scale;

      // Diffusione dell'errore ai pixel vicini
      for (const {dx, dy, weight} of coefficients) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborIdx = ny * width + nx;
          buffer[neighborIdx] += error * weight;
        }
      }
    }
  }
}

/**
 * Implementazione dell'algoritmo di dithering Stucki.
 *
 * Evoluzione dell'algoritmo Jarvis-Judice-Ninke con valori frazionari
 * più semplici da calcolare. Diffonde l'errore con il seguente pattern:
 *
 *          X   8/42 4/42
 *     2/42 4/42 8/42 4/42 2/42
 *     1/42 2/42 4/42 2/42 1/42
 *
 * @param {Uint8Array|Array} buffer - Array di pixel in scala di grigi
 * @param {number} width - Larghezza dell'immagine
 * @param {number} height - Altezza dell'immagine
 * @param {number} scale - Fattore di scala per l'errore
 */
function stuckiDithering(buffer, width, height, scale) {
  const threshold = 128;

  // Coefficienti di diffusione Stucki
  const coefficients = [
    // Riga corrente
    {dx: 1, dy: 0, weight: 8 / 42},
    {dx: 2, dy: 0, weight: 4 / 42},

    // Prima riga sotto
    {dx: -2, dy: 1, weight: 2 / 42},
    {dx: -1, dy: 1, weight: 4 / 42},
    {dx: 0, dy: 1, weight: 8 / 42},
    {dx: 1, dy: 1, weight: 4 / 42},
    {dx: 2, dy: 1, weight: 2 / 42},

    // Seconda riga sotto
    {dx: -2, dy: 2, weight: 1 / 42},
    {dx: -1, dy: 2, weight: 2 / 42},
    {dx: 0, dy: 2, weight: 4 / 42},
    {dx: 1, dy: 2, weight: 2 / 42},
    {dx: 2, dy: 2, weight: 1 / 42},
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = buffer[idx];

      // Binarizzazione del pixel corrente
      const newPixel = oldPixel < threshold ? 0 : 255;
      buffer[idx] = newPixel;

      // Calcolo dell'errore di quantizzazione
      const error = (oldPixel - newPixel) / scale;

      // Diffusione dell'errore ai pixel vicini
      for (const {dx, dy, weight} of coefficients) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborIdx = ny * width + nx;
          buffer[neighborIdx] += error * weight;
        }
      }
    }
  }
}

/**
 * Burkes Dithering
 * A simplified version of Jarvis-Judice-Ninke that uses 7 pixels
 */
function burkesDithering(buffer, width, height, scale = 1) {
  const adjustedScale = Math.max(0.1, Math.min(2.0, scale));

  const diffusionMatrix = [
    [0, 1, (8 / 32) * adjustedScale],
    [0, 2, (4 / 32) * adjustedScale],
    [1, -2, (2 / 32) * adjustedScale],
    [1, -1, (4 / 32) * adjustedScale],
    [1, 0, (8 / 32) * adjustedScale],
    [1, 1, (4 / 32) * adjustedScale],
    [1, 2, (2 / 32) * adjustedScale],
  ];

  return errorDiffusionDithering(buffer, width, height, diffusionMatrix);
}

function sierraDithering(buffer, width, height, scale) {
  const threshold = 128;

  // Coefficienti
}

export {
  floydSteinbergDithering,
  bayerDithering,
  randomDithering,
  atkinsonDithering,
  jarvisJudiceNinkeDithering,
  stuckiDithering,
  burkesDithering,
  sierraDithering,
};
