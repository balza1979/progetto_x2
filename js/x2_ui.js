// ======================================================================
// FILE: js/x2_ui.js
// PERCORSO: progetto_x2/js/x2_ui.js
// DATA: 30/04/2026
// ORA: 11:45
// DESCRIZIONE:
// - Reinserita funzione x2_popolaMenu() mancante
// - Reinserita funzione x2_popolaSottomenu() mancante
// - Ripristinata logica completa caricamento parametri
// - Aggiunta gestione JS_FONTE_ELENCO_VALORI ("parametro" → PARAMETRO.json)
// - Aggiunto fallback automatico se JS_FONTE_ELENCO_VALORI è vuoto o "/"
// - Aggiunta funzione x2_aggiornaParamButtons() per pulsanti PARAM1–PARAM8
// - Aggiunta chiamata x2_aggiornaParamButtons() nell’evento parametro.change
// - Sistemato ordine esecuzione eventi DOM
// ======================================================================


// ------------------------------------------------------------
// MENU
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
        opt.textContent = riga.sottomenu;
        selSottomenu.appendChild(opt);
    });

    if (selSottomenu.options.length > 0) {
        selSottomenu.selectedIndex = 0;
    }
}

function x2_aggiornaSottomenuButtons(codMenu, codSottomenu) {
    const record = x2_menu_struttura_data.find(r => r.cod__menu === codSottomenu);
    const pulsanti = [];
    for (let i = 1; i <= 8; i++) pulsanti.push(document.getElementById("sottomenu_btn" + i));

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "file" + (i + 1) + "_sottomenu";
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
// PARAMETRI
// ------------------------------------------------------------
function x2_popolaParametri(codMenuCompleto) {
    const selParametro = document.getElementById("parametro");
    const selValore    = document.getElementById("tendina_valori");
    const boxInfo      = document.getElementById("info_parametro");

    selParametro.innerHTML = "";
    selValore.innerHTML    = "";
    boxInfo.innerHTML      = "";

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
        <b>Valore grezzo:</b> ${x2_pulisciValore(param.VALORE)}
    `;

    document.getElementById("codice_parametro").value      = param.PARAMETRO || "";
    document.getElementById("descrizione_parametro").value = param.DESCRIZIONE || "";
}


// ------------------------------------------------------------
// VALORI (CON LOGICA "JS_FONTE_ELENCO_VALORI")
// ------------------------------------------------------------
function x2_popolaValori(param) {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";

    const pulsantiReset = [val1,val2,val3,val4,val5,val6,val7,val8];
    for (let i = 0; i < 8; i++) {
        pulsantiReset[i].textContent = "-";
        pulsantiReset[i].disabled = true;
        pulsantiReset[i].onclick = null;
    }

    let nomeJSON;

    if (param.JS_FONTE_ELENCO_VALORI === "parametro") {
        nomeJSON = param.PARAMETRO.trim();
    } else if (param.JS_FONTE_ELENCO_VALORI && param.JS_FONTE_ELENCO_VALORI.trim() !== "/") {
        nomeJSON = param.JS_FONTE_ELENCO_VALORI.trim();
    } else {
        nomeJSON = param.PARAMETRO.trim();
    }

    x2_caricaJSON(nomeJSON, function(data) {

        tendina.innerHTML = "";
        data.valori.forEach(voce => {
            const opt = document.createElement("option");
            opt.value = voce.id;
            opt.textContent = `"${voce.id}" ${voce.text}`;
            tendina.appendChild(opt);
        });

        const valorePulito = param.VALORE.toString().trim().padStart(2, "0");
        tendina.value = valorePulito;

        // PATCH DEFINITIVA 00/0
        const lista =
            data.file_parametro[valorePulito] ||
            data.file_parametro[valorePulito.padStart(2, "0")] ||
            data.file_parametro[String(parseInt(valorePulito))];

        const pulsanti = [val1,val2,val3,val4,val5,val6,val7,val8];

        for (let i = 0; i < 8; i++) {
            if (lista && lista[i]) {
                pulsanti[i].textContent = lista[i];
                pulsanti[i].disabled = false;
                pulsanti[i].onclick = () => window.open("img/" + lista[i], "_blank");
            } else {
                pulsanti[i].textContent = "-";
                pulsanti[i].disabled = true;
                pulsanti[i].onclick = null;
            }
        }

        unita_misura.value = "/";
        val_min.value = "/";
        val_max.value = "/";
    });
}


// ------------------------------------------------------------
// PULSANTI PARAM1–PARAM8
// ------------------------------------------------------------
function x2_aggiornaParamButtons(codiceParametro) {

    const record = x2_parametri.find(p => p.PARAMETRO === codiceParametro);
    const pulsanti = [];

    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("btn_param" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "FILE" + (i + 1);
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
// NAVIGAZIONE PARAMETRI
// ------------------------------------------------------------
parametro_up.addEventListener("click", () => {
    const sel = parametro;
    if (sel.selectedIndex > 0) {
        sel.selectedIndex--;
        sel.dispatchEvent(new Event("change"));
    }
});

parametro_down.addEventListener("click", () => {
    const sel = parametro;
    if (sel.selectedIndex < sel.options.length - 1) {
        sel.selectedIndex++;
        sel.dispatchEvent(new Event("change"));
    }
});


// ------------------------------------------------------------
// EVENTI PRINCIPALI
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {

    const selMenu       = document.getElementById("menu");
    const selSottomenu  = document.getElementById("sottomenu");
    const selParametro  = document.getElementById("parametro");

    x2_popolaMenu();

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
        const codice = this.value;
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);
            x2_aggiornaParamButtons(param.PARAMETRO);
        }
    });
});
