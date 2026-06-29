// ======================================================================
// FILE: x2_ui (RIPRISTINO 10 6 26 1516 — VERSIONE PRO (HEX VERSION))
// ======================================================================

// ------------------------------------------------------------
// VARIABILI GLOBALI
// ------------------------------------------------------------
let ultimoParametro = null;
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

    const indirizzo = parseInt(param.LIBERA1, 16);   // CORRETTO
    if (isNaN(indirizzo) || indirizzo < 0 || indirizzo >= memC.length) return;

    //const byte = parseInt(nuovoValore) & 0xFF;
    const byte = Number(nuovoValore);

    memC[indirizzo] = byte;

    memC_modificata = true;
    salvaMemoriaC();
}
// fine blocco 1 29 6 26
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
// SOTTOMENU
// ======================================================================
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
// fine blocco 2 29 6 26
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

    if (tipo === "SIGNED" || tipo === "S") {
        if (byte > 127) valore = byte - 256;
    }

    valore = valore * scala;

    return valore.toString();
}
// fine blocco 3 29 6 26
// ======================================================================
// INFO PARAMETRO
// ======================================================================
function x2_mostraInfoParametro(param) {

    // ============================================================
    // >>> CALCOLO VALORI A / B / C (VERSIONE DEFINITIVA) <<<
    // ============================================================
    valoreA = "—";
    valoreB = "—";
    valoreC = "—";

    const indirizzo = parseInt(param.LIBERA1, 16);

    if (!isNaN(indirizzo)) {

        if (memA && memA[indirizzo] !== undefined) {
            valoreA = convertValueFromByte(param, memA[indirizzo]);
        }

        if (memB && memB[indirizzo] !== undefined) {
            valoreB = convertValueFromByte(param, memB[indirizzo]);
        }

        if (memC && memC[indirizzo] !== undefined) {
            //valoreC = convertValueFromByte(param, memC[indirizzo]);
            valoreC = memC[indirizzo];

        }
    }

    // ============================================================
    // >>> AGGIORNAMENTO UI <<< 
    // ============================================================
    const box = document.getElementById("info_parametro");

    box.innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore:</b> ${param.VALORE}<br><br>

        <b>Valore A:</b> ${valoreA}<br>
        <b>Valore B:</b> ${valoreB}<br>
        <b>Valore C:</b> ${valoreC}<br><br>

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

          const valorePulito = valoreC.toString().padStart(2, "0");
          tendina.value = valorePulito;


        // 🔥 chiamata iniziale corretta
        x2_aggiornaValoriDaSelezione(param, data, valorePulito);

        const codiceParam = param.PARAMETRO;

tendina.onchange = function () {
    const nuovoValore = this.value.toString().trim().padStart(2, "0");

    const p = x2_parametri.find(x => x.PARAMETRO === codiceParam);
    if (!p) return;

    if (memC) {
        updateMemoriaC(p, nuovoValore);

        modificheInCorso = true;
        document.getElementById("btn_salva_parametro").disabled = false;

        x2_mostraInfoParametro(p);
        x2_popolaValori(p);
        aggiornaColoreValore();
    }

    x2_aggiornaValoriDaSelezione(p, data, nuovoValore);
};

    });

    return;
}
//} // aggiunta 

// fine blocco 4 29 6 26 

// ------------------------------------------------------------
// 2) MIN_MAX (versione PRO con input + spinner)
// ------------------------------------------------------------
if (param.TIPO_ELENCO === "MIN_MAX") {

    // 🔥 NASCONDI LA TENDINA (NON PUÒ GESTIRE 65000 VALORI)
    tendina.style.display = "none";

    // 🔥 RIMUOVI EVENTUALI INPUT PRECEDENTI
    const oldInput = document.getElementById("input_minmax");
    if (oldInput) oldInput.remove();

    // 🔥 CREA WRAPPER
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = "100%";

    // 🔥 CREA INPUT NUMERICO
    const input = document.createElement("input");
    input.type = "text";
    input.id = "input_minmax";
    input.className = "full";

    // 🔥 STILE COPIATO DALLA TENDINA
    const cs = getComputedStyle(tendina);
    input.style.backgroundColor = cs.backgroundColor;
    input.style.color = cs.color;
    input.style.border = cs.border;
    input.style.borderRadius = cs.borderRadius;
    input.style.paddingRight = "28px";
    input.style.height = cs.height;
    input.style.fontSize = cs.fontSize;
    input.style.fontFamily = cs.fontFamily;
    input.style.boxSizing = "border-box";
    input.style.width = "100%";

    // 🔥 MOSTRA IL VALORE C
    const indirizzo = parseInt(param.LIBERA1, 16);
    const valoreC = memC[indirizzo];
    input.value = valoreC.toString();

    // 🔥 CREA SPINNER
    const spinner = document.createElement("div");
    spinner.style.position = "absolute";
    spinner.style.right = "4px";
    spinner.style.top = "0";
    spinner.style.bottom = "0";
    spinner.style.width = "20px";
    spinner.style.display = "flex";
    spinner.style.flexDirection = "column";
    spinner.style.justifyContent = "center";
    spinner.style.cursor = "pointer";

    const btnUp = document.createElement("div");
    btnUp.textContent = "▲";
    btnUp.style.fontSize = "10px";
    btnUp.style.textAlign = "center";

    const btnDown = document.createElement("div");
    btnDown.textContent = "▼";
    btnDown.style.fontSize = "10px";
    btnDown.style.textAlign = "center";

    spinner.appendChild(btnUp);
    spinner.appendChild(btnDown);

    // ------------------------------------------------------------
    // INPUT: solo numeri
    // ------------------------------------------------------------
    input.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
    });

    // ------------------------------------------------------------
    // BLUR: aggiorna memC
    // ------------------------------------------------------------
    input.addEventListener("blur", function () {

        let v = parseInt(this.value);
        if (isNaN(v)) return;

        const min = parseInt(param.MIN);
        const max = parseInt(param.MAX);

        if (v < min) v = min;
        if (v > max) v = max;

        this.value = v.toString();

        updateMemoriaC(param, this.value);

        modificheInCorso = true;
        document.getElementById("btn_salva_parametro").disabled = false;

        x2_mostraInfoParametro(param);
        aggiornaColoreValore();
    });

    // ------------------------------------------------------------
    // SPINNER UP
    // ------------------------------------------------------------
    btnUp.addEventListener("click", function () {

        let v = parseInt(input.value) || 0;
        const max = parseInt(param.MAX);
        if (v < max) v++;

        input.value = v.toString();

        updateMemoriaC(param, input.value);

        modificheInCorso = true;
        document.getElementById("btn_salva_parametro").disabled = false;

        x2_mostraInfoParametro(param);
        aggiornaColoreValore();
    });

    // ------------------------------------------------------------
    // SPINNER DOWN
    // ------------------------------------------------------------
    btnDown.addEventListener("click", function () {

        let v = parseInt(input.value) || 0;
        const min = parseInt(param.MIN);
        if (v > min) v--;

        input.value = v.toString();

        updateMemoriaC(param, input.value);

        modificheInCorso = true;
        document.getElementById("btn_salva_parametro").disabled = false;

        x2_mostraInfoParametro(param);
        aggiornaColoreValore();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(spinner);

    tendina.parentNode.insertBefore(wrapper, tendina);

    return;
}

    // ------------------------------------------------------------
    // 3) DECIMALE
    // ------------------------------------------------------------
    if (param.TIPO_ELENCO === "DECIMALE") {

        const min = parseFloat(param.MIN);
        const max = parseFloat(param.MAX);
        const dec = parseInt(param.DECIMALI);
        const step = 1 / Math.pow(10, dec);

        for (let v = min; v <= max + 0.0000001; v += step) {
            const opt = document.createElement("option");
            const val = v.toFixed(dec);
            opt.value = val.padStart(2, "0");
            opt.textContent = val.padStart(2, "0");
            tendina.appendChild(opt);
        }

        tendina.value = String(param.VALORE).padStart(2, "0");
        return;
    }

    // ------------------------------------------------------------
    // 4) FALLBACK
    // ------------------------------------------------------------
    tendina.innerHTML = "<option>— nessun valore —</option>";
}

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
            //btn.onclick = () => window.open("img/" + lista[i - 1], "_blank");
  btn.onclick = () => {

    // 1) apri immagine
    window.open("img/" + lista[i - 1], "_blank");

   // // 2) salva valore vero sbagliato c in info par c sempre = 0 dopo modifica 
   // const indirizzo = parseInt(param.LIBERA1, 16);
   // const byte = memC[indirizzo] = parseInt(valore, 16);
   // param.VALORE = convertValueFromByte(param, byte);
   // memC_modificata = true;

// versione 29 6 26
        const indirizzo = parseInt(param.LIBERA1, 16);

// valore è DECIMALE, NON HEX
const byte = parseInt(valore);

memC[indirizzo] = byte;
param.VALORE = byte.toString().padStart(2, "0");

memC_modificata = true;

      
    // 3) imposta il parametro attivo nella UI
    x2_parametroSelezionato = param.PARAMETRO;

    // 4) aggiorna subito la UI
    x2_mostraInfoParametro(param);
      aggiornaColoreValore();

};


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

// ============================================================
// >>> CARICO MEMORIE A, B, C DAL LOCALSTORAGE (VERSIONE CORRETTA) <<<
// ============================================================
const hexA = localStorage.getItem("memA_hex");
const hexB = localStorage.getItem("memB_hex");
const hexC = localStorage.getItem("memC_hex");

memA = hexA ? hexToMemoryMap(hexA) : null;
memB = hexB ? hexToMemoryMap(hexB) : null;
memC = hexC ? hexToMemoryMap(hexC) : null;
// ============================================================
// >>> FINE BLOCCO NUOVO <<<
// ============================================================


    
    const selMenu      = document.getElementById("menu");
    const selSottomenu = document.getElementById("sottomenu");
    const selParametro = document.getElementById("parametro");
    const selValore    = document.getElementById("tendina_valori");

    document.getElementById("btn_salva_parametro").disabled = true;

    selValore.classList.add("tendina_verde");

    selValore.addEventListener("change", function () {

        if (memC) {
            modificheInCorso = true;
            document.getElementById("btn_salva_parametro").disabled = false;
            aggiornaColoreValore();

        }
    });

   document.getElementById("btn_salva_parametro").addEventListener("click", function () {

    if (!ultimoParametro) return;

    const val = document.getElementById("tendina_valori").value;

    updateMemoriaC(ultimoParametro, val);

    // 🔥 AGGIORNA SUBITO LA UI DOPO IL SALVATAGGIO
    x2_mostraInfoParametro(ultimoParametro);
            const indirizzo = parseInt(ultimoParametro.LIBERA1, 16);
aggiornaColoreValore(indirizzo);
    x2_popolaValori(ultimoParametro);
    x2_aggiornaParamButtons(ultimoParametro.PARAMETRO);

    modificheInCorso = false;

    document.getElementById("btn_salva_parametro").disabled = true;

    alert("Valore salvato. VERS UI 25 6 26 14 57");
});


    x2_popolaMenu();

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

        const codice = sel.options[nuovo].value;
        ultimoParametro = x2_parametri.find(p => p.PARAMETRO === codice);

        sel.dispatchEvent(new Event("change"));
    }

    document.getElementById("parametro_up").onclick   = () => x2_cambiaParametro(-1);
    document.getElementById("parametro_down").onclick = () => x2_cambiaParametro(+1);

    selMenu.addEventListener("change", function () {

        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        x2_popolaSottomenu(this.value);
        selSottomenu.dispatchEvent(new Event("change"));
        x2_aggiornaMenuButtons(this.value);
    });

    selSottomenu.addEventListener("change", function () {

        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        x2_popolaParametri(this.value);
        selParametro.dispatchEvent(new Event("change"));
        x2_aggiornaSottomenuButtons(selMenu.value, this.value);
    });

    selParametro.addEventListener("change", function () {

        if (modificheInCorso) {

            const parametroOriginale = ultimoParametro.PARAMETRO;
            const conferma = confirm("Hai modifiche non salvate. Vuoi salvare prima di cambiare parametro?");

            if (!conferma) {
                this.value = parametroOriginale;

                const p = x2_parametri.find(x => x.PARAMETRO === parametroOriginale);
                if (p) {
                    ultimoParametro = p;
                    x2_mostraInfoParametro(ultimoParametro);
                    const indirizzo = parseInt(ultimoParametro.LIBERA1, 16);
                    aggiornaColoreValore(indirizzo);
                }

                modificheInCorso = false;
                document.getElementById("btn_salva_parametro").disabled = true;
                return;
            }

            const val = document.getElementById("tendina_valori").value;
            updateMemoriaC(ultimoParametro, val);

            modificheInCorso = false;
            document.getElementById("btn_salva_parametro").disabled = true;
        }

        const codice = this.value;
        const p = x2_parametri.find(x => x.PARAMETRO === codice);
        if (!p) return;

        ultimoParametro = p;
        x2_mostraInfoParametro(ultimoParametro);
        x2_popolaValori(ultimoParametro);
           x2_aggiornaParamButtons(ultimoParametro.PARAMETRO);
        aggiornaColoreValore();

    });

    document.getElementById("crea_hex_btn").onclick = function () {
        window.open("https://balza1979.github.io/progetto_x2/hex/crea_memoria.html", "_blank");
    };

    window.addEventListener("beforeunload", function (e) {
        if (!modificheInCorso) return;

        e.preventDefault();
        e.returnValue = "";
    });
});
