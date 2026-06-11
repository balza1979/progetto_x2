// ============================================================
//  COLORAZIONE DINAMICA UNIVERSALE (TABELLA + PROGRAMMATORE)
//  Versione 2026-06-11 17:55
// ============================================================

function aggiornaColoreValore(indirizzo) {

    // --- PROGRAMMATORE X2: tendina valori ---
    const campoProg = document.getElementById("tendina_valori");
    if (campoProg) {
        campoProg.style.setProperty("background-color", "#006600", "important");
        campoProg.style.color = "white";
        return;
    }

    // --- TABELLA CONFRONTO ---
    const campoTab = document.getElementById("valoreC_" + indirizzo);
    if (campoTab && typeof memoriaC !== "undefined") {

        const valA = memoriaA?.[indirizzo];
        const valB = memoriaB?.[indirizzo];
        const valC = memoriaC?.[indirizzo];

        campoTab.style.backgroundColor = "";
        campoTab.style.color = "white";

        if (!valC || valC === "--") return;

        if (valC === valA) {
            campoTab.style.backgroundColor = "#006600"; // verde
            return;
        }

        if (valC === valB) {
            campoTab.style.backgroundColor = "#999900"; // giallo
            return;
        }

        campoTab.style.backgroundColor = "#990000"; // rosso
        return;
    }
} 