// ======================================================================
// FILE: js/x2_ui.js
// DATA: 28/05/2026
// ORA: 16:16
// DESCRIZIONE:V1.4
// Gestione UI Programmatore X2
// ======================================================================

let ultimoParametro = null;

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

    // 🔥 STEP 1 — Sincronizza con Memoria C modificata
    if (memC_modificata) {
        const indirizzo = parseInt(param.LIBERA1);
        const byte      = getByteFromC(indirizzo);
        const valoreC   = convertValueFromByte(param, byte);
        param.VALORE    = valoreC;
    }

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

    // 🔥 STEP 2 — Ricorda qual è il parametro attivo
    ultimoParametro = param;
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
 // Ripristina sempre la tendina come visibile
        tendina.style.display = "block";
    

// Rimuove eventuale input numerico precedente
        const oldInput = document.getElementById("input_minmax");
        if (oldInput) oldInput.remove();
    

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

        const valorePulito = String(param.VALORE ?? "").trim().padStart(2, "0");
        tendina.value = valorePulito;

        //x2_aggiornaValoriDaSelezione(data, valorePulito);
x2_aggiornaValoriDaSelezione(param, data, valorePulito);

      tendina.onchange = function () {
    param.VALORE = this.value;
    updateMemoriaC(param, param.VALORE);
};

    });

    return;
}


    // 2) MIN/MAX
// =========================================================
// INIZIO MODIFICA MIN_MAX — 28/05/2026 ore 16:43
// Input TEXT + Spinner integrato stile nativo
// =========================================================
if (param.TIPO_ELENCO === "MIN_MAX") {

    // 1) Nascondiamo la tendina
    tendina.style.display = "none";

    // 2) Rimuoviamo eventuale input precedente
    const oldInput = document.getElementById("input_minmax");
    if (oldInput) oldInput.remove();

    // 3) Creiamo il contenitore (input + spinner)
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = tendina.style.width || "100%";

    // 4) Creiamo l'input TEXT
    const input = document.createElement("input");
    input.type = "text";
    input.id = "input_minmax";
    input.className = "full";

    // Copia stile tendina
    const cs = getComputedStyle(tendina);
    input.style.backgroundColor = cs.backgroundColor;
    input.style.color = cs.color;
    input.style.border = cs.border;
    input.style.borderRadius = cs.borderRadius;
    input.style.paddingRight = "28px"; // spazio per spinner
    input.style.height = cs.height;
    input.style.fontSize = cs.fontSize;
    input.style.fontFamily = cs.fontFamily;
    input.style.boxSizing = "border-box";
    input.style.width = "100%";

    input.value = param.VALORE;

    // 5) Creiamo lo spinner (▲ ▼)
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

 // 6) Validazione digitazione (numeri + "-" solo se MIN è negativo)
input.addEventListener("input", function () {

    const min = parseInt(param.MIN);

    if (min < 0) {
        // Permettiamo "-" solo come primo carattere
        this.value = this.value
            .replace(/(?!^-)[^0-9]/g, "")   // rimuove tutto tranne cifre, ma lascia "-" solo se è il primo carattere
            .replace(/(?!^)-/g, "");        // rimuove eventuali "-" non in prima posizione
    } else {
        // Solo numeri, nessun "-"
        this.value = this.value.replace(/[^0-9]/g, "");
    }
});

// 7) Validazione completa su uscita dal campo
input.addEventListener("blur", function () {

    let raw = this.value;

    // Se vuoto o solo "-" → ripristina valore precedente
    if (raw === "" || raw === "-") {
        this.value = param.VALORE;
        return;
    }

    let v = parseInt(raw);

    if (isNaN(v)) {
        this.value = param.VALORE;
        return;
    }

    const min = parseInt(param.MIN);
    const max = parseInt(param.MAX);

    if (v < min) v = min;
    if (v > max) v = max;

    // Padding a 2 cifre, anche per negativi
    if (v < 0) {
        this.value = "-" + Math.abs(v).toString().padStart(2, "0");
    } else {
        this.value = v.toString().padStart(2, "0");
    }

    param.VALORE = this.value;
});

// 8) Spinner UP
btnUp.addEventListener("click", function () {
    let v = parseInt(input.value) || 0;
    const max = parseInt(param.MAX);
    if (v < max) v++;

    input.value = (v < 0)
        ? "-" + Math.abs(v).toString().padStart(2, "0")
        : v.toString().padStart(2, "0");

    param.VALORE = input.value;
});

// 9) Spinner DOWN
btnDown.addEventListener("click", function () {
    let v = parseInt(input.value) || 0;
    const min = parseInt(param.MIN);
    if (v > min) v--;

    input.value = (v < 0)
        ? "-" + Math.abs(v).toString().padStart(2, "0")
        : v.toString().padStart(2, "0");

    param.VALORE = input.value;
});


    // 10) Montiamo tutto
    wrapper.appendChild(input);
    wrapper.appendChild(spinner);

    tendina.parentNode.insertBefore(wrapper, tendina);

    return;
}
// =========================================================
// FINE MODIFICA MIN_MAX — 28/05/2026 ore 16:43
// =========================================================


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


function x2_aggiornaValoriDaSelezione(param, data, valore) {

    // 🔥 Normalizza la chiave ("04" → "4")
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

    // 🔥 PASSO 3 — Salva il parametro precedente
    if (ultimoParametro) {
        updateMemoriaC(ultimoParametro, ultimoParametro.VALORE);
    }

    const codice = this.value.replace(/"/g, "").trim();
    const param = x2_parametri.find(p => p.PARAMETRO === codice);
    if (!param) return;

    // 🔥 STEP 1 — Sincronizza il parametro con Memoria C modificata
    if (memC_modificata) {
        const indirizzo = parseInt(param.LIBERA1);
        const byte      = getByteFromC(indirizzo);
        const valoreC   = convertValueFromByte(param, byte);
        param.VALORE    = valoreC;
    }

    // 🔥 Ora la UI usa il valore aggiornato
    x2_mostraInfoParametro(param);
    x2_popolaValori(param);
    x2_aggiornaParamButtons(param.PARAMETRO);
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
          //  x2_aggiornaValoriDaSelezione(data, valoreScelto);
          //  x2_aggiornaValoriDaSelezione(param, data, valorePulito);
                            x2_aggiornaValoriDaSelezione(param, data, param.VALORE);

        });
    });

 document.getElementById("crea_hex_btn").onclick = function () {
    window.open("https://balza1979.github.io/progetto_x2/hex/crea_memoria.html", "_blank");
};
//}; 
});
