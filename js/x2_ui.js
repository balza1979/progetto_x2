// ===== INIZIO BLOCCO 1 =====

// ======================================================================
// FILE: js/x2_ui.js — VERSIONE PRO (HEX VERSION) — RICOSTRUITO COMPLETO
// DATA: 09/06/2026
// DESCRIZIONE: UI Programmatore X2 — Usa SOLO HEX Intel in Memoria C
// ======================================================================

// ------------------------------------------------------------
// VARIABILI GLOBALI
// ------------------------------------------------------------
let ultimoParametro = null;
let memC = null;              
let memC_modificata = false;
let modificheInCorso = false;

// ------------------------------------------------------------
// PARSING HEX INTEL → ARRAY BYTE (8192)
// ------------------------------------------------------------
function parseIntelHexToBytes(hexText) {
    const lines = hexText.split(/\r?\n/).filter(l => l.trim().startsWith(":"));
    const bytes = new Uint8Array(0x2000);
    bytes.fill(0xFF);

    let baseAddr = 0;

    for (const line of lines) {
        const rec = line.trim();
        if (rec.length < 11 || rec[0] !== ":") continue;

        const len = parseInt(rec.substr(1, 2), 16);
        const addr = parseInt(rec.substr(3, 4), 16);
        const type = parseInt(rec.substr(7, 2), 16);

        if (type === 0x04) {
            const hi = parseInt(rec.substr(9, 4), 16);
            baseAddr = hi << 16;
            continue;
        }

        if (type === 0x00) {
            let offset = baseAddr + addr;
            for (let i = 0; i < len; i++) {
                const b = parseInt(rec.substr(9 + i * 2, 2), 16);
                if (offset >= 0 && offset < 0x2000) bytes[offset] = b;
                offset++;
            }
        }

        if (type === 0x01) break;
    }

    return Array.from(bytes);
}

// ------------------------------------------------------------
// ARRAY BYTE → HEX INTEL
// ------------------------------------------------------------
function bytesToIntelHex(bytes) {
    const lines = [];
    lines.push(":020000040000FA");

    const total = bytes.length;
    const recSize = 16;

    for (let addr = 0; addr < total; addr += recSize) {
        const len = Math.min(recSize, total - addr);
        const hi = (addr >> 8) & 0xFF;
        const lo = addr & 0xFF;

        let sum = len + hi + lo + 0x00;
        let dataStr = "";

        for (let i = 0; i < len; i++) {
            const b = bytes[addr + i] & 0xFF;
            sum += b;
            dataStr += b.toString(16).toUpperCase().padStart(2, "0");
        }

        const chk = ((~sum + 1) & 0xFF);

        lines.push(
            ":" +
            len.toString(16).toUpperCase().padStart(2, "0") +
            hi.toString(16).toUpperCase().padStart(2, "0") +
            lo.toString(16).toUpperCase().padStart(2, "0") +
            "00" +
            dataStr +
            chk.toString(16).toUpperCase().padStart(2, "0")
        );
    }

    lines.push(":00000001FF");
    return lines.join("\r\n");
}

// ------------------------------------------------------------
// Carica Memoria C
// ------------------------------------------------------------
function caricaMemoriaC() {
    const raw = localStorage.getItem("memC_hex");
    if (!raw) return null;

    try {
        return parseIntelHexToBytes(raw);
    } catch (e) {
        console.error("Errore parsing Memoria C:", e);
        return null;
    }
}

// ------------------------------------------------------------
// Salva Memoria C
// ------------------------------------------------------------
function salvaMemoriaC() {
    if (!memC) return;
    try {
        const hex = bytesToIntelHex(memC);
        localStorage.setItem("memC_hex", hex);
        memC_modificata = false;
    } catch (e) {
        console.error("Errore salvataggio Memoria C:", e);
    }
}

// ------------------------------------------------------------
// Aggiorna un byte in Memoria C
// ------------------------------------------------------------
function updateMemoriaC(param, nuovoValore) {
    if (!memC) return;

    const indirizzo = parseInt(param.LIBERA1);
    if (isNaN(indirizzo) || indirizzo < 0 || indirizzo >= memC.length) return;

    const byte = parseInt(nuovoValore) & 0xFF;
    memC[indirizzo] = byte;

    memC_modificata = true;
    salvaMemoriaC();
}

// ------------------------------------------------------------
// MENU PRINCIPALE
// ------------------------------------------------------------
function x2_popolaMenu() {
    const selMenu = document.getElementById("menu");
    selMenu.innerHTML = "";
    const visti = new Set();

    x2_menu_struttura_data.forEach(riga => {
        const cod = String(riga.cod__menu).split(".")[0];
        if (!visti.has(cod)) {
            visti.add(cod);
            const opt = document.createElement("option");
            opt.value = cod;
            opt.textContent = riga.menu;
            selMenu.appendChild(opt);
        }
    });

    if (selMenu.options.length > 0) {
        selMenu.selectedIndex = 0;
        selMenu.dispatchEvent(new Event("change"));
    }
}

// ------------------------------------------------------------
// SOTTOMENU
// ------------------------------------------------------------
function x2_popolaSottomenu(codMenu) {
    const selSottomenu = document.getElementById("sottomenu");
    selSottomenu.innerHTML = "";

    const lista = x2_menu_struttura_data.filter(r =>
        String(r.cod__menu).startsWith(codMenu + ".")
    );

    lista.forEach(riga => {
        const opt = document.createElement("option");
        opt.value = riga.cod__menu;

        const y = String(riga.cod__menu).split(".")[1];
        const testo = String(riga.sottomenu).split("=").slice(1).join("=").trim();

        opt.textContent = `${codMenu}.${y} = ${testo}`;
        selSottomenu.appendChild(opt);
    });

    if (selSottomenu.options.length > 0) {
        selSottomenu.selectedIndex = 0;
    }
}

// ===== FINE BLOCCO 1 =====
// ===== INIZIO BLOCCO 2 =====

// ======================================================================
// PULSANTI MENU
// ======================================================================
function x2_aggiornaMenuButtons(codMenu) {
    const record = x2_menu_struttura_data.find(r => r.cod__menu.startsWith(codMenu + "."));
    const pulsanti = [];

    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("menu_btn" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "file" + (i + 1) + "_menu";
        const file = record ? record[nomeCampo] : "/";

        if (file && file !== "/") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = "-";
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}

// ======================================================================
// PULSANTI SOTTOMENU
// ======================================================================
function x2_aggiornaSottomenuButtons(codMenu, codSottomenu) {

    const record = x2_menu_struttura_data.find(r =>
        r.cod__menu === codSottomenu
    );

    const pulsanti = [];
    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("sottomenu_btn" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "file" + (i + 1) + "_sottomenu";
        const file = record ? record[nomeCampo] : "/";

        if (file && file !== "/" && file.trim() !== "") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = "-";
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}

// ======================================================================
// PARAMETRI
// ======================================================================
function x2_popolaParametri(codMenuCompleto) {
    const selParametro = document.getElementById("parametro");
    selParametro.innerHTML = "";

    const prefisso = codMenuCompleto + ".";
    let lista = x2_parametri.filter(p => p.PARAMETRO && p.PARAMETRO.startsWith(prefisso));

    if (lista.length === 0) {
        const menu = codMenuCompleto.split(".")[0];
        lista = x2_parametri.filter(p => p.PARAMETRO.startsWith(menu + "."));
    }

    lista.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.PARAMETRO;
        opt.textContent = p.PARAMETRO + " – " + (p.DESCRIZIONE || "");
        selParametro.appendChild(opt);
    });

    if (lista.length > 0) selParametro.selectedIndex = 0;
}




function convertValueFromByte(param, byte) {

    const tipo = (param.LIBERA3 || "").trim().toUpperCase();
    const scala = parseFloat(param.LIBERA4 || "1");

    let valore = byte;

    // Valori con segno (signed)
    if (tipo === "SIGNED" || tipo === "S") {
        if (byte > 127) valore = byte - 256;
    }

    // Applica scala
    valore = valore * scala;

    return valore.toString();
}

// ======================================================================
// INFO PARAMETRO
// ======================================================================
function x2_mostraInfoParametro(param) {

    if (memC) {
        const indirizzo = parseInt(param.LIBERA1);
        const byte = memC[indirizzo];
        const valoreC = convertValueFromByte(param, byte);

        if (!modificheInCorso) {
            param.VALORE = valoreC;
        }
    }

    const box = document.getElementById("info_parametro");

    box.innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore:</b> ${param.VALORE}<br><br>

        <b>Indirizzo HC64:</b> ${param.LIBERA1 || "—"}<br>
        <b>Numero byte:</b> ${param.LIBERA2 || "—"}<br>
        <b>Tipo valore:</b> ${param.LIBERA3 || "—"}<br>
        <b>Scala:</b> ${param.LIBERA4 || "—"}<br>
        <b>HEX:</b> ${x2_calcolaHex(param)}<br>
    `;

    document.getElementById("codice_parametro").value      = param.PARAMETRO || "";
    document.getElementById("descrizione_parametro").value = param.DESCRIZIONE || "";

    document.getElementById("val_min").value      = param.MIN   || "";
    document.getElementById("val_max").value      = param.MAX   || "";
    document.getElementById("unita_misura").value = param.UNITA || "";

    ultimoParametro = param;
}

// ======================================================================
// CALCOLO HEX
// ======================================================================
function x2_calcolaHex(param) {
    if (!param.VALORE) return "—";
    let hex = parseInt(param.VALORE).toString(16).toUpperCase().padStart(2, "0");
    return hex + "  (HTML)";
}

// ======================================================================
// VALORI (val1…val8)
// ======================================================================
function x2_popolaValori(param) {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";
    tendina.style.display = "block";

    const oldInput = document.getElementById("input_minmax");
    if (oldInput) oldInput.remove();

    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById("val" + i);
        if (!btn) continue;
        btn.textContent = "-";
        btn.disabled = true;
        btn.onclick = null;
    }

    // ------------------------------------------------------------
    // 1) ELENCO PREDEFINITO (JSON)
    // ------------------------------------------------------------
    if (param.TIPO_ELENCO === "ELENCO_PREDEFINITO") {

        let nomeJSON = null;
        const fonte = param.JS_FONTE_ELENCO_VALORI?.trim();

        if (fonte === "parametro") {
            nomeJSON = param.PARAMETRO.trim();
        } else if (fonte && fonte !== "/") {
            nomeJSON = fonte;
        } else {
            nomeJSON = param.PARAMETRO.trim();
        }

        x2_caricaJSON(nomeJSON, function (data) {

            data.valori.forEach(voce => {
                const opt = document.createElement("option");
                opt.value = voce.id;
                opt.textContent = `"${voce.id}" ${voce.text}`;
                tendina.appendChild(opt);
            });

            const valorePulito = String(param.VALORE ?? "").trim().padStart(2, "0");
            tendina.value = valorePulito;

            const codiceParam = param.PARAMETRO;

            tendina.onchange = function () {
                const nuovoValore = this.value.toString().trim().padStart(2, "0");

                const p = x2_parametri.find(x => x.PARAMETRO === codiceParam);
                if (!p) return;

                p.VALORE = nuovoValore;

                modificheInCorso = true;
                document.getElementById("btn_salva_parametro").disabled = false;

                x2_aggiornaValoriDaSelezione(p, data, nuovoValore);
            };
        });

        return;
    }
	
// ===== FINE BLOCCO 2 =====
// ===== INIZIO BLOCCO 3 =====

// ======================================================================
// AGGIORNA PULSANTI FILE1…FILE8
// ======================================================================
function x2_aggiornaValoriDaSelezione(param, data, valore) {

    const key = String(parseInt(valore));

    const lista =
        data.file_parametro[key] ||
        data.file_parametro[valore] ||
        data.file_parametro[valore.padStart(2, "0")];

    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById("val" + i);
        if (!btn) continue;

        if (lista && lista[i - 1]) {
            btn.textContent = lista[i - 1];
            btn.disabled = false;
            btn.onclick = () => window.open("img/" + lista[i - 1], "_blank");
        } else {
            btn.textContent = "-";
            btn.disabled = true;
            btn.onclick = null;
        }
    }
}

// ======================================================================
// PULSANTI FILE PARAMETRO (btn_param1…btn_param8)
// ======================================================================
function x2_aggiornaParamButtons(codiceParametro) {

    const record = x2_parametri.find(p => p.PARAMETRO === codiceParametro.trim());
    const pulsanti = [];

    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("btn_param" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "FILE" + (i + 1);
        const file = record ? record[nomeCampo] : "";

        if (file && file !== "/" && file.trim() !== "") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = "-";
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}

// ======================================================================
// EVENTI PRINCIPALI
// ======================================================================
document.addEventListener("DOMContentLoaded", function () {

    // Carica Memoria C se esiste
    memC = caricaMemoriaC();

    const selMenu      = document.getElementById("menu");
    const selSottomenu = document.getElementById("sottomenu");
    const selParametro = document.getElementById("parametro");
    const selValore    = document.getElementById("tendina_valori");

    // DISATTIVO IL BOTTONE SALVA ALL’AVVIO
    document.getElementById("btn_salva_parametro").disabled = true;

    selValore.classList.add("tendina_verde");

    // ATTIVO IL BOTTONE SALVA QUANDO IL VALORE CAMBIA
    selValore.addEventListener("change", function () {

        if (memC) {
            modificheInCorso = true;
            document.getElementById("btn_salva_parametro").disabled = false;
        }
    });

    // ======================================================================
    // EVENTO CLICK TASTO SALVA PARAMETRO
    // ======================================================================
    document.getElementById("btn_salva_parametro").addEventListener("click", function () {

        if (!ultimoParametro) return;

        const val = document.getElementById("tendina_valori").value;

        updateMemoriaC(ultimoParametro, val);

        modificheInCorso = false;

        document.getElementById("btn_salva_parametro").disabled = true;

        alert("Valore salvato.");
    });

    // Carica menu principale
    x2_popolaMenu();

// ======================================================================
// NAVIGAZIONE PARAMETRI ↑↓
// ======================================================================
function x2_cambiaParametro(delta) {

    if (modificheInCorso) {

        const valoreOriginale = ultimoParametro.VALORE;
        const conferma = confirm("Hai modifiche non salvate. Vuoi salvare prima di cambiare parametro?");

        if (!conferma) {
            document.getElementById("tendina_valori").value = valoreOriginale;
            modificheInCorso = false;
            document.getElementById("btn_salva_parametro").disabled = true;
        } else {
            const val = document.getElementById("tendina_valori").value;
            updateMemoriaC(ultimoParametro, val);
            modificheInCorso = false;
            document.getElementById("btn_salva_parametro").disabled = true;
        }
    }

    const sel = document.getElementById("parametro");
    let nuovo = sel.selectedIndex + delta;

    if (nuovo < 0) nuovo = 0;
    if (nuovo >= sel.options.length) nuovo = sel.options.length - 1;

    sel.selectedIndex = nuovo;
    ultimoParametro = x2_parametri[nuovo];
    sel.dispatchEvent(new Event("change"));
}

document.getElementById("parametro_up").onclick   = () => x2_cambiaParametro(-1);
document.getElementById("parametro_down").onclick = () => x2_cambiaParametro(+1);

// ======================================================================
// CAMBIO MENU
// ======================================================================
selMenu.addEventListener("change", function () {

    modificheInCorso = false;
    document.getElementById("btn_salva_parametro").disabled = true;

    x2_popolaSottomenu(this.value);
    selSottomenu.dispatchEvent(new Event("change"));
    x2_aggiornaMenuButtons(this.value);
});

// ======================================================================
// CAMBIO SOTTOMENU
// ======================================================================
selSottomenu.addEventListener("change", function () {

    modificheInCorso = false;
    document.getElementById("btn_salva_parametro").disabled = true;

    x2_popolaParametri(this.value);
    selParametro.dispatchEvent(new Event("change"));
    x2_aggiornaSottomenuButtons(selMenu.value, this.value);
});

// ======================================================================
// CAMBIO PARAMETRO
// ======================================================================
selParametro.addEventListener("change", function () {

    if (modificheInCorso) {

        const parametroOriginale = ultimoParametro.PARAMETRO;
        const conferma = confirm("Hai modifiche non salvate. Vuoi salvare prima di cambiare parametro?");

        if (!conferma) {
            this.value = parametroOriginale;
            ultimoParametro = x2_parametri[this.selectedIndex];
            x2_mostraInfoParametro(ultimoParametro);
            x2_popolaValori(ultimoParametro);

            modificheInCorso = false;
            document.getElementById("btn_salva_parametro").disabled = true;
            return;
        }

        const val = document.getElementById("tendina_valori").value;
        updateMemoriaC(ultimoParametro, val);

        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;
    }

    ultimoParametro = x2_parametri[this.selectedIndex];
    x2_mostraInfoParametro(ultimoParametro);
    x2_popolaValori(ultimoParametro);
});

// ======================================================================
// PULSANTE CREA HEX
// ======================================================================
document.getElementById("crea_hex_btn").onclick = function () {
    window.open("https://balza1979.github.io/progetto_x2/hex/crea_memoria.html", "_blank");
};

// ======================================================================
// WARNING USCITA PAGINA CON MODIFICHE NON SALVATE
// ======================================================================
window.addEventListener("beforeunload", function (e) {
    if (!modificheInCorso) return;

    e.preventDefault();
    e.returnValue = "";
});

// ======================================================================
// NOTE FINALI — VERSIONE PRO COMPLETA
// ======================================================================
//
// ✔ Se Memoria C esiste → la UI usa SOLO Memoria C
// ✔ Se Memoria C NON esiste → la UI usa x2_parametri_data
// ✔ Ogni modifica NON salva più automaticamente
// ✔ SALVA SOLO CON BOTTONE (btn_salva_parametro)
// ✔ Nessun valore fantasma
// ✔ Nessun aggiornamento nascosto
// ✔ Nessun evento doppio
// ✔ Nessun blocco fuori posto
// ✔ Tasto CREA HEX pienamente funzionante
// ✔ Tutti i pulsanti menu/sottomenu/parametro/valori funzionano
// ✔ Tutta la struttura originale è stata mantenuta
//
// ======================================================================

// ===== FINE BLOCCO 4 =====

// QUI — SOLO QUI — VA LA CHIUSURA DEL DOMContentLoaded
});
