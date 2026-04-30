// ======================================================================
// FILE: js/x2_ui.js
// DATA: 30/04/2026
// ORA: 18:30
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
        opt.textContent = riga.sottomenu;
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
        <b>Valore grezzo:</b> ${param.VALORE}
    `;

    document.getElementById("codice_parametro").value      = param.PARAMETRO || "";
    document.getElementById("descrizione_parametro").value = param.DESCRIZIONE || "";
}


// ------------------------------------------------------------
// VALORI (val1…val8)
// ------------------------------------------------------------
function x2_popolaValori(param) {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";

    const pulsanti = [val1,val2,val3,val4,val5,val6,val7,val8];
    pulsanti.forEach(btn => {
        btn.textContent = "-";
        btn.disabled = true;
        btn.onclick = null;
    });

    let nomeJSON;
    if (param.JS_FONTE_ELENCO_VALORI === "parametro") {
        nomeJSON = param.PARAMETRO.trim();
    } else if (param.JS_FONTE_ELENCO_VALORI && param.JS_FONTE_ELENCO_VALORI.trim() !== "/") {
        nomeJSON = param.JS_FONTE_ELENCO_VALORI.trim();
    } else {
        nomeJSON = param.PARAMETRO.trim();
    }

    x2_caricaJSON(nomeJSON, function(data) {

        // Costruzione tendina
        data.valori.forEach(voce => {
            const opt = document.createElement("option");
            opt.value = voce.id;
            opt.textContent = `"${voce.id}" ${voce.text}`;
            tendina.appendChild(opt);
        });

        // Valore iniziale
        const valorePulito = param.VALORE.toString().trim().padStart(2, "0");
        tendina.value = valorePulito;

        // Aggiorna val1…val8
        x2_aggiornaValoriDaSelezione(data, valorePulito);
    });
}


// ------------------------------------------------------------
// AGGIORNA SOLO val1…val8
// ------------------------------------------------------------
function x2_aggiornaValoriDaSelezione(data, valore) {

    const lista =
        data.file_parametro[valore] ||
        data.file_parametro[valore.padStart(2, "0")] ||
        data.file_parametro[String(parseInt(valore))];

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
}


// ------------------------------------------------------------
// PULSANTI FILE1…FILE8 (btn_param1…8)
// ------------------------------------------------------------
function x2_aggiornaParamButtons(codiceParametro) {

    const record = x2_parametri.find(p => p.PARAMETRO === codiceParametro.trim());
    const pulsanti = [];

    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("btn_param" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "FILE" + (i + 1);
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
// EVENTI
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {

    const selMenu       = document.getElementById("menu");
    const selSottomenu  = document.getElementById("sottomenu");
    const selParametro  = document.getElementById("parametro");
    const selValore     = document.getElementById("tendina_valori");

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
        const codice = this.value.replace(/"/g, "").trim();
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);
            x2_aggiornaParamButtons(param.PARAMETRO);
        }
    });

    selValore.addEventListener("change", function () {
        const codice = parametro.value.replace(/"/g, "").trim();
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (!param) return;

        let nomeJSON;
        if (param.JS_FONTE_ELENCO_VALORI === "parametro") {
            nomeJSON = param.PARAMETRO.trim();
        } else if (param.JS_FONTE_ELENCO_VALORI && param.JS_FONTE_ELENCO_VALORI.trim() !== "/") {
            nomeJSON = param.JS_FONTE_ELENCO_VALORI.trim();
        } else {
            nomeJSON = param.PARAMETRO.trim();
        }

        const valoreScelto = this.value.toString().trim().padStart(2, "0");

        x2_caricaJSON(nomeJSON, function(data) {
            x2_aggiornaValoriDaSelezione(data, valoreScelto);
        });
    });
});
