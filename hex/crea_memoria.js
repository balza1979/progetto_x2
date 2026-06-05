// CREA_MEMORIA.JS – Versione 2026-06-05

let memoriaA = null;
let memoriaB = null;

function leggiFileHex(input, callback) {
    const file = input.files[0];
    if (!file) return callback(null);
    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsText(file);
}

function hexToMemoryMap(hexText) {
    const lines = hexText.split(/\r?\n/);
    const mem = {};
    for (let line of lines) {
        if (!line.startsWith(":")) continue;
        const byteCount = parseInt(line.substr(1, 2), 16);
        const address = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);
        if (recordType !== 0) continue;
        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }
    return mem;
}

function fakeFile(nome, contenuto) {
    const blob = new Blob([contenuto], { type: "text/plain" });
    const file = new File([blob], nome, { type: "text/plain" });
    const dt = new DataTransfer();
    dt.items.add(file);
    return dt.files;
}

function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");
    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    document.getElementById("info-memoria-a").textContent = hexA ? "caricata" : "non caricata";
    document.getElementById("info-memoria-b").textContent = hexB ? "caricata" : "non caricata";

    blocco.style.display = (hexA && hexB) ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const hexA = localStorage.getItem("memA_hex");
    const nomeA = localStorage.getItem("memA_nome");

    const hexB = localStorage.getItem("memB_hex");
    const nomeB = localStorage.getItem("memB_nome");

    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);
        const fakeA = fakeFile(nomeA || "FILE_A.hex", hexA);
        document.getElementById("file1").files = fakeA;
        document.getElementById("labelFileA").textContent = `FILE A: ${nomeA}`;
    }

    if (hexB) {
        memoriaB = hexToMemoryMap(hexB);
        const fakeB = fakeFile(nomeB || "FILE_B.hex", hexB);
        document.getElementById("file2").files = fakeB;
        document.getElementById("labelFileB").textContent = `FILE B: ${nomeB}`;
    }

    aggiornaBloccoCreazione();
});

function onFileA_Change() {
    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;
    leggiFileHex(inputA, hexA => {
        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);
        document.getElementById("labelFileA").textContent = "FILE A (locale)";
        aggiornaBloccoCreazione();
    });
}

function onFileB_Change() {
    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;
    leggiFileHex(inputB, hexB => {
        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);
        document.getElementById("labelFileB").textContent = "FILE B (locale)";
        aggiornaBloccoCreazione();
    });
}

let slotCorrente = null;

function selezionaSlot(slot) {
    slotCorrente = slot;
    document.getElementById("selettoreGit").style.display = "block";
    caricaListaGit("/");
}

document.getElementById("btnChiudiGitList").onclick = () => {
    document.getElementById("selettoreGit").style.display = "none";
};

document.getElementById("btnConfermaGit").onclick = () => {
    document.getElementById("selettoreGit").style.display = "none";
    if (slotCorrente && fileGitSelezionato) {
        caricaDaGit(slotCorrente, fileGitSelezionato);
    }
};

let fileGitSelezionato = null;

function caricaListaGit(path) {
    const base = "https://api.github.com/repos/balza1979/progetto_x2/contents/hex" + path;
    fetch(base)
        .then(r => r.json())
        .then(lista => {
            const div = document.getElementById("gitList");
            div.innerHTML = "";

            lista.forEach(item => {
                const el = document.createElement("div");
                el.className = "git-item";

                if (item.type === "dir") {
                    el.style.color = "#ffcc66";
                    el.textContent = "📁 " + item.name;
                    el.onclick = () => caricaListaGit(path + "/" + item.name);
                } else {
                    el.style.color = "#99ddff";
                    el.textContent = "📄 " + item.name;
                    el.onclick = () => {
                        fileGitSelezionato = item.path.replace("hex/", "");
                        document.getElementById("btnConfermaGit").style.display = "block";
                    };
                }

                div.appendChild(el);
            });
        });
}

function caricaDaGit(slot, relativePath) {
    const url = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/hex/" + relativePath;

    fetch(url)
        .then(r => r.text())
        .then(hex => {
            if (slot === "A") {
                localStorage.setItem("memA_hex", hex);
                localStorage.setItem("memA_nome", relativePath);
                document.getElementById("labelFileA").textContent = "FILE A (Git)";
            }
            if (slot === "B") {
                localStorage.setItem("memB_hex", hex);
                localStorage.setItem("memB_nome", relativePath);
                document.getElementById("labelFileB").textContent = "FILE B (Git)";
            }
            aggiornaBloccoCreazione();
            alert("File Git caricato in " + slot);
        });
}

function resetCreazione() {
    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memA_nome");
    localStorage.removeItem("memB_nome");
    location.reload();
}

document.getElementById("btn-conferma-nome-c").onclick = () => {
    const nome = document.getElementById("nome-memoria-c").value.trim();
    if (!nome) return alert("Inserisci un nome");
    alert("Memoria C salvata come: " + nome);
};
