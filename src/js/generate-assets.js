// Garantisce che la directory assets esista
// Se non esiste, verrà creata automaticamente quando salveremo i file

// Genera una favicon.ico semplice con i colori demoniaci
const canvas = document.createElement("canvas");
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext("2d");

// Sfondo gradiente
const gradient = ctx.createLinearGradient(0, 0, 32, 32);
gradient.addColorStop(0, "#9933ff"); // demon-purple
gradient.addColorStop(1, "#ff3333"); // demon-red
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 32);

// Aggiungi una "D" in stile demoniaco
ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
ctx.fillRect(8, 8, 16, 16);
ctx.font = "bold 20px sans-serif";
ctx.fillStyle = "#ffffff";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("D", 16, 16);

// Esporta come data URL
const faviconDataURL = canvas.toDataURL("image/png");

// Crea un'immagine placeholder per il profilo del creatore
// Normalmente useremmo una vera foto, ma per questo esempio creiamo un'immagine generica
const profileCanvas = document.createElement("canvas");
profileCanvas.width = 200;
profileCanvas.height = 200;
const profileCtx = profileCanvas.getContext("2d");

// Sfondo gradiente per il profilo
const profileGradient = profileCtx.createLinearGradient(0, 0, 200, 200);
profileGradient.addColorStop(0, "#3366ff"); // demon-blue
profileGradient.addColorStop(1, "#ff66cc"); // demon-pink
profileCtx.fillStyle = profileGradient;
profileCtx.fillRect(0, 0, 200, 200);

// Aggiungi le iniziali del creatore
profileCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
profileCtx.fillRect(40, 40, 120, 120);
profileCtx.font = "bold 80px sans-serif";
profileCtx.fillStyle = "#ffffff";
profileCtx.textAlign = "center";
profileCtx.textBaseline = "middle";
profileCtx.fillText("DM", 100, 100);

// Esporta come data URL
const profileDataURL = profileCanvas.toDataURL("image/png");

// Codice per salvare queste immagini come file:
// 1. Per favicon.ico:
// const faviconLink = document.createElement('a');
// faviconLink.href = faviconDataURL;
// faviconLink.download = 'favicon.ico';
// faviconLink.click();

// 2. Per l'immagine del profilo:
// const profileLink = document.createElement('a');
// profileLink.href = profileDataURL;
// profileLink.download = 'creator-profile.jpg';
// profileLink.click();

// Nota: In un ambiente reale, queste immagini verrebbero salvate direttamente nel file system
// Qui forniamo soltanto il codice per generarle dinamicamente
// Gli utilizzatori dell'app dovranno eseguire questo script e salvare le immagini manualmente
