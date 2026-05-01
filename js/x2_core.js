// ======================================================================
// FILE: js/x2_core.js
// PERCORSO: progetto_x2/js/x2_core.js
// DATA: 30/04/2026
// ORA: 11:35
// DESCRIZIONE:
// - Gestione parametri X2
// - Gestione speciale parametro 1.0.00
// - Aggiornamento val1–val8
// - Aggiornamento pulsanti FILE1–FILE8
// ======================================================================

// ------------------------------------------------------------
// UTILITY
// ------------------------------------------------------------
function x2_pulisciValore(v) {
    if (!v) return "";
    return String(v).trim();
}

// ------------------------------------------------------------
// AGGIORNA PULSANTI PARAMETRI 1–8 (FILE1–FILE8)
// ------------------------------------------------------------
function x2_aggiornaParamButtons(parametroCodice) {
    const record = x2_parametri.find(p => p.PARAMETRO === parametroCodice);
    const pulsanti = [];
    for (let i = 1; i <= 8; i++) pulsanti.push(document.getElementById("btn_param" + i));

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "FILE" + (i + 1);
        const file = record ? record[nomeCampo] : "/";
        if (file && file !== "/") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = "ciao";
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}

// ------------------------------------------------------------
// GESTIONE SPECIALE PARAMETRO 1.0.00
// ------------------------------------------------------------
function x2_gestisciParametroSpeciale(param, id) {

    if (param.PARAMETRO.trim() !== "1.0.00") return false;

    x2_caricaJSON("1.0.00", function(data) {

        const lista =
            data.file_parametro[id] ||
            data.file_parametro[id.padStart(2, "0")] ||
            data.file_parametro[String(parseInt(id))];

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
    });

    return true;
}

// ------------------------------------------------------------
// AGGIORNA VALORI PARAMETRO (val1–val8) PER PARAMETRI NORMALI
// ------------------------------------------------------------
function x2_aggiornaValoriParametro(param, id) {

    const nomeFile = param.JS_FONTE_ELENCO_VALORI;

    x2_caricaJSON(nomeFile, function(data) {

        const lista =
            data.file_parametro[id] ||
            data.file_parametro[id.padStart(2, "0")] ||
            data.file_parametro[String(parseInt(id))];

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
    });
}

// ------------------------------------------------------------
// MOSTRA PARAMETRO (normale o speciale)
// ------------------------------------------------------------
function x2_mostraParametro(parametroCodice, id) {

    const param = x2_parametri.find(p => p.PARAMETRO === parametroCodice);

    if (!param) return;

    // Caso speciale 1.0.00
    if (x2_gestisciParametroSpeciale(param, id)) return;

    // Aggiorna pulsanti FILE1–FILE8
    x2_aggiornaParamButtons(parametroCodice);

    // Aggiorna val1–val8
    x2_aggiornaValoriParametro(param, id);
}
