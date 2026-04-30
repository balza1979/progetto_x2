// ======================================================================
// FILE: js/x2_core.js
// PERCORSO: progetto_x2/js/x2_core.js
// DATA: 30/04/2026
// ORA: 11:35
// DESCRIZIONE:
// - Ripristinata funzione x2_gestisciParametroSpeciale()
// - Gestione speciale parametro 1.0.00
// - Pulizia valore grezzo con x2_pulisciValore()
// ======================================================================

function x2_pulisciValore(v) {
    if (!v) return "";
    return String(v).trim();
}

// ------------------------------------------------------------
// AGGIORNA PULSANTI PARAMETRI 1–8 (logica interna)
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
            pulsanti[i].textContent = "-";
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

        // Supporta sia "00" che "0" SENZA cambiare la logica
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
