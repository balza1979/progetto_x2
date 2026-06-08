/* ============================================================
   x2_memoriaC_loader.js
   Versione: 2.0 — 08/06/2026
   Gestione Memoria C in formato Intel‑HEX:
   - Lettura memC_hex (file Intel‑HEX completo)
   - Conversione in mappa di byte {indirizzo: "HH"}
   - Applicazione ai campi VALORE
   - (Opzionale) scrittura modifiche in RAM
   ============================================================ */

/* ------------------------------------------------------------
   1) Controllo esistenza Memoria C
   ------------------------------------------------------------ */
function checkMemoriaC() {
    return localStorage.getItem("memC_hex") !== null;
}

/* ------------------------------------------------------------
   2) Intel‑HEX → mappa {indirizzo: "HH"}
   ------------------------------------------------------------ */
function intelHexToMemoryMap(hexText) {
    const lines = hexText.split(/\r?\n/);
    const mem = {};

    for (let line of lines) {
        if (!line.startsWith(":")) continue;

        const byteCount  = parseInt(line.substr(1, 2), 16);
        const address    = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        // Solo record DATA (00)
        if (recordType !== 0) continue;

        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }

    return mem;
}

/* ------------------------------------------------------------
   3) Carica Memoria C dal localStorage → mappa {indirizzo: "HH"}
   ------------------------------------------------------------ */
function loadMemoriaC() {
    const hexText = localStorage.getItem("memC_hex");
    if (!hexText) return null;

    return intelHexToMemoryMap(hexText);
}

/* ------------------------------------------------------------
   4) Legge un byte da Memoria C (offset = indirizzo)
   ------------------------------------------------------------ */
function getByteFromC(offset, memC_map) {
    const hex = memC_map[offset] || "00";
    return parseInt(hex, 16);
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
        return byte; // poi potrai gestire scaling, offset, ecc.
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

    const memC_map = loadMemoriaC();
    if (!memC_map) return;

    x2_parametri.forEach(param => {
        const byte   = getByteFromC(param.offset, memC_map);
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
   (per ora solo in RAM, senza rigenerare il file Intel‑HEX)
   ------------------------------------------------------------ */
function updateMemoriaC(param, nuovoValore) {

    const hexText = localStorage.getItem("memC_hex");
    if (!hexText) return;

    const memC_map = intelHexToMemoryMap(hexText);

    // Converti valore → byte
    const nuovoByte = convertValueToByte(param, nuovoValore);

    // Scrivi nel buffer logico
    memC_map[param.offset] = nuovoByte.toString(16).padStart(2, "0").toUpperCase();

    // 🔴 NOTA:
    // qui NON rigeneriamo il file Intel‑HEX completo (checksum, record, ecc.)
    // quindi per ora NON risalviamo memC_hex.
    // Usiamo Memoria C solo come sorgente di lettura per popolare la UI.

    // Aggiorna param.VALORE
    param.VALORE = nuovoValore;
}

/* ------------------------------------------------------------
   9) Aggancia eventi change alle tendine / input
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
