function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    // ⭐ PRENDI IL CAMPO GIUSTO
    const campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_minmax");

    if (!campo) return;

    // --- VALORE A (default del parametro) ---
    const valA = String(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE)
        .padStart(2, "0");

    // --- VALORE C (memoria C) ---
    let valC = null;
    if (memC) {
        valC = memC[indirizzo]
            ?.toString(16)
            .toUpperCase()
            .padStart(2, "0");
    }

    // ⭐⭐⭐ ALERT — SENZA TOCCARE LA TUA LOGICA ⭐⭐⭐
    alert(
        "PARAMETRO: " + ultimoParametro.PARAMETRO + "\n" +
        "INDIRIZZO: " + indirizzo + "\n\n" +
        "A (default): " + valA + "\n" +
        "C (memC): " + (valC ?? "null") + "\n\n" +
        "VALORE CAMPO: " + campo.value + "\n\n" +
        "COLORE ATTESO: " +
        (!valC ? "VERDE (C mancante)" :
        (valC === valA ? "VERDE (A = C)" : "ROSSO (A ≠ C)"))
    );

    // --- Se non ho memoria C → verde ---
    if (!valC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // --- CONFRONTO ---
    if (valC === valA) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "#990000"; // rosso
    campo.style.color = "white";
}
