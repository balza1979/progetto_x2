/* ============================================================
   x2_memoriaC_loader.js
   Versione: 1.0 — 06/06/2026 10:55
   Gestione completa Memoria C:
   - Lettura valori da memC_hex
   - Applicazione ai campi VALORE
   - Scrittura modifiche in memC_hex
   - Sync con param.VALORE
   ============================================================ */

/* ------------------------------------------------------------
   1) Controllo esistenza Memoria C
   ------------------------------------------------------------ */
function checkMemoriaC() {
    return localStorage.getItem("memC_hex") !== null;
}

/* ------------------------------------------------------------
   2) Carica Memoria C dal localStorage
   ------------------------------------------------------------ */
function loadMemoriaC() {
    const hex = localStorage.getItem("memC_hex");
    if (!hex) return null;

    // Ritorna array di byte (0-255)
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return bytes;
}

/* ------------------------------------------------------------
   3) Salva Memoria C nel localStorage
   ------------------------------------------------------------ */
function saveMemoriaC(bytes) {
    let hex = "";
    for (let b of bytes) {
        hex += b.toString(16).padStart(2, "0").toUpperCase();
    }
    localStorage.setItem("memC_hex", hex);
}

/* ------------------------------------------------------------
   4) Legge un byte da Memoria C
   ------------------------------------------------------------ */
function getByteFromC(offset, memC_bytes) {
    return memC_bytes[offset];
}

/* ------------------------------------------------------------
   5) Converte byte → valore leggibile
      (enum, min/max, bool, ecc.)
   ------------------------------------------------------------ */
function convertValueFromByte(param, byte) {

    // ENUM
    if (param.tipo === "enum") {
        return param.enum[byte] ?? "??";
    }

    // BOOL
    if (param.tipo === "bool") {
        return byte === 1 ? "ON" : "OFF";
    }

    // NUMERICO
    if (param.tipo === "num") {
        return byte; // per ora semplice, poi gestiamo min/max
    }

    return byte;
}

/* ------------------------------------------------------------
   6) Converte valore UI → byte
   ------------------------------------------------------------ */
function convertValueToByte(param, nuovoValore) {

    // ENUM
    if (param.tipo === "enum") {
        const index = param.enum.indexOf(nuovoValore);
        return index >= 0 ? index : 0;
    }

    // BOOL
    if (param.tipo === "bool") {
        return nuovoValore === "ON" ? 1 : 0;
    }

    // NUMERICO
    if (param.tipo === "num") {
        return Number(nuovoValore);
    }

    return 0;
}

/* ------------------------------------------------------------
   7) Applica valori da Memoria C ai campi UI
   ------------------------------------------------------------ */
function applyValuesFromC() {
    if (!checkMemoriaC()) return;

    const memC_bytes = loadMemoriaC();
    if (!memC_bytes) return;

    x2_parametri.forEach(param => {
        const byte = getByteFromC(param.offset, memC_bytes);
        const valore = convertValueFromByte(param, byte);

        // Aggiorna param.VALORE
        param.VALORE = valore;

        // Aggiorna UI
        const el = document.getElementById(param.id_valore);
        if (el) el.value = valore;
    });
}

/* ------------------------------------------------------------
   8) Aggiorna Memoria C quando l’utente modifica un parametro
   ------------------------------------------------------------ */
function updateMemoriaC(param, nuovoValore) {

    const memC_bytes = loadMemoriaC();
    if (!memC_bytes) return;

    // Converti valore → byte
    const nuovoByte = convertValueToByte(param, nuovoValore);

    // Scrivi nel buffer
    memC_bytes[param.offset] = nuovoByte;

    // Salva nel localStorage
    saveMemoriaC(memC_bytes);

    // Aggiorna param.VALORE
    param.VALORE = nuovoValore;
}

/* ------------------------------------------------------------
   9) Aggancia eventi change alle tendine
   ------------------------------------------------------------ */
function hookUIevents() {

    x2_parametri.forEach(param => {
        const el = document.getElementById(param.id_valore);
        if (!el) return;

        el.addEventListener("change", () => {
            const nuovoValore = el.value;
            updateMemoriaC(param, nuovoValore);
        });
    });
}

/* ------------------------------------------------------------
   10) Inizializzazione generale
   ------------------------------------------------------------ */
function initMemoriaC() {
    if (!checkMemoriaC()) return;

    applyValuesFromC();
    hookUIevents();
}

/* ------------------------------------------------------------
   11) Avvio automatico
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", initMemoriaC);
