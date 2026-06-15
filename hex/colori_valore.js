function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    // 1) Indirizzo HEX corretto
    const indirizzo = parseInt(ultimoParametro.LIBERA1, 16);
    if (isNaN(indirizzo)) return;

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    // ============================
    // A (default)
    // ============================
    const byteA = Number(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");

    // ============================
    // B (memoria B)
    // ============================
    let byteB = null;
    if (memB && memB[indirizzo] != null) {
        byteB = memB[indirizzo]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0");
    }

    // ============================
    // C (memoria C)
    // ============================
    let byteC = null;
    if (memC && memC[indirizzo] != null) {
        byteC = memC[indirizzo]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0");
    }

    // ============================
    // CAMPO (valore selezionato)
    // ============================
    const byteCampo = Number(campo.value)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");

    // ============================
    // LOGICA COLORI
    // ============================

    // Se NON c’è C → verde (nessuna memoria caricata)
    if (!byteC) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    // Se CAMPO ≠ C → rosso (modificato)
    if (byteCampo !== byteC) {
        campo.style.backgroundColor = "#990000"; // rosso
        campo.style.color = "white";
        return;
    }

    // Se CAMPO = C ma C ≠ A → giallo (diverso dal default)
    if (byteC !== byteA) {
        campo.style.backgroundColor = "#CCAA00"; // giallo
        campo.style.color = "black";
        return;
    }

    // Se CAMPO = C = A → verde (tutto ok)
    campo.style.backgroundColor = "#006600"; // verde
    campo.style.color = "white";
}
