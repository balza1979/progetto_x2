function aggiornaColoreValore(indirizzo) {

    const campoProg = document.getElementById("tendina_valori");

    // --- SE SIAMO NEL PROGRAMMATORE ---
    if (campoProg && indirizzo !== undefined && indirizzo !== null) {

        const valA = memoriaA?.[indirizzo];
        const valB = memoriaB?.[indirizzo];
        const valC = campoProg.value;

        campoProg.style.backgroundColor = "";
        campoProg.style.color = "white";

        if (!valC || valC === "--") return;

        if (valC === valA) {
            campoProg.style.setProperty("background-color", "#006600", "important"); // verde
            return;
        }

        if (valC === valB) {
            campoProg.style.setProperty("background-color", "#999900", "important"); // giallo
            return;
        }

        campoProg.style.setProperty("background-color", "#990000", "important"); // rosso
        return;
    }

    // --- SE SIAMO NELLA TABELLA ---
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
