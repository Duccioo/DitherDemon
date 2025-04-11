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
    if (imageLoaded) return; // Se c'è già un'immagine, usiamo la logica di handleCanvasTouch

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
    if (imageLoaded) return; // Se c'è già un'immagine, usiamo la logica di handleCanvasTouch

    e.preventDefault();
    canvasWrapper.classList.remove("touch-active");
    clearTimeout(touchTimeout);
  });

  // Evento touch move (per annullare l'apertura del selettore se l'utente sta facendo scroll)
  canvasWrapper.addEventListener("touchmove", (e) => {
    if (imageLoaded) return; // Se c'è già un'immagine, usiamo la logica di handleCanvasTouch

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

// Funzione per gestire gli eventi touch per il movimento nel canvas
function handleCanvasTouch() {
  const canvas = document.getElementById("canvas");
  const canvasWrapper = document.querySelector(".canvas-wrapper");

  let isDragging = false;
  let lastTouchX, lastTouchY;
  let currentScale = 1;

  // Funzione per aggiornare la posizione dell'immagine
  function updateImagePosition(deltaX, deltaY) {
    if (!imageLoaded) return;

    // Ottieni la posizione attuale dell'immagine
    const rect = canvas.getBoundingClientRect();
    const containerRect = canvasWrapper.getBoundingClientRect();

    // Calcola nuove coordinate con limiti
    let newLeft = rect.left + deltaX - containerRect.left;
    let newTop = rect.top + deltaY - containerRect.top;

    // Imposta i limiti di movimento per non uscire dal contenitore
    const maxLeft = containerRect.width - rect.width;
    const maxTop = containerRect.height - rect.height;

    // Applica i limiti
    newLeft = Math.min(Math.max(newLeft, maxLeft), 0);
    newTop = Math.min(Math.max(newTop, maxTop), 0);

    // Applica la nuova posizione
    canvas.style.transform = `translate(${newLeft}px, ${newTop}px) scale(${currentScale})`;
    canvas.style.transformOrigin = "top left";
  }

  // Gestione zoom con pinch
  let initialDistance = 0;

  function getDistance(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  // Touch Start
  canvasWrapper.addEventListener("touchstart", (e) => {
    if (!imageLoaded) {
      // Se non c'è immagine, usiamo la logica definita in precedenza
      return;
    }

    e.preventDefault(); // Previene lo scrolling predefinito

    // Gesture con due dita per zoom
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches);
      return;
    }

    // Con un dito facciamo il drag
    isDragging = true;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
    canvasWrapper.classList.add("touch-active");
  });

  // Touch Move
  canvasWrapper.addEventListener("touchmove", (e) => {
    if (!imageLoaded || (!isDragging && e.touches.length !== 2)) return;

    e.preventDefault();

    // Gestione zoom con pinch (due dita)
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);
      const scaleFactor = currentDistance / initialDistance;

      // Limitiamo lo zoom tra 0.5x e 3x
      const newScale = Math.min(Math.max(currentScale * scaleFactor, 0.5), 3);

      // Applichiamo lo zoom
      canvas.style.transform = `translate(${canvas.offsetLeft}px, ${canvas.offsetTop}px) scale(${newScale})`;
      canvas.style.transformOrigin = "top left";

      // Aggiorniamo le variabili
      currentScale = newScale;
      initialDistance = currentDistance;
      return;
    }

    // Gestione movimento con un dito
    if (isDragging && e.touches.length === 1) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const deltaX = touchX - lastTouchX;
      const deltaY = touchY - lastTouchY;

      updateImagePosition(deltaX, deltaY);

      lastTouchX = touchX;
      lastTouchY = touchY;
    }
  });

  // Touch End
  canvasWrapper.addEventListener("touchend", (e) => {
    isDragging = false;
    canvasWrapper.classList.remove("touch-active");
  });

  // Touch Cancel
  canvasWrapper.addEventListener("touchcancel", (e) => {
    isDragging = false;
    canvasWrapper.classList.remove("touch-active");
  });
}

// Inizializza l'app
function init() {
  initDragAndDrop();
  handleCanvasTouch();

  // Rileva dispositivi touch e aggiungi classe al body
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add("touch-device");
  }

  // Aggiungi una variabile globale per tracciare se un'immagine è caricata
  window.imageLoaded = false;
}

// Funzione per gestire il caricamento dell'immagine
function handleImageUpload(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Ottieni riferimenti al canvas e al contesto
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      // Nascondi il prompt di upload quando un'immagine è caricata
      const uploadPrompt = document.querySelector(".upload-prompt");
      if (uploadPrompt) {
        uploadPrompt.style.display = "none";
      }

      // Imposta le dimensioni del canvas in base all'immagine
      canvas.width = img.width;
      canvas.height = img.height;

      // Disegna l'immagine sul canvas
      ctx.drawImage(img, 0, 0);

      // Attiva i controlli
      document.querySelectorAll(".disabled").forEach((el) => {
        el.classList.remove("disabled");
      });

      // Imposta imageLoaded a true quando un'immagine viene caricata
      window.imageLoaded = true;

      // Reset della posizione e dello scale del canvas
      canvas.style.transform = "translate(0px, 0px) scale(1)";

      // Applica il dithering di default
      applyDithering();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
