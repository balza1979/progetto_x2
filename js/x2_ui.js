// ======================================================================
// X2 UI — VERSIONE COMPLETA (SALVA SOLO CON BOTTONE)
// Riscritta da zero — 09/06/2026
// Compatibile con: x2_menu_struttura_data, x2_parametri, x2_caricaJSON
// ======================================================================

// ------------------------------------------------------------
// VARIABILI GLOBALI
// ------------------------------------------------------------
let memC = null;
let ultimoParametro = null;
let modificheInCorso = false;

// ------------------------------------------------------------
// MEMORIA C — CARICA / SALVA
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
}

// ------------------------------------------------------------
// CONVERSIONE VALORI ↔ BYTE
// ------------------------------------------------------------
function convertValueToByte(param, valore) {
    if (param.TIPO_ELENCO === "DECIMALE") {
        return Math.round(parseFloat(valore) * 10);
    }
    return parseInt(valore);
}

function convertValueFromByte(param, byte) {
    if (param.TIPO_ELENCO === "DECIMALE") {
        return (byte / 10).toFixed(param.DECIMALI);
    }
    return byte.toString().padStart(2, "0");
}

// ------------------------------------------------------------
// SALVA PARAMETRO IN MEMORIA C (SOLO CON BOTTONE)
// ------------------------------------------------------------
function salvaParametroInMemoria(param, valore) {
    if (!memC) return;
    const addr = parseInt(param.LIBERA1);
    if (isNaN(addr)) return;

    memC[addr] = convertValueToByte(param, valore);
    salvaMemoriaC();
}

// ------------------------------------------------------------
// MOSTRA INFO PARAMETRO
// ------------------------------------------------------------
function x2_mostraInfoParametro(param) {

    if (memC) {
        const addr = parseInt(param.LIBERA1);
        param.VALORE = convertValueFromByte(param, memC[addr]);
    }

    ultimoParametro = param;

    document.getElementById("info_parametro").innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore:</b> ${param.VALORE}<br>
        <b>Indirizzo:</b> ${param.LIBERA1}
    `;
}

// ------------------------------------------------------------
// POPOLA VALORI (TENDINA / MINMAX / DECIMALI)
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
// LEGGE VALORE CORRENTE (TENDINA O MINMAX)
// ------------------------------------------------------------
function x2_leggiValoreCorrente() {
    const input = document.getElementById("input_minmax");
    if (input) return input.value;
    return document.getElementById("tendina_valori").value;
}

// ------------------------------------------------------------
// POPOLA MENU PRINCIPALE
// ------------------------------------------------------------
function x2_popolaMenu() {
    const sel = document.getElementById("menu");
    sel.innerHTML = "";

    x2_menu_struttura_data.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.ID;
        opt.textContent = m.NOME;
        sel.appendChild(opt);
    });
}

// ------------------------------------------------------------
// POPOLA SOTTOMENU
// ------------------------------------------------------------
function x2_popolaSottomenu(idMenu) {
    const sel = document.getElementById("sottomenu");
    sel.innerHTML = "";

    const menu = x2_menu_struttura_data.find(m => m.ID === idMenu);
    if (!menu) return;

    menu.SOTTOMENU.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.ID;
        opt.textContent = s.NOME;
        sel.appendChild(opt);
    });
}

// ------------------------------------------------------------
// POPOLA PARAMETRI
// ------------------------------------------------------------
function x2_popolaParametri(idSottomenu) {
    const sel = document.getElementById("parametro");
    sel.innerHTML = "";

    const lista = x2_parametri.filter(p => p.SOTTOMENU === idSottomenu);

    lista.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.ID;
        opt.textContent = `${p.ID} — ${p.DESCRIZIONE}`;
        sel.appendChild(opt);
    });
}

// ------------------------------------------------------------
// AGGIORNA PULSANTI MENU
// ------------------------------------------------------------
function x2_aggiornaMenuButtons(idMenu) {
    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById("menu" + i);
        if (!btn) continue;

        const menu = x2_menu_struttura_data[i - 1];
        if (!menu) {
            btn.textContent = "-";
            btn.disabled = true;
            continue;
        }

        btn.textContent = menu.NOME;
        btn.disabled = false;
        btn.onclick = () => {
            document.getElementById("menu").value = menu.ID;
            document.getElementById("menu").dispatchEvent(new Event("change"));
        };
    }
}

// ------------------------------------------------------------
// AGGIORNA PULSANTI SOTTOMENU
// ------------------------------------------------------------
function x2_aggiornaSottomenuButtons(idMenu, idSottomenu) {

    const menu = x2_menu_struttura_data.find(m => m.ID === idMenu);
    if (!menu) return;

    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById("sottomenu" + i);
        if (!btn) continue;

        const sm = menu.SOTTOMENU[i - 1];
        if (!sm) {
            btn.textContent = "-";
            btn.disabled = true;
            continue;
        }

        btn.textContent = sm.NOME;
        btn.disabled = false;
        btn.onclick = () => {
            document.getElementById("sottomenu").value = sm.ID;
            document.getElementById("sottomenu").dispatchEvent(new Event("change"));
        };
    }
}

// ------------------------------------------------------------
// AGGIORNA PULSANTI FILE PARAMETRO
// ------------------------------------------------------------
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
        x2_aggiornaParamButtons(ultimoParametro.PARAMETRO);
    });

    document.getElementById("parametro_up").onclick = () => x2_cambiaParametro(-1);
    document.getElementById("parametro_down").onclick = () => x2_cambiaParametro(+1);

    // MENU
    selMenu.onchange = () => {
        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        x2_popolaSottomenu(selMenu.value);
        selSottomenu.dispatchEvent(new Event("change"));
        x2_aggiornaMenuButtons(selMenu.value);
    };

    // SOTTOMENU
    selSottomenu.onchange = () => {
        modificheInCorso = false;
        document.getElementById("btn_salva_parametro").disabled = true;

        x2_popolaParametri(selSottomenu.value);
        selParametro.dispatchEvent(new Event("change"));
        x2_aggiornaSottomenuButtons(selMenu.value, selSottomenu.value);
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
