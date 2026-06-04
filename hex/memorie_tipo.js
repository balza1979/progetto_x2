/* MEMORIE_TIPO.JS V 2.0 – LISTA MODERNA COMPATIBILE SMARTPHONE – 29/05/2026 15:30 */

let slotAttivo = null;
let strutturaGit = {};
let listaCompleta = [];

const GIT_API = "https://api.github.com/repos/balza1979/progetto_x2/contents/Memorie";
const RAW_BASE = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/";

/* ============================================================
   Helper: filtro HEX/BIN
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
    }
`;

.gitItem {
    padding:10px;
    margin:4px 0;
    background:#1a1a1a;
    border-radius:6px;
    cursor:pointer;
    display:flex;
    align-items:center;
    border-left:6px solid #555;
}
.gitItem:hover {
    background:#333;
}
.gitItem.selected {
    background:#444;
    outline:2px solid #ff3333;
}
.gitIcon {
    width:22px;
    height:22px;
    margin-right:10px;
}
`;
document.head.appendChild(styleSpin);
/* ===== FINE MODIFICA 27/05/2026 14:12 ===== */


/* ============================================================
   1) selezionaSlot(A/B/C)
   ============================================================ */
function selezionaSlot(slot) {
    slotAttivo = slot;

    document.getElementById("selettoreGit").style.display = "block";

    if (listaCompleta.length === 0) {
        caricaStrutturaGit();
    } else {
        popolaListaGit();
    }
}

/* ============================================================
   2) Legge struttura Git
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

    popolaListaGit();
}

/* ============================================================
   3) Legge file in cartella
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
   4) LISTA MODERNA (NON SELECT)
   ============================================================ */
function popolaListaGit() {

    const container = document.querySelector("#selettoreGit #gitList")

    container.innerHTML = "";

    listaCompleta = [];

    const coloriCartelle = {
        "DEF": "#ffcc66",
        "GL_TRIFASE_1MS": "#66cc66",
        "HD_DIRETTO_8120": "#66ccff"
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

        const div = document.createElement("div");
        div.className = "gitItem";
        div.dataset.path = v.path;

        div.style.borderLeft = "6px solid " + (coloriCartelle[v.cartella] || "#888");

        const icon = document.createElement("img");
        icon.className = "gitIcon";
        icon.src = v.file.toLowerCase().endsWith(".hex")
            ? "https://img.icons8.com/?size=512&id=59843&format=png"
            : "https://img.icons8.com/?size=512&id=59842&format=png";

        const text = document.createElement("span");
        text.textContent = v.cartella + " / " + v.file;

        div.appendChild(icon);
        div.appendChild(text);

        div.onclick = () => {
            document.querySelectorAll(".gitItem").forEach(x => x.classList.remove("selected"));
            div.classList.add("selected");
            confermaGit(v.path);
        };

        container.appendChild(div);
    });
}
/* ===== INIZIO MODIFICA 27/05/2026 16:25 – Chiusura popup Git ===== */
const btnChiudiGitList = document.getElementById("btnChiudiGitList");
if (btnChiudiGitList) {
    btnChiudiGitList.addEventListener("click", () => {
        document.getElementById("selettoreGit").style.display = "none";
    });
}
/* ===== FINE MODIFICA 27/05/2026 16:25 ===== */

/* ============================================================
   5) Conferma selezione (NUOVA LOGICA)
   ============================================================ */
async function confermaGit(path) {

    const nomeFile = path.split("/").pop();

    spinnerGit.style.display = "block";
    console.log(`[Git] Slot ${slotAttivo} → File selezionato: ${path}`);

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

    document.getElementById("labelFile" + slotAttivo).style.color = "#ff3333";
    document.getElementById("labelFile" + slotAttivo).textContent =
        `FILE ${slotAttivo}: ${nomeFile}`;

   // resetConfronto();

    spinnerGit.style.display = "none";
    document.getElementById("selettoreGit").style.display = "none";
}

/* ============================================================
   Fake file
   ============================================================ */
function fakeFile(nome, contenuto) {
    const blob = new Blob([contenuto], { type: "text/plain" });
    const file = new File([blob], nome, { type: "text/plain" });
    const dt = new DataTransfer();
    dt.items.add(file);
    return dt.files;
}

/* ============================================================
   6) Carica file RAW
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
   7) Conversione BIN → HEX
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
