// ======================================================================
// UI X2 PRO — VERSIONE 1 (SALVA SOLO CON IL BOTTONE)
// Riscritta da zero — 09/06/2026
// ======================================================================

// ------------------------------------------------------------
// VARIABILI GLOBALI
// ------------------------------------------------------------
let memC = null;                 // array di byte (8192)
let memC_modificata = false;
let ultimoParametro = null;
let modificheInCorso = false;

// ------------------------------------------------------------
// CARICAMENTO / SALVATAGGIO MEMORIA C (HEX INTEL)
// ------------------------------------------------------------
function caricaMemoriaC() {
    const raw = localStorage.getItem("memC_hex");
    if (!raw) return null;

    try {
        return parseIntelHexToBytes(raw);
    } catch {
        return null;
    }
}

function salvaMemoriaC() {
    if (!memC) return;
    const hex = bytesToIntelHex(memC);
    localStorage.setItem("memC_hex", hex);
    memC_modificata = false;
}

// ------------------------------------------------------------
// AGGIORNA UN PARAMETRO IN MEMORIA C (SOLO QUANDO PREMI SALVA)
// ------------------------------------------------------------
function salvaParametroInMemoria(param, valore) {
    if (!memC) return;
    if (!param || !param.LIBERA1) return;

    const addr = parseInt(param.LIBERA1);
    if (isNaN(addr) || addr < 0 || addr >= memC.length) return;

    const byte = convertValueToByte(param, valore);
    memC[addr] = byte;
    memC_modificata = true;
    salvaMemoriaC();
}

// ------------------------------------------------------------
// MOSTRA INFO PARAMETRO
// ------------------------------------------------------------
function x2_mostraInfoParametro(param) {

    // Se Memoria C esiste → leggo il valore reale
    if (memC) {
        const addr = parseInt(param.LIBERA1);
        const byte = memC[addr];
        param.VALORE = convertValueFromByte(param, byte);
    }

    ultimoParametro = param;

    document.getElementById("info_parametro").innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore:</b> ${param.VALORE}<br>
        <b>Indirizzo:</b> ${param.LIBERA1}<br>
        <b>HEX:</b> ${x2_calcolaHex(param)}
    `;
}

// ------------------------------------------------------------
// POPOLA VALORI (TENDINA O MIN/MAX)
// ------------------------------------------------------------
function x2_popolaValori(param) {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";
    tendina.style.display = "block";

    const old = document.getElementById("input_minmax");
    if (old) old.remove();

    // -------------------------------
    // ELENCO PREDEFINITO
    // -------------------------------
    if (param.TIPO_ELENCO === "ELENCO_PREDEFINITO") {

        x2_caricaJSON(param.PARAMETRO, data => {

            data.valori.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v.id;
                opt.textContent = `"${v.id}" ${v.text}`;
                tendina.appendChild(opt);
            });

            tendina.value = param.VALORE;

            tendina.onchange = () => {
                modificheInCorso = true;
                document.getElementById("btn_salva_parametro").disabled = false;
                param.VALORE = tendina.value;
            };
        });

        return;
    }

    // -------------------------------
    // MIN / MAX
    // -------------------------------
    if (param.TIPO_ELENCO === "MIN_MAX") {

        tendina.style.display = "none";

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";

        const input = document.createElement("input");
        input.id = "input_minmax";
        input.type = "text";
        input.value = param.VALORE;
        input.className = "full";

        input.oninput = () => {
            input.value = input.value.replace(/[^0-9-]/g, "");
            modificheInCorso = true;
            document.getElementById("btn_salva_parametro").disabled = false;
        };

        input.onblur = () => {
            let v = parseInt(input.value);
            if (isNaN(v)) v = parseInt(param.VALORE);

            const min = parseInt(param.MIN);
            const max = parseInt(param.MAX);

            if (v < min) v = min;
            if (v > max) v = max;

            input.value = v.toString().padStart(2, "0");
            param.VALORE = input.value;
        };

        wrapper.appendChild(input);
        tendina.parentNode.insertBefore(wrapper, tendina);

        return;
    }

    // -------------------------------
    // DECIMALI
    // -------------------------------
    if (param.TIPO_ELENCO === "DECIMALE") {

        const min = parseFloat(param.MIN);
        const max = parseFloat(param.MAX);
        const dec = parseInt(param.DECIMALI);
        const step = 1 / Math.pow(10, dec);

        for (let v = min; v <= max + 0.000001; v += step) {
            const opt = document.createElement("option");
            const val = v.toFixed(dec);
            opt.value = val;
            opt.textContent = val;
            tendina.appendChild(opt);
        }

        tendina.value = param.VALORE;

        tendina.onchange = () => {
            modificheInCorso = true;
            document.getElementById("btn_salva_parametro").disabled = false;
            param.VALORE = tendina.value;
        };

        return;
    }

    tendina.innerHTML = "<option>—</option>";
}

// ------------------------------------------------------------
// CAMBIO PARAMETRO (FRECCE)
// ------------------------------------------------------------
function x2_cambiaParametro(delta) {

    if (modificheInCorso) {
        const ok = confirm("Hai modifiche non salvate. Vuoi salvare?");
        if (!ok) {
            modificheInCorso = false;
            return;
        }

        const val = x2_leggiValoreCorrente();
        salvaParametroInMemoria(ultimoParametro, val);
        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;
    }

    const sel = document.getElementById("parametro");
    let nuovo = sel.selectedIndex + delta;

    if (nuovo < 0) nuovo = 0;
    if (nuovo >= sel.options.length) nuovo = sel.options.length - 1;

    sel.selectedIndex = nuovo;
    sel.dispatchEvent(new Event("change"));
}

// ------------------------------------------------------------
// LEGGE IL VALORE CORRENTE (TENDINA O MINMAX)
// ------------------------------------------------------------
function x2_leggiValoreCorrente() {
    const input = document.getElementById("input_minmax");
    if (input) return input.value;
    return document.getElementById("tendina_valori").value;
}

// ------------------------------------------------------------
// EVENTI PRINCIPALI
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    memC = caricaMemoriaC();

    const selMenu = document.getElementById("menu");
    const selSottomenu = document.getElementById("sottomenu");
    const selParametro = document.getElementById("parametro");

    document.getElementById("btn_salva_parametro").disabled = true;

    // SALVA
    document.getElementById("btn_salva_parametro").onclick = () => {
        if (!ultimoParametro) return;

        const val = x2_leggiValoreCorrente();
        salvaParametroInMemoria(ultimoParametro, val);

        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        alert("Valore salvato.");
    };

    // CAMBIO PARAMETRO
    selParametro.addEventListener("change", () => {
        ultimoParametro = x2_parametri[selParametro.selectedIndex];
        x2_mostraInfoParametro(ultimoParametro);
        x2_popolaValori(ultimoParametro);
    });

    document.getElementById("parametro_up").onclick = () => x2_cambiaParametro(-1);
    document.getElementById("parametro_down").onclick = () => x2_cambiaParametro(+1);

    // MENU
    selMenu.onchange = () => {
        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        x2_popolaSottomenu(selMenu.value);
        selSottomenu.dispatchEvent(new Event("change"));
    };

    // SOTTOMENU
    selSottomenu.onchange = () => {
        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        x2_popolaParametri(selSottomenu.value);
        selParametro.dispatchEvent(new Event("change"));
    };

    x2_popolaMenu();
});

// ------------------------------------------------------------
// WARNING USCITA PAGINA
// ------------------------------------------------------------
window.addEventListener("beforeunload", e => {
    if (!modificheInCorso) return;
    e.preventDefault();
    e.returnValue = "";
});
