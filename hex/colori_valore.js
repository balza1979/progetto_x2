function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    const campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_minmax");

    if (!campo) return;

    // --- VALORE A (default del parametro) ---
    const valoreA_UMANO = ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE;

    // ⭐ CONVERSIONE CORRETTA (USIAMO LA FUNZIONE CENTRALE)
    const byteA = convertValueToByte(ultimoParametro, valoreA_UMANO)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");

    // --- VALORE C (memoria C modificata) ---
    let valC = null;
    if (memC_modificata) {
        valC = memC_modificata[indirizzo]
            ?.toString(16)
            .toUpperCase()
            .padStart(2, "0");
    }

    // ⭐⭐⭐ RIPRISTINO IL TUO POP-UP ⭐⭐⭐
    alert(
        "PARAMETRO: " + ultimoParametro.PARAMETRO + "\n" +
        "INDIRIZZO: " + indirizzo + "\n\n" +
        "A (default → convertito): " + byteA + "\n" +
        "C (memC_modificata): " + (valC ?? "null") + "\n\n" +
        "VALORE CAMPO (umano): " + campo.value + "\n\n" +
        "COLORE ATTESO: " +
        (!valC ? "VERDE (C mancante)" :
        (valC === byteA ? "VERDE (A = C)" : "ROSSO (A ≠ C)"))
    );

    // --- Se non ho memoria C → verde ---
    if (!valC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // --- CONFRONTO CORRETTO ---
    if (valC === byteA) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "#990000"; // rosso
    campo.style.color = "white";
}
