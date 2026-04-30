// ======================================================================
// FILE: x2_ui.js
// ======================================================================

// ------------------------------------------------------------
// MENU
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
// SOTTOMENU
// ------------------------------------------------------------
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

    // Reset pulsanti
    const pulsantiReset = [val1,val2,val3,val4,val5,val6,val7,val8];
    for (let i = 0; i < 8; i++) {
        pulsantiReset[i].textContent = "-";
        pulsantiReset[i].disabled = true;
        pulsantiReset[i].onclick = null;
    }

    // ------------------------------------------------------------
    // 🔥 LOGICA DECISA STAMATTINA
    // ------------------------------------------------------------
    let nomeJSON;

    if (param.JS_FONTE_ELENCO_VALORI === "parametro") {
        nomeJSON = param.PARAMETRO.trim();
    } else {
        nomeJSON = param.JS_FONTE_ELENCO_VALORI.trim();
    }

    // ------------------------------------------------------------
    // CARICA JSON
    // ------------------------------------------------------------
    x2_caricaJSON(nomeJSON, function(data) {

        // 1) Popola tendina valori
        tendina.innerHTML = "";
        data.valori.forEach(voce => {
            const opt = document.createElement("option");
            opt.value = voce.id;
            opt.textContent = `"${voce.id}" ${voce.text}`;
            tendina.appendChild(opt);
        });

        // 2) Imposta valore attuale
        const valorePulito = param.VALORE.toString().trim().padStart(2, "0");
        tendina.value = valorePulito;

        // 3) Lista immagini
        const lista = data.file_parametro[valorePulito];

        // 4) Pulsanti VAL1–VAL8
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

        // 5) Campi numerici non applicabili
        unita_misura.value = "/";
        val_min.value = "/";
        val_max.value = "/";
    });
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
        }
    });
});
