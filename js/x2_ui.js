/* === INIZIO BLOCCO 1 (CORRETTO) === */

// ======================================================================
// FILE: x2_ui 11.01 modificato const indirizzo = parseInt(param.LIBERA1); righe 135 e 308— VERSIONE PRO (HEX VERSION) — CORRETTO
// ======================================================================
if (!window.memA) {
    x2_caricaHexDefault().then(() => {
        caricaMemorieGlobali();   // PRIMA
        x2_inizializzaUI();       // DOPO
    });
} else {
    caricaMemorieGlobali();       // PRIMA
    x2_inizializzaUI();           // DOPO
}
async function x2_caricaHexDefault() {
    try {
        const response = await fetch("Memorie/def_polli_b335f_ver1.HEX");
        const text = await response.text();

        const righe = text.split(/\r?\n/);
        const memoria = {};

        for (let i = 0; i < righe.length; i++) {
            const r = righe[i].trim();
            if (!r || r.startsWith("#")) continue;

            const parti = r.split(" ");
            if (parti.length >= 2) {
                const addr = parti[0].trim();
                const val  = parti[1].trim();
                memoria[addr] = val;
            }
        }

        window.memA = memoria;
        console.log("DEF POLLI caricata in memA");
    } catch (err) {
        console.error("Errore caricamento HEX default:", err);
        window.memA = null;
    }
}




// ------------------------------------------------------------
// VARIABILI GLOBALI
// ------------------------------------------------------------
let ultimoParametro = null;
//let memC = null;
//let memB = null;
let memC_modificata = false;
let modificheInCorso = false;


// === CARICAMENTO MEMORIE A/B/C ===
caricaMemorieGlobali();
// === MODIFICA 2026-06-15 16:30 INIZIO - caricaMemoriaA/B ===
memC = window.memC;

const soloA = (!window.memB && !window.memC);


if (soloA) {
    const daBloccare = [
        "btn_salva_parametro",
        "btn_salva_tutto",
        "btn_ripristina_A",
        "btn_ripristina_B",
        "btn_generazione_hex"
    ];

    daBloccare.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
}

// OBSOLETO — ora usiamo memorie_loader.js
function caricaMemoriaA() {
    return window.memA;
}

function caricaMemoriaB() {
    return window.memB;
}


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

/* === FINE BLOCCO 1 (CORRETTO) === */


/* === INIZIO BLOCCO 2 (CORRETTO) === */

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
// === MODIFICA 2026-06-15 16:10 INIZIO - updateMemoriaC ===
function updateMemoriaC(param, nuovoValore) {
    if (soloA) return;

    if (!memC) return;

    const indirizzo = parseInt(param.LIBERA1);
    if (isNaN(indirizzo) || indirizzo < 0 || indirizzo >= memC.length) return;

    const tipo  = (param.LIBERA3 || "").trim().toUpperCase();
    const scala = parseFloat(param.LIBERA4 || "1");

    let v = parseFloat(nuovoValore);
    if (isNaN(v)) return;

    // tolgo la scala per tornare al byte grezzo
    let raw = (scala !== 0) ? (v / scala) : v;

    if (tipo === "SIGNED" || tipo === "S") {
        raw = Math.round(raw);
        if (raw < -128) raw = -128;
        if (raw > 127)  raw = 127;
        if (raw < 0) raw = 256 + raw; // signed → unsigned
    } else {
        raw = Math.round(raw);
        if (raw < 0)   raw = 0;
        if (raw > 255) raw = 255;
    }

    memC[indirizzo] = raw & 0xFF;
    memC_modificata = true;
    salvaMemoriaC();
}
// === MODIFICA 2026-06-15 16:10 FINE - updateMemoriaC ===

// ============================================================
// INIZIALIZZAZIONE UI
// ============================================================
function x2_inizializzaUI() {
    // Popola menu e setup iniziale
    x2_popolaMenu();

    // Se serve, richiama altre funzioni di setup
    // x2_popolaValori(ultimoParametro);
    // x2_mostraInfoParametro(ultimoParametro);
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

/* === FINE BLOCCO 2 (CORRETTO) === */


/* === INIZIO BLOCCO 3 (CORRETTO) === */

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

    if (tipo === "SIGNED" || tipo === "S") {
        if (byte > 127) valore = byte - 256;
    }

    valore = valore * scala;

    return valore.toString();
}

// ======================================================================
// INFO PARAMETRO
// ======================================================================
function x2_mostraInfoParametro(param) {

    // Indirizzo in HEX → numero
    const indirizzo = parseInt(param.LIBERA1);

    // --- A (default) ---
    let valoreA = "—";
    if (memA) {
        const byteA = memA[indirizzo];
        valoreA = convertValueFromByte(param, byteA);
    }

    // --- B ---
    let valoreB = "—";
    if (memB) {
        const byteB = memB[indirizzo];
        valoreB = convertValueFromByte(param, byteB);
    }

    // --- C ---
    let valoreC = "—";
    if (memC) {
        const byteC = memC[indirizzo];
        valoreC = convertValueFromByte(param, byteC);
    }

    const box = document.getElementById("info_parametro");

    box.innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>

        <b>Valore A (default):</b> ${valoreA}<br>
        <b>Valore B (memoria B):</b> ${valoreB}<br>
        <b>Valore C (memoria C):</b> ${valoreC}<br><br>

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

/* === FINE BLOCCO 3 (CORRETTO) === */

/* === INIZIO BLOCCO 4 (CORRETTO) === */

// ======================================================================
// VALORI (val1…val8)
// ======================================================================
function x2_popolaValori(param) {
if (soloA) {
    // Modalità SOLO LETTURA: nessuna modifica permessa
    // Disabilito tendina e input
    const tendina = document.getElementById("tendina_valori");
    tendina.disabled = true;

    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById("val" + i);
        if (btn) btn.disabled = true;
    }

    return; // <--- BLOCCO TOTALE
}

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

    tendina.onchange = () => aggiornaColoreValore();

    // ------------------------------------------------------------
    // 1) ELENCO PREDEFINITO
    // ------------------------------------------------------------
    if (param.TIPO_ELENCO === "ELENCO_PREDEFINITO") {

        let nomeJSON = null;
        const fonte = param.JS_FONTE_ELENCO_VALORI?.trim();

        if (fonte === "parametro") nomeJSON = param.PARAMETRO.trim();
        else if (fonte && fonte !== "/") nomeJSON = fonte;
        else nomeJSON = param.PARAMETRO.trim();

        x2_caricaJSON(nomeJSON, function (data) {

            data.valori.forEach(voce => {
                const opt = document.createElement("option");
                opt.value = voce.id;
                opt.textContent = `"${voce.id}" ${voce.text}`;
                tendina.appendChild(opt);
            });

           // const valorePulito = String(param.VALORE ?? "").trim().padStart(2, "0");
            //tendina.value = valorePulito;
let valoreDaMostrare = String(param.VALORE ?? "").trim().padStart(2, "0");

//if (memC) {
//   const indirizzo = parseInt(param.LIBERA1, 16);
   // const byte = memC[indirizzo];
  //  valoreDaMostrare = convertValueFromByte(param, byte);
//}

tendina.value = String(valoreDaMostrare).padStart(2, "0");


            
                aggiornaColoreValore();

        //    x2_aggiornaValoriDaSelezione(param, data, valorePulito);
x2_aggiornaValoriDaSelezione(param, data, valoreDaMostrare);

            const codiceParam = param.PARAMETRO;

            tendina.onchange = function () {
                const nuovoValore = this.value.toString().trim().padStart(2, "0");

                const p = x2_parametri.find(x => x.PARAMETRO === codiceParam);
                if (!p) return;

                if (memC) {
                   // p.VALORE = nuovoValore;
                    modificheInCorso = true;
                    document.getElementById("btn_salva_parametro").disabled = false;
                }

                x2_aggiornaValoriDaSelezione(p, data, nuovoValore);
            };
        });

        return;
    }

    // ------------------------------------------------------------
    // 2) MIN_MAX  (VERSIONE CORRETTA)
    // ------------------------------------------------------------
    if (param.TIPO_ELENCO === "MIN_MAX") {

        tendina.style.display = "none";

        const oldInput2 = document.getElementById("input_minmax");
        if (oldInput2) oldInput2.remove();

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.width = tendina.style.width || "100%";

        const input = document.createElement("input");
        input.type = "text";
        input.id = "input_minmax";
        input.className = "full";

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

        input.value = param.VALORE;

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
        btnUp.style.userSelect = "none";

        const btnDown = document.createElement("div");
        btnDown.textContent = "▼";
        btnDown.style.fontSize = "10px";
        btnDown.style.textAlign = "center";
        btnDown.style.userSelect = "none";

        spinner.appendChild(btnUp);
        spinner.appendChild(btnDown);

        // INPUT
        input.addEventListener("input", function () {
            const min = parseInt(param.MIN);
            if (min < 0) {
                this.value = this.value.replace(/(?!^-)[^0-9]/g, "").replace(/(?!^)-/g, "");
            } else {
                this.value = this.value.replace(/[^0-9]/g, "");
            }
        });

        // BLUR
        input.addEventListener("blur", function () {

            let raw = this.value;

            if (raw === "" || raw === "-") {
                this.value = ultimoParametro.VALORE;
                return;
            }

            let v = parseInt(raw);
            if (isNaN(v)) {
                this.value = ultimoParametro.VALORE;
                return;
            }

            const min = parseInt(param.MIN);
            const max = parseInt(param.MAX);

            if (v < min) v = min;
            if (v > max) v = max;

            if (v < 0) this.value = "-" + Math.abs(v).toString().padStart(2, "0");
            else this.value = v.toString().padStart(2, "0");

            if (memC) {
                ultimoParametro.VALORE = this.value;
                updateMemoriaC(ultimoParametro, this.value);

                modificheInCorso = true;
                document.getElementById("btn_salva_parametro").disabled = false;
            }
        });

        // SPINNER UP
        btnUp.addEventListener("click", function () {
            let v = parseInt(input.value) || 0;
            const max = parseInt(param.MAX);
            if (v < max) v++;

            input.value = (v < 0)
                ? "-" + Math.abs(v).toString().padStart(2, "0")
                : v.toString().padStart(2, "0");

            if (memC) {
                ultimoParametro.VALORE = input.value;
                updateMemoriaC(ultimoParametro, this.value);

                modificheInCorso = true;
                document.getElementById("btn_salva_parametro").disabled = false;
            }
        });

        // SPINNER DOWN
        btnDown.addEventListener("click", function () {
            let v = parseInt(input.value) || 0;
            const min = parseInt(param.MIN);
            if (v > min) v--;

            input.value = (v < 0)
                ? "-" + Math.abs(v).toString().padStart(2, "0")
                : v.toString().padStart(2, "0");

            if (memC) {
                ultimoParametro.VALORE = input.value;
                updateMemoriaC(ultimoParametro, this.value);

                modificheInCorso = true;
                document.getElementById("btn_salva_parametro").disabled = false;
            }
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

        //tendina.value = String(param.VALORE).padStart(2, "0");
        let valoreDaMostrare = String(param.VALORE).padStart(2, "0");

//if (memC) {
 //   const indirizzo = parseInt(param.LIBERA1, 16);
  //  const byte = memC[indirizzo];
  //  valoreDaMostrare = convertValueFromByte(param, byte);
//}

tendina.value = String(valoreDaMostrare).padStart(2, "0");

        return;
    }

    // ------------------------------------------------------------
    // 4) FALLBACK
    // ------------------------------------------------------------
    tendina.innerHTML = "<option>— nessun valore —</option>";
    
}
/* === FINE BLOCCO 4 (CORRETTO) === */


/* === INIZIO BLOCCO 5 (CORRETTO) === */

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

/* === FINE BLOCCO 5 (CORRETTO) === */

/* === INIZIO BLOCCO 6 (CORRETTO) === */

// ======================================================================
// EVENTI PRINCIPALI
// ======================================================================
document.addEventListener("DOMContentLoaded", function () {

    memC = caricaMemoriaC();
    memA = caricaMemoriaA();
    memB = caricaMemoriaB();

    console.log("LUNGHEZZA memC =", memC ? memC.length : "NULL");

    const selMenu      = document.getElementById("menu");
    const selSottomenu = document.getElementById("sottomenu");
    const selParametro = document.getElementById("parametro");
    const selValore    = document.getElementById("tendina_valori");

    document.getElementById("btn_salva_parametro").disabled = true;

    selValore.addEventListener("change", function () {
        if (!soloA && memC) {
            modificheInCorso = true;
            document.getElementById("btn_salva_parametro").disabled = false;
        }
        aggiornaColoreValore(ultimoParametro.INDIRIZZO);
    });

    document.getElementById("btn_salva_parametro").addEventListener("click", function () {
        if (soloA) return;   // BLOCCO TOTALE
        if (!ultimoParametro) return;

        const val = document.getElementById("tendina_valori").value;
        updateMemoriaC(ultimoParametro, val);
        ultimoParametro.VALORE = val;

        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        alert("Valore salvato.");
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
                if (soloA) return;
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
                    x2_popolaValori(ultimoParametro);
                }
                modificheInCorso = false;
                document.getElementById("btn_salva_parametro").disabled = true;
                return;
            }
            if (soloA) return;   // QUESTO MANCA
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
    });

    document.getElementById("crea_hex_btn").onclick = function () {
        window.location.href = "https://balza1979.github.io/progetto_x2/hex/crea_memoria.html";
    };

    window.addEventListener("beforeunload", function (e) {
        if (!modificheInCorso) return;
        e.preventDefault();
        e.returnValue = "";
    });

    // === AVVIO X2 ===
    if (!window.memA) {
        x2_caricaHexDefault().then(() => {
            caricaMemorieGlobali();
            x2_inizializzaUI();
        });
    } else {
        caricaMemorieGlobali();
        x2_inizializzaUI();
    }

});

/* === FINE BLOCCO 6 (CORRETTO) === */
