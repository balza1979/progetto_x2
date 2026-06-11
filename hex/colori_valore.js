function aggiornaColoreValore(indirizzo) {

    const campoProg = document.getElementById("tendina_valori");
    const campoTab  = document.getElementById("valoreC_" + indirizzo);

    const valA = memoriaA[indirizzo]?.toString().toUpperCase().padStart(2, "0");
    const valB = memoriaB[indirizzo]?.toString().toUpperCase().padStart(2, "0");
    const valC = memoriaC[indirizzo]?.toString().toUpperCase().padStart(2, "0");

    function colora(el) {
        if (!el) return;

        // C = A → VERDE
        if (valC === valA) {
            el.style.backgroundColor = "#006600";
            el.style.color = "white";
            return;
        }

        // C = B → GIALLO
        if (valC === valB) {
            el.style.backgroundColor = "#999900";
            el.style.color = "white";
            return;
        }

        // C diverso da A e B → ROSSO
        el.style.backgroundColor = "#990000";
        el.style.color = "white";
    }

    colora(campoProg);
    colora(campoTab);
}
