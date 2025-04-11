// Main application logic
import {
  applyContrast,
  applyMidtone,
  applyHighlights,
  applyLuminanceThreshold,
  applyGaussianNoise,
  applySaltPepperNoise,
  applyColorInversion,
  applyDithering,
  applyBlur,
  applyPixelate,
  applyBorder,
} from "./imageProcessing.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const uploadPrompt = document.getElementById("upload-prompt");
  const uploadButton = document.getElementById("upload-button");
  const imageInput = document.getElementById("image-input");
  const downloadButton = document.getElementById("download-button");
  const resetButton = document.getElementById("reset-button");
  const controlsPanel = document.getElementById("controls-panel");

  // Dithering elements
  const ditheringType = document.getElementById("dithering-type");
  const ditheringScale = document.getElementById("dithering-scale");
  const ditheringScaleValue = document.getElementById("dithering-scale-value");
  const bayerMatrixSizeControl = document.getElementById(
    "bayer-matrix-size-control"
  );
  const bayerMatrixSize = document.getElementById("bayer-matrix-size");

  // Adjustment elements
  const contrast = document.getElementById("contrast");
  const contrastValue = document.getElementById("contrast-value");
  const midtone = document.getElementById("midtone");
  const midtoneValue = document.getElementById("midtone-value");
  const highlights = document.getElementById("highlights");
  const highlightsValue = document.getElementById("highlights-value");
  const luminanceThreshold = document.getElementById("luminance-threshold");
  const luminanceThresholdValue = document.getElementById(
    "luminance-threshold-value"
  );

  // Noise filter elements
  const noiseFilterType = document.getElementById("noise-filter-type");
  const extraFilter = document.getElementById("extra-filter");
  const extraFilterValue = document.getElementById("extra-filter-value");
  const invertColors = document.getElementById("invert-colors");

  // Border elements
  const enableBorder = document.getElementById("enable-border");
  const borderControls = document.getElementById("border-controls");
  const borderThickness = document.getElementById("border-thickness");
  const borderThicknessValue = document.getElementById(
    "border-thickness-value"
  );
  const borderColor = document.getElementById("border-color");
  const doubleBorder = document.getElementById("double-border");
  const secondBorderControls = document.getElementById(
    "second-border-controls"
  );
  const secondBorderThickness = document.getElementById(
    "second-border-thickness"
  );
  const secondBorderThicknessValue = document.getElementById(
    "second-border-thickness-value"
  );
  const secondBorderColor = document.getElementById("second-border-color");

  // Undo/Redo and preset elements
  const undoButton = document.getElementById("undo-button");
  const redoButton = document.getElementById("redo-button");
  const savePresetButton = document.getElementById("save-preset-button");
  const loadPresetButton = document.getElementById("load-preset-button");
  const presetSelect = document.getElementById("preset-select");
  const helpButton = document.getElementById("help-button");

  // State variables
  let originalImage = null;
  let originalImageData = null;
  let zoomLevel = 1;
  let panPosition = {x: 0, y: 0};

  // Undo/Redo system
  const MAX_HISTORY = 20;
  const historyStack = [];
  const redoStack = [];
  let isApplyingHistoryState = false;

  // Event Listeners
  uploadButton.addEventListener("click", function () {
    imageInput.click();
  });

  imageInput.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      loadImage(file);
    }
  });

  // Allow drag and drop
  const canvasWrapper = document.querySelector(".canvas-wrapper");

  canvasWrapper.addEventListener("dragover", function (e) {
    e.preventDefault();
    canvasWrapper.style.borderColor = "#0d6efd";
  });

  canvasWrapper.addEventListener("dragleave", function () {
    canvasWrapper.style.borderColor = "#3a3a3a";
  });

  canvasWrapper.addEventListener("drop", function (e) {
    e.preventDefault();
    canvasWrapper.style.borderColor = "#3a3a3a";

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match("image.*")) {
        loadImage(file);
      }
    }
  });

  // UI Updates
  ditheringType.addEventListener("change", function () {
    if (this.value === "bayer") {
      bayerMatrixSizeControl.style.display = "flex";
    } else {
      bayerMatrixSizeControl.style.display = "none";
    }
    applyFilters();
  });

  noiseFilterType.addEventListener("change", function () {
    const extraFilterControl = document.getElementById("extra-filter-control");
    if (this.value === "none") {
      extraFilterControl.style.display = "none";
    } else {
      extraFilterControl.style.display = "flex";
    }
    applyFilters();
  });

  // Sliders and controls
  ditheringScale.addEventListener("input", function () {
    ditheringScaleValue.textContent = this.value;
    applyFilters();
  });

  bayerMatrixSize.addEventListener("change", applyFilters);

  extraFilter.addEventListener("input", function () {
    extraFilterValue.textContent = this.value;
    applyFilters();
  });

  contrast.addEventListener("input", function () {
    contrastValue.textContent = `${this.value}%`;
    applyFilters();
  });

  midtone.addEventListener("input", function () {
    midtoneValue.textContent = `${this.value}%`;
    applyFilters();
  });

  highlights.addEventListener("input", function () {
    highlightsValue.textContent = `${this.value}%`;
    applyFilters();
  });

  luminanceThreshold.addEventListener("input", function () {
    luminanceThresholdValue.textContent = `${this.value}%`;
    applyFilters();
  });

  invertColors.addEventListener("change", applyFilters);

  // Border controls event listeners
  enableBorder.addEventListener("change", function () {
    borderControls.style.display = this.checked ? "block" : "none";
    applyFilters();
  });

  borderThickness.addEventListener("input", function () {
    borderThicknessValue.textContent = this.value;
    applyFilters();
  });

  borderColor.addEventListener("input", applyFilters);

  doubleBorder.addEventListener("change", function () {
    secondBorderControls.style.display = this.checked ? "block" : "none";
    applyFilters();
  });

  secondBorderThickness.addEventListener("input", function () {
    secondBorderThicknessValue.textContent = this.value;
    applyFilters();
  });

  secondBorderColor.addEventListener("input", applyFilters);

  // Undo/Redo buttons
  if (undoButton) {
    undoButton.addEventListener("click", undoAction);
    undoButton.classList.add("disabled");
  }

  if (redoButton) {
    redoButton.addEventListener("click", redoAction);
    redoButton.classList.add("disabled");
  }

  // Preset management
  if (savePresetButton) {
    savePresetButton.addEventListener("click", savePreset);
  }

  if (loadPresetButton) {
    loadPresetButton.addEventListener("click", loadSelectedPreset);
  }

  // Help button
  if (helpButton) {
    helpButton.addEventListener("click", showHelp);
  }

  // Load saved presets if exist
  loadPresets();

  // Add panning functionality
  let isDragging = false;
  let startPanPosition = {x: 0, y: 0};
  let startMousePosition = {x: 0, y: 0};

  canvasWrapper.addEventListener("mousedown", function (e) {
    if (zoomLevel > 1 || zoomLevel < 1.2) {
      isDragging = true;
      startPanPosition = {x: panPosition.x, y: panPosition.y};
      startMousePosition = {x: e.clientX, y: e.clientY};
      canvasWrapper.style.cursor = "grabbing";
    }
  });

  window.addEventListener("mousemove", function (e) {
    if (isDragging) {
      const dx = e.clientX - startMousePosition.x;
      const dy = e.clientY - startMousePosition.y;
      panPosition = {
        x: startPanPosition.x + dx,
        y: startPanPosition.y + dy,
      };
      updateCanvasTransform();
    }
  });

  window.addEventListener("mouseup", function () {
    isDragging = false;
    canvasWrapper.style.cursor = "default";
  });

  // Reset & Download
  resetButton.addEventListener("click", resetImage);

  downloadButton.addEventListener("click", function () {
    if (originalImage) {
      const link = document.createElement("a");
      link.download = "dithered-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  });

  // Zoom functionality
  document.getElementById("zoom-in").addEventListener("click", function () {
    zoomLevel *= 1.2;
    updateCanvasTransform();
  });

  document.getElementById("zoom-out").addEventListener("click", function () {
    zoomLevel /= 1.2;
    updateCanvasTransform();
  });

  document.getElementById("reset-zoom").addEventListener("click", function () {
    zoomLevel = 1;
    panPosition = {x: 0, y: 0};
    updateCanvasTransform();
  });

  // Functions
  function loadImage(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        originalImage = img;

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Save the original pixel data
        originalImageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
          {
            willReadFrequently: true,
          }
        );

        // Hide upload prompt
        uploadPrompt.style.display = "none";

        // Enable download button
        downloadButton.classList.remove("disabled");

        // Clear history when loading a new image
        historyStack.length = 0;
        redoStack.length = 0;
        updateUndoRedoButtons();

        // Apply filters
        applyFilters();
      };

      img.onerror = function () {
        showError(
          "Failed to load image. The file might be corrupted or not supported."
        );
      };

      img.src = event.target.result;
    };

    reader.onerror = function () {
      showError("Failed to read the file. Please try again.");
    };

    reader.readAsDataURL(file);
  }

  function updateCanvasTransform() {
    canvas.style.transform = `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`;
  }

  function resetImage() {
    if (originalImage) {
      // Reset all sliders
      ditheringType.value = "none";
      ditheringScale.value = 1;
      ditheringScaleValue.textContent = "1";

      contrast.value = 100;
      contrastValue.textContent = "100%";

      midtone.value = 50;
      midtoneValue.textContent = "50%";

      highlights.value = 50;
      highlightsValue.textContent = "50%";

      luminanceThreshold.value = 50;
      luminanceThresholdValue.textContent = "50%";

      noiseFilterType.value = "none";
      extraFilter.value = 0;
      extraFilterValue.textContent = "0";
      invertColors.checked = false;

      // Reset border controls
      enableBorder.checked = false;
      borderControls.style.display = "none";
      borderThickness.value = 5;
      borderThicknessValue.textContent = "5";
      borderColor.value = "#000000";
      doubleBorder.checked = false;
      secondBorderControls.style.display = "none";
      secondBorderThickness.value = 3;
      secondBorderThicknessValue.textContent = "3";
      secondBorderColor.value = "#ffffff";

      // Hide extra filter control
      const extraFilterControl = document.getElementById(
        "extra-filter-control"
      );
      extraFilterControl.style.display = "none";

      // Reset zoom and pan
      zoomLevel = 1;
      panPosition = {x: 0, y: 0};
      updateCanvasTransform();

      // Redraw original image
      ctx.putImageData(originalImageData, 0, 0);

      // Clear history
      historyStack.length = 0;
      redoStack.length = 0;
      updateUndoRedoButtons();
    }
  }

  function applyFilters() {
    if (!originalImage) return;

    // Start with the original image data
    const imageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );

    // Apply adjustments in order
    applyContrast(imageData.data, contrast.value / 100);
    applyMidtone(imageData.data, midtone.value / 100);
    applyHighlights(imageData.data, highlights.value);
    applyLuminanceThreshold(imageData.data, luminanceThreshold.value);

    // Apply noise filters based on selected type
    const selectedNoiseFilter = noiseFilterType.value;
    const filterIntensity = parseFloat(extraFilter.value);

    if (filterIntensity > 0 && selectedNoiseFilter !== "none") {
      switch (selectedNoiseFilter) {
        case "gaussian":
          applyGaussianNoise(imageData.data, filterIntensity);
          break;
        case "salt-pepper":
          applySaltPepperNoise(imageData.data, filterIntensity);
          break;
        case "blur":
          applyBlur(
            imageData.data,
            imageData.width,
            imageData.height,
            filterIntensity
          );
          break;
        case "pixelate":
          applyPixelate(
            imageData.data,
            imageData.width,
            imageData.height,
            filterIntensity
          );
          break;
      }
    }

    // Apply color inversion if enabled
    if (invertColors.checked) {
      applyColorInversion(imageData.data);
    }

    // Apply dithering last (only if a dithering type is selected)
    const selectedDitheringType = ditheringType.value;
    if (selectedDitheringType !== "none") {
      const scale = parseFloat(ditheringScale.value);

      if (selectedDitheringType === "bayer") {
        const matrixSize = parseInt(bayerMatrixSize.value);
        applyDithering(imageData, selectedDitheringType, scale, matrixSize);
      } else {
        applyDithering(imageData, selectedDitheringType, scale);
      }
    }

    // Apply border if enabled
    if (enableBorder.checked) {
      const borderOptions = {
        thickness: parseInt(borderThickness.value),
        color: borderColor.value,
        doubleBorder: doubleBorder.checked,
        secondThickness: parseInt(secondBorderThickness.value),
        secondColor: secondBorderColor.value,
      };
      applyBorder(imageData, borderOptions);
    }

    // Update canvas
    ctx.putImageData(imageData, 0, 0);

    // Save state to history if not currently applying a history state
    if (!isApplyingHistoryState) {
      saveToHistory(imageData);
    }
  }

  // History management functions
  function saveToHistory(imageData) {
    const copyData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    historyStack.push({
      imageData: copyData,
      settings: getCurrentSettings(),
    });

    if (historyStack.length > MAX_HISTORY) {
      historyStack.shift();
    }

    redoStack.length = 0;

    updateUndoRedoButtons();
  }

  function undoAction() {
    if (historyStack.length <= 1) return;

    redoStack.push(historyStack.pop());

    if (historyStack.length > 0) {
      isApplyingHistoryState = true;
      applyHistoryState(historyStack[historyStack.length - 1]);
      isApplyingHistoryState = false;
    }

    updateUndoRedoButtons();
  }

  function redoAction() {
    if (redoStack.length === 0) return;

    const state = redoStack.pop();

    isApplyingHistoryState = true;
    historyStack.push(state);
    applyHistoryState(state);
    isApplyingHistoryState = false;

    updateUndoRedoButtons();
  }

  function applyHistoryState(state) {
    ctx.putImageData(state.imageData, 0, 0);

    applySettings(state.settings);
  }

  function updateUndoRedoButtons() {
    if (undoButton) {
      if (historyStack.length <= 1) {
        undoButton.classList.add("disabled");
      } else {
        undoButton.classList.remove("disabled");
      }
    }

    if (redoButton) {
      if (redoStack.length === 0) {
        redoButton.classList.add("disabled");
      } else {
        redoButton.classList.remove("disabled");
      }
    }
  }

  // Preset management functions
  function getCurrentSettings() {
    return {
      ditheringType: ditheringType.value,
      ditheringScale: ditheringScale.value,
      bayerMatrixSize: bayerMatrixSize.value,
      contrast: contrast.value,
      midtone: midtone.value,
      highlights: highlights.value,
      luminanceThreshold: luminanceThreshold.value,
      noiseFilterType: noiseFilterType.value,
      extraFilter: extraFilter.value,
      invertColors: invertColors.checked,
      enableBorder: enableBorder.checked,
      borderThickness: borderThickness.value,
      borderColor: borderColor.value,
      doubleBorder: doubleBorder.checked,
      secondBorderThickness: secondBorderThickness.value,
      secondBorderColor: secondBorderColor.value,
    };
  }

  function applySettings(settings) {
    ditheringType.value = settings.ditheringType;
    ditheringScale.value = settings.ditheringScale;
    ditheringScaleValue.textContent = settings.ditheringScale;
    bayerMatrixSize.value = settings.bayerMatrixSize;

    contrast.value = settings.contrast;
    contrastValue.textContent = `${settings.contrast}%`;

    midtone.value = settings.midtone;
    midtoneValue.textContent = `${settings.midtone}%`;

    highlights.value = settings.highlights;
    highlightsValue.textContent = `${settings.highlights}%`;

    luminanceThreshold.value = settings.luminanceThreshold;
    luminanceThresholdValue.textContent = `${settings.luminanceThreshold}%`;

    noiseFilterType.value = settings.noiseFilterType;
    extraFilter.value = settings.extraFilter;
    extraFilterValue.textContent = settings.extraFilter;
    invertColors.checked = settings.invertColors;

    enableBorder.checked = settings.enableBorder;
    borderThickness.value = settings.borderThickness;
    borderThicknessValue.textContent = settings.borderThickness;
    borderColor.value = settings.borderColor;
    doubleBorder.checked = settings.doubleBorder;
    secondBorderThickness.value = settings.secondBorderThickness;
    secondBorderThicknessValue.textContent = settings.secondBorderThickness;
    secondBorderColor.value = settings.secondBorderColor;

    if (settings.ditheringType === "bayer") {
      bayerMatrixSizeControl.style.display = "flex";
    } else {
      bayerMatrixSizeControl.style.display = "none";
    }

    const extraFilterControl = document.getElementById("extra-filter-control");
    if (settings.noiseFilterType === "none") {
      extraFilterControl.style.display = "none";
    } else {
      extraFilterControl.style.display = "flex";
    }

    borderControls.style.display = settings.enableBorder ? "block" : "none";
    secondBorderControls.style.display = settings.doubleBorder
      ? "block"
      : "none";
  }

  function savePreset() {
    const presetName = prompt("Enter a name for this preset:", "My Preset");
    if (!presetName) return;

    const preset = {
      name: presetName,
      timestamp: Date.now(),
      settings: getCurrentSettings(),
    };

    let presets = JSON.parse(
      localStorage.getItem("ditherdemon_presets") || "[]"
    );

    presets.push(preset);

    localStorage.setItem("ditherdemon_presets", JSON.stringify(presets));

    loadPresets();
  }

  function loadPresets() {
    if (!presetSelect) return;

    while (presetSelect.firstChild) {
      presetSelect.removeChild(presetSelect.firstChild);
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a preset...";
    presetSelect.appendChild(defaultOption);

    const presets = JSON.parse(
      localStorage.getItem("ditherdemon_presets") || "[]"
    );

    presets.forEach((preset, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });
  }

  function loadSelectedPreset() {
    if (!presetSelect || presetSelect.value === "") return;

    const presets = JSON.parse(
      localStorage.getItem("ditherdemon_presets") || "[]"
    );
    const preset = presets[presetSelect.value];

    if (preset && preset.settings) {
      applySettings(preset.settings);
      applyFilters();
    }
  }

  // Help functions
  function showHelp() {
    const helpModal = document.getElementById("help-modal");
    if (helpModal) {
      helpModal.style.display = "flex";
    }
  }

  // Error handling
  function showError(message) {
    alert(message);
  }
});
