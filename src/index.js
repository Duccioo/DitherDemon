// Gestione eventi di trascinamento e rilascio immagini
function initDragAndDrop() {
  const canvasWrapper = document.querySelector(".canvas-wrapper");

  // Previeni il comportamento predefinito di drag per il documento
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
  });

  // Eventi per il drag and drop sul canvas
  canvasWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
    canvasWrapper.classList.add("dragover");
  });

  canvasWrapper.addEventListener("dragleave", () => {
    canvasWrapper.classList.remove("dragover");
  });

  canvasWrapper.addEventListener("drop", (e) => {
    e.preventDefault();
    canvasWrapper.classList.remove("dragover");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  // Aggiungi supporto per dispositivi touch
  let touchTimeout;

  // Evento touch start
  canvasWrapper.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Previene lo zoom e altri gesti predefiniti
    canvasWrapper.classList.add("touch-active");

    // Aggiungi un feedback visivo che indica l'attivazione del touch
    touchTimeout = setTimeout(() => {
      // Simulazione del click per aprire il selettore di file dopo un breve tocco
      document.getElementById("image-input").click();
    }, 500); // Mezzo secondo di tocco prolungato
  });

  // Evento touch end
  canvasWrapper.addEventListener("touchend", (e) => {
    e.preventDefault();
    canvasWrapper.classList.remove("touch-active");
    clearTimeout(touchTimeout);
  });

  // Evento touch move (per annullare l'apertura del selettore se l'utente sta facendo scroll)
  canvasWrapper.addEventListener("touchmove", (e) => {
    clearTimeout(touchTimeout);
  });

  // Aggiungi messaggio specifico per touch nel prompt di upload
  const uploadPrompt = document.querySelector(".upload-prompt");
  if (uploadPrompt) {
    // Verifica se siamo su un dispositivo touch
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      const touchInstruction = document.createElement("p");
      touchInstruction.className = "touch-instruction";
      touchInstruction.textContent =
        "Tocca e tieni premuto per caricare un'immagine";
      uploadPrompt.appendChild(touchInstruction);
    }
  }

  // Click sul canvas per aprire il selettore file
  canvasWrapper.addEventListener("click", () => {
    if (!imageLoaded) {
      document.getElementById("image-input").click();
    }
  });
}

// Inizializza l'app
function init() {
  initDragAndDrop();

  // Rileva dispositivi touch e aggiungi classe al body
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add("touch-device");
  }
}
