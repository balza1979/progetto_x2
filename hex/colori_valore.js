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

    // --- VALORE C (memoria C) ---
    let valC = null;
    if (memC) {
        valC = memC[indirizzo]
            ?.toString(16)
            .toUpperCase()
            .padStart(2, "0");
    }

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
