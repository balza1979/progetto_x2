// ======================================================================
// FILE: js/x2_ui.js
// DATA: 30/04/2026
// ORA: 18:40
// DESCRIZIONE:
// Gestione UI Programmatore X2
// ======================================================================


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

    const lista = x2_menu_struttura_data.filter(riga =>
        String(riga.cod__menu).startsWith(codMenu + ".")
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


// ------------------------------------------------------------
// PULSANTI MENU
// ------------------------------------------------------------
function x2_aggiornaMenuButtons(codMenu) {
    const record = x2_menu_struttura_data.find(r => r.cod__menu.startsWith(codMenu + "."));
    const pulsanti = [];
    for (let i = 1; i <= 8; i++) pulsanti.push(document.getElementById("menu_btn" + i));

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


// ------------------------------------------------------------
// PULSANTI SOTTOMENU
// ------------------------------------------------------------
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


// ------------------------------------------------------------
// PARAMETRI
// ------------------------------------------------------------
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


// ------------------------------------------------------------
// INFO PARAMETRO
// ------------------------------------------------------------
function x2_mostraInfoParametro(param) {
    const box = document.getElementById("info_parametro");

    box.innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore grezzo:</b> ${param.VALORE}<br><br>

        <b>Indirizzo HC64:</b> ${param.LIBERA1 || "LIBERA1 (vuoto)"}<br>
        <b>Numero byte:</b> ${param.LIBERA2 || "LIBERA2 (vuoto)"}<br>
        <b>Tipo valore:</b> ${param.LIBERA3 || "LIBERA3 (vuoto)"}<br>
        <b>Scala:</b> ${param.LIBERA4 || "LIBERA4 (vuoto)"}<br>
        <b>Valore in HEX:</b> ${x2_calcolaHex(param)}<br>
    `;

    document.getElementById("codice_parametro").value      = param.PARAMETRO || "";
    document.getElementById("descrizione_parametro").value = param.DESCRIZIONE || "";

    // --- VISUALIZZAZIONE MIN / MAX / UNITA ---
    document.getElementById("val_min").value      = param.MIN   || "";
    document.getElementById("val_max").value      = param.MAX   || "";
    document.getElementById("unita_misura").value = param.UNITA || "";
}


// ------------------------------------------------------------
// CALCOLO HEX
// ------------------------------------------------------------
function x2_calcolaHex(param) {
    if (!param.VALORE) return "—";
    let hex = parseInt(param.VALORE).toString(16).toUpperCase().padStart(2, "0");
    return hex + "  (elaborazione HTML)";
}


// ------------------------------------------------------------
// VALORI (val1…val8) — VERSIONE CORRETTA
// ------------------------------------------------------------
function x2_popolaValori(param) {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";

    // RESET PULSANTI
    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById("val" + i);
        if (!btn) continue;
        btn.textContent = "-";
        btn.disabled = true;
        btn.onclick = null;
    }

    // 1) JSON
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

        x2_caricaJSON(nomeJSON, function(data) {

            data.valori.forEach(voce => {
                const opt = document.createElement("option");
                opt.value = voce.id;
                opt.textContent = `"${voce.id}" ${voce.text}`;
                tendina.appendChild(opt);
            });

            const valorePulito = param.VALORE.toString().trim().padStart(2, "0");
            tendina.value = valorePulito;

            x2_aggiornaValoriDaSelezione(data, valorePulito);
        });

        return;
    }

    // 2) MIN/MAX
    if (param.TIPO_ELENCO === "MIN_MAX") {

        const min = parseInt(param.MIN);
        const max = parseInt(param.MAX);

        for (let i = min; i <= max; i++) {
            const opt = document.createElement("option");
            opt.value = String(i).padStart(2,"0");
            opt.textContent = String(i).padStart(2,"0");
            tendina.appendChild(opt);
        }

        tendina.value = param.VALORE;
        return;
    }

    // 3) DECIMALI
    if (param.TIPO_ELENCO === "DECIMALE") {

        const min = parseFloat(param.MIN);
        const max = parseFloat(param.MAX);
        const dec = parseInt(param.DECIMALI);
        const step = 1 / Math.pow(10, dec);

        for (let v = min; v <= max + 0.0000001; v += step) {
            const opt = document.createElement("option");
            const val = v.toFixed(dec);
            opt.value = val.padStart(2,"0");
            opt.textContent = val.padStart(2,"0");
            tendina.appendChild(opt);
        }

        tendina.value = String(param.VALORE).padStart(2,"0");
        return;
    }

    // 4) FALLBACK
    tendina.innerHTML = "<option>— nessun valore —</option>";
}


// ------------------------------------------------------------
// AGGIORNA val1…val8 — VERSIONE CORRETTA
// ------------------------------------------------------------
function x2_aggiornaValoriDaSelezione(data, valore) {

    const lista =
        data.file_parametro[valore] ||
        data.file_parametro[valore.padStart(2, "0")] ||
        data.file_parametro[String(parseInt(valore))];

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


// ------------------------------------------------------------
// PULSANTI FILE1…FILE8
// ------------------------------------------------------------
function x2_aggiornaParamButtons(codiceParametro) {

    const record = x2_parametri.find(p => p.PARAMETRO === codiceParametro.trim());
    const pulsanti = [];

    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("btn_param" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "FILE" + (i + 1);
        const file = record ? record[nomeCampo] : "NO_RECORD";
        pulsanti[i].textContent = "VALORE=" + file;

        if (file && file !== "/" && file.trim() !== "") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}


// ------------------------------------------------------------
// EVENTI
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {

    const selMenu       = document.getElementById("menu");
    const selSottomenu  = document.getElementById("sottomenu");
    const selParametro  = document.getElementById("parametro");
    const selValore     = document.getElementById("tendina_valori");
    document.getElementById("tendina_valori").classList.add("tendina_verde");

    x2_popolaMenu();

    function x2_cambiaParametro(delta) {
        const sel = document.getElementById("parametro");

        let nuovo = sel.selectedIndex + delta;

        if (nuovo < 0) nuovo = 0;
        if (nuovo >= sel.options.length) nuovo = sel.options.length - 1;

        sel.selectedIndex = nuovo;
        sel.dispatchEvent(new Event("change"));
    }

    document.getElementById("parametro_up").onclick   = () => x2_cambiaParametro(-1);
    document.getElementById("parametro_down").onclick = () => x2_cambiaParametro(+1);

    selMenu.addEventListener("change", function () {
        x2_popolaSottomenu(this.value);
        selSottomenu.dispatchEvent(new Event("change"));
        x2_aggiornaMenuButtons(this.value);
    });

    selSottomenu.addEventListener("change", function () {
        x2_popolaParametri(this.value);
        selParametro.dispatchEvent(new Event("change"));
        x2_aggiornaSottomenuButtons(selMenu.value, this.value);
    });

    selParametro.addEventListener("change", function () {
        const codice = this.value.replace(/"/g, "").trim();
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);
            x2_aggiornaParamButtons(param.PARAMETRO);
        }
    });

    // PATCH EVENTO selValore.change
    selValore.addEventListener("change", function () {

        const codice = selParametro.value.replace(/"/g, "").trim();
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (!param) return;

        if (param.TIPO_ELENCO !== "ELENCO_PREDEFINITO") return;

        let nomeJSON = null;
        const fonte = param.JS_FONTE_ELENCO_VALORI?.trim();

        if (fonte === "parametro") {
            nomeJSON = param.PARAMETRO.trim();
        } else if (fonte && fonte !== "/") {
            nomeJSON = fonte;
        } else {
            nomeJSON = param.PARAMETRO.trim();
        }

        const valoreScelto = this.value.toString().trim().padStart(2, "0");

        x2_caricaJSON(nomeJSON, function(data) {
            x2_aggiornaValoriDaSelezione(data, valoreScelto);
        });
    });

    document.getElementById("crea_hex_btn").onclick = function () {
        window.open("hex/hex_generator.html", "_blank");
    };

});
