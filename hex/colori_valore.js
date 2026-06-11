// ============================================================
//  COLORAZIONE DINAMICA UNIVERSALE (TABELLA + PROGRAMMATORE)
//  Versione 2026-06-11 16:40
// ============================================================

function aggiornaColoreValore(indirizzo) {

    // --- CASO 1: PROGRAMMATORE X2 (usa memC) ---
    if (typeof memC !== "undefined" && memC) {

        const byteC = memC[indirizzo];
        const campoProg = document.getElementById("tendina_valori");

        if (campoProg) {
            campoProg.style.backgroundColor = "";
            campoProg.style.color = "white";

            if (byteC === undefined) return;

            // Programmatore: se non hai A/B → verde fisso
            campoProg.style.backgroundColor = "#006600";
            return;
        }
    }

    // --- CASO 2: TABELLA CONFRONTO (usa memoriaA/B/C) ---
    if (typeof memoriaC !== "undefined" &&
        typeof memoriaA !== "undefined" &&
        typeof memoriaB !== "undefined") {

        const valA = memoriaA[indirizzo];
        const valB = memoriaB[indirizzo];
        const valC = memoriaC[indirizzo];

        const campoTab = document.getElementById("valoreC_" + indirizzo);
        if (!campoTab) return;

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
    }
}
