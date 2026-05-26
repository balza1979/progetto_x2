/* ============================================================
   GESTIONE SELEZIONE FILE A/B/C DA GIT (AUTOMATICA)
   File: memorie_tipo.js
   ============================================================ */

let slotAttivo = null;   // A, B o C
let strutturaGit = {};   // { cartella: [file1, file2...] }
let listaCompleta = [];  // lista finale per la tendina

const GIT_API = "https://api.github.com/repos/balza1979/progetto_x2/contents/Memorie";
const RAW_BASE = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/";

/* ============================================================
   1) selezionaSlot(A/B/C)
   ============================================================ */
function selezionaSlot(slot) {
    slotAttivo = slot;

    document.getElementById("selettoreGit").style.display = "block";
    document.getElementById("btnConfermaGit").style.display = "block";

    // Carica struttura Git SOLO la prima volta
    if (listaCompleta.length === 0) {
        caricaStrutturaGit();
    } else {
        popolaTendina();
    }
}

/* ============================================================
   2) Legge la struttura della cartella Memorie da GitHub
   ============================================================ */
async function caricaStrutturaGit() {

    strutturaGit = {};
    listaCompleta = [];

    const resp = await fetch(GIT_API);
    const items = await resp.json();

    // Cartella virtuale DEF
    strutturaGit["DEF"] = [];

    for (let item of items) {

        if (item.type === "file") {
            // FILE FUORI DALLE CARTELLE → vanno in DEF
            strutturaGit["DEF"].push(item.name);
        }

        if (item.type === "dir") {
            // CARTELLA → leggo i file dentro
            strutturaGit[item.name] = await leggiCartella(item.path);
        }
    }

    popolaTendina();
}

/* ============================================================
   3) Legge i file dentro una cartella
   ============================================================ */
async function leggiCartella(path) {

    const url = "https://api.github.com/repos/balza1979/progetto_x2/contents/" + path;
    const resp = await fetch(url);
    const items = await resp.json();

    return items
        .filter(x => x.type === "file")
        .map(x => x.name);
}

/* ============================================================
   4) Popola la tendina con DEF + cartelle
   ============================================================ */
function popolaTendina() {

    const select = document.getElementById("gitSelect");
    select.innerHTML = "";

    listaCompleta = [];

    for (let cartella in strutturaGit) {
        for (let file of strutturaGit[cartella]) {

            const voce = {
                cartella: cartella,
                file: file,
                path: (cartella === "DEF") ? file : (cartella + "/" + file)
            };

            listaCompleta.push(voce);
        }
    }

    listaCompleta.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.path;
        opt.textContent = v.cartella + " / " + v.file;
        select.appendChild(opt);
    });
}

/* ============================================================
   5) Conferma selezione
   ============================================================ */
document.getElementById("btnConfermaGit").addEventListener("click", async () => {

    const select = document.getElementById("gitSelect");
    const path = select.value;

    if (!path) {
        alert("Seleziona un file.");
        return;
    }

    // Estrai solo il nome del file
    const nomeFile = path.split("/").pop();

    // Scarica il file da Git
    const hexText = await caricaFileGit(path);

    // Converti in mappa memoria
    const memMap = hexToMemoryMap(hexText);

    // Assegna alla variabile giusta + aggiorna label
    if (slotAttivo === "A") {
        memoriaA = memMap;
        document.getElementById("labelFileA").textContent = "FILE A: " + nomeFile;
    }
    if (slotAttivo === "B") {
        memoriaB = memMap;
        document.getElementById("labelFileB").textContent = "FILE B: " + nomeFile;
    }
    if (slotAttivo === "C") {
        memoriaC = memMap;
        document.getElementById("labelFileC").textContent = "FILE C: " + nomeFile;
    }

    // Chiudi tendina
    document.getElementById("selettoreGit").style.display = "none";
});

/* ============================================================
   6) Carica file RAW da GitHub (HEX o BIN)
   ============================================================ */
async function caricaFileGit(path) {

    const url = RAW_BASE + path;

    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();

    if (path.endsWith(".hex")) {
        return new TextDecoder().decode(buffer);
    }

    if (path.endsWith(".bin")) {
        return convertiBinInHex(buffer);
    }

    throw new Error("Formato non supportato");
}

/* ============================================================
   7) Conversione BIN → HEX Intel compatibile X2
   ============================================================ */
function convertiBinInHex(buffer) {

    const bytes = new Uint8Array(buffer);
    let hex = "";
    let address = 0;

    for (let i = 0; i < bytes.length; i += 16) {

        const chunk = bytes.slice(i, i + 16);
        const len = chunk.length;

        let checksum = len + ((address >> 8) & 0xFF) + (address & 0xFF);

        let line = ":" +
            len.toString(16).padStart(2, "0").toUpperCase() +
            (address >> 8).toString(16).padStart(4, "0").slice(0,2).toUpperCase() +
            (address & 0xFF).toString(16).padStart(2, "0").toUpperCase() +
            "00";

        for (let b of chunk) {
            line += b.toString(16).padStart(2, "0").toUpperCase();
            checksum += b;
        }

        checksum = ((~checksum + 1) & 0xFF);
        line += checksum.toString(16).padStart(2, "0").toUpperCase();

        hex += line + "\n";
        address += 16;
    }

    hex += ":00000001FF\n"; // EOF

    return hex;
}
