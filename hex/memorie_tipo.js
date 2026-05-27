/* MEMORIE_TIPO.JS V 1.4 – VERSIONE COMPLETA – 27/05/2026 14:20 */

let slotAttivo = null;   // A, B o C
let strutturaGit = {};   // { cartella: [file1, file2...] }
let listaCompleta = [];  // lista finale per la tendina

const GIT_API = "https://api.github.com/repos/balza1979/progetto_x2/contents/Memorie";
const RAW_BASE = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/";

/* ============================================================
   Helper: filtro HEX/BIN case-insensitive
   ============================================================ */
function isHexBin(name) {
    const n = name.toLowerCase();
    return n.endsWith(".hex") || n.endsWith(".bin");
}

/* ===== INIZIO MODIFICA 27/05/2026 14:12 – Spinner caricamento Git ===== */
const spinnerGit = document.createElement("div");
spinnerGit.id = "spinnerGit";
spinnerGit.style.cssText = `
    display:none;
    position:fixed;
    top:50%;
    left:50%;
    width:60px;
    height:60px;
    margin:-30px 0 0 -30px;
    border:6px solid #444;
    border-top:6px solid #ff3333;
    border-radius:50%;
    animation: spinGit 0.8s linear infinite;
    z-index:99999;
`;
document.body.appendChild(spinnerGit);

const styleSpin = document.createElement("style");
styleSpin.textContent = `
@keyframes spinGit {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`;
document.head.appendChild(styleSpin);
/* ===== FINE MODIFICA 27/05/2026 14:12 ===== */


/* ============================================================
   1) selezionaSlot(A/B/C)
   ============================================================ */
function selezionaSlot(slot) {
    slotAttivo = slot;

    document.getElementById("selettoreGit").style.display = "block";
    document.getElementById("btnConfermaGit").style.display = "block";

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

    strutturaGit["DEF"] = [];

    for (let item of items) {
        if (item.type === "file" && isHexBin(item.name)) {
            strutturaGit["DEF"].push(item.name);
        }
        if (item.type === "dir") {
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
        .filter(x => x.type === "file" && isHexBin(x.name))
        .map(x => x.name);
}

/* ============================================================
   4) Popola la tendina con DEF + cartelle
   ============================================================ */
function popolaTendina() {
    const select = document.getElementById("gitSelect");
    select.innerHTML = "";

    listaCompleta = [];

    const coloriCartelle = {
        "DEF": { border: "#ffcc66", text: "#ffcc66" },
        "GL_TRIFASE_1MS": { border: "#66cc66", text: "#66cc66" },
        "HD_DIRETTO_8120": { border: "#66ccff", text: "#66ccff" }
    };

    for (let cartella in strutturaGit) {
        for (let file of strutturaGit[cartella]) {
            listaCompleta.push({
                cartella,
                file,
                path: (cartella === "DEF") ? file : (cartella + "/" + file)
            });
        }
    }

    listaCompleta.sort((a, b) => a.path.localeCompare(b.path));

    listaCompleta.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.path;
        opt.textContent = v.cartella + " / " + v.file;

        if (coloriCartelle[v.cartella]) {
            opt.style.borderLeft = "6px solid " + coloriCartelle[v.cartella].border;
            opt.style.color = coloriCartelle[v.cartella].text;
            opt.style.backgroundColor = "#1a1a1a";
        }

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

    const nomeFile = path.split("/").pop();

    /* ===== INIZIO MODIFICA 27/05/2026 14:16 – Avvio spinner ===== */
    spinnerGit.style.display = "block";
    /* ===== FINE MODIFICA 27/05/2026 14:16 ===== */

    /* ===== INIZIO MODIFICA 27/05/2026 14:13 – Log Git migliorato ===== */
    console.log(`[Git] Slot ${slotAttivo} → File selezionato: ${path}`);
    /* ===== FINE MODIFICA 27/05/2026 14:13 ===== */

    const hexText = await caricaFileGit(path);
    const memMap = hexToMemoryMap(hexText);

    if (slotAttivo === "A") {
        memoriaA = memMap;
        document.getElementById("file1").files = fakeFile(nomeFile, hexText);
    }
    if (slotAttivo === "B") {
        memoriaB = memMap;
        document.getElementById("file2").files = fakeFile(nomeFile, hexText);
    }
    if (slotAttivo === "C") {
        memoriaC = memMap;
        document.getElementById("file3").files = fakeFile(nomeFile, hexText);
    }

    /* ===== INIZIO MODIFICA 27/05/2026 14:14 – Reset label + reset confronto ===== */
    document.getElementById("labelFile" + slotAttivo).style.color = "#ff3333";
    document.getElementById("labelFile" + slotAttivo).textContent =
        `FILE ${slotAttivo}: ${nomeFile}`;

    resetConfronto();
    /* ===== FINE MODIFICA 27/05/2026 14:14 ===== */

    /* ===== INIZIO MODIFICA 27/05/2026 14:15 – UX popup migliorata ===== */
    spinnerGit.style.display = "none";
    document.getElementById("selettoreGit").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("selettoreGit").style.display = "none";
        document.getElementById("selettoreGit").style.opacity = "1";
    }, 200);
    /* ===== FINE MODIFICA 27/05/2026 14:15 ===== */
});

/* ============================================================
   Fake file per input type="file"
   ============================================================ */
function fakeFile(nome, contenuto) {
    const blob = new Blob([contenuto], { type: "text/plain" });
    const file = new File([blob], nome, { type: "text/plain" });
    const dt = new DataTransfer();
    dt.items.add(file);
    return dt.files;
}

/* ============================================================
   6) Carica file RAW da GitHub (HEX o BIN)
   ============================================================ */
async function caricaFileGit(path) {
    const url = RAW_BASE + path;
    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    const est = path.toLowerCase();

    if (est.endsWith(".hex")) {
        return new TextDecoder().decode(buffer);
    }
    if (est.endsWith(".bin")) {
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

    hex += ":00000001FF\n";
    return hex;
}
