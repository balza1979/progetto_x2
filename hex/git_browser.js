// ===============================================
//  GIT BROWSER DINAMICO PER MEMORIE X TIPO
//  Funziona su GitHub Pages, NO API, NO LIMITI
//  Carica file HEX/BIN in A, B o C
//  Versione per cartella /hex/
// ===============================================

// Slot attivo (A, B o C)
let gitSlot = null;

// Apri popup e carica cartella principale
function apriGitBrowser(slot) {
    gitSlot = slot;
    caricaCartellaGitPages("hex/memorie_x_tipo");
    document.getElementById("gitPopup").style.display = "block";
}

// Chiudi popup
function chiudiPopup() {
    document.getElementById("gitPopup").style.display = "none";
}

// Legge una cartella da GitHub Pages (NO API)
function caricaCartellaGitPages(path) {
    const url = `https://balza1979.github.io/progetto_x2/${path}/`;

    fetch(url)
        .then(r => r.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const list = document.getElementById("gitList");
            list.innerHTML = "";

            // Titolo percorso corrente
            list.innerHTML += `<div class="git-path">📂 ${path}</div>`;

            doc.querySelectorAll("a").forEach(a => {
                const name = a.textContent;

                if (name === "../") return;

                if (name.endsWith("/")) {
                    const folder = name.slice(0, -1);
                    list.innerHTML += `
                        <div class="git-item folder"
                             onclick="caricaCartellaGitPages('${path}/${folder}')">
                             📁 ${folder}
                        </div>`;
                } else {
                    list.innerHTML += `
                        <div class="git-item file"
                             onclick="caricaFileGitPages('${path}/${name}')">
                             📄 ${name}
                        </div>`;
                }
            });
        })
        .catch(err => {
            console.error("Errore lettura cartella:", err);
            alert("Errore nel leggere la cartella su GitHub Pages");
        });
}

// Carica file HEX o BIN
function caricaFileGitPages(path) {
    const url = `https://balza1979.github.io/progetto_x2/${path}`;

    fetch(url)
        .then(r => r.arrayBuffer())
        .then(buffer => {
            const bytes = new Uint8Array(buffer);
            const isHex = (bytes[0] === 58); // ':'

            let mem;

            if (isHex) {
                const text = new TextDecoder().decode(bytes);
                mem = hexToMemoryMap(text);
            } else {
                mem = binToMemoryMap(bytes);
            }

            if (gitSlot === "A") memoriaA = mem;
            if (gitSlot === "B") memoriaB = mem;
            if (gitSlot === "C") memoriaC = mem;

            document.getElementById("labelFile" + gitSlot).innerText =
                `FILE ${gitSlot} (caricato da Git)`;

            chiudiPopup();
        })
        .catch(err => {
            console.error("Errore caricamento file:", err);
            alert("Errore nel caricare il file da GitHub Pages");
        });
}
