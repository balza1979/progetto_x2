function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    // ⭐ PRENDI IL CAMPO GIUSTO
    const campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_minmax");

    if (!campo) return;

    // ------------------------------------------------------------
    // 1) A (DEFAULT) → convertito in HEX
    // ------------------------------------------------------------
    const valoreA_UMANO = ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE;

    const byteA = convertValueToByte(ultimoParametro, valoreA_UMANO)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");

    // ------------------------------------------------------------
    // 2) C (MEMORIA C MODIFICATA)
    // ------------------------------------------------------------
    let byteC = null;
    if (memC_modificata && memC_modificata[indirizzo] != null) {
        byteC = memC_modificata[indirizzo]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0");
    }

    // ------------------------------------------------------------
    // 3) CAMPO (valore umano) → convertito in HEX
    // ------------------------------------------------------------
    const byteCampo = convertValueToByte(ultimoParametro, campo.value)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");

    // ------------------------------------------------------------
    // 4) POPUP DI DEBUG COMPLETO
    // ------------------------------------------------------------
    alert(
        "PARAMETRO: " + ultimoParametro.PARAMETRO + "\n" +
        "INDIRIZZO: " + indirizzo + "\n\n" +
        "A (default → HEX): " + byteA + "\n" +
        "C (memC_modificata → HEX): " + (byteC ?? "null") + "\n\n" +
        "CAMPO (umano): " + campo.value + "\n" +
        "CAMPO → HEX: " + byteCampo + "\n\n" +
        "COLORE ATTESO: " +
        (!byteC ? "VERDE (C mancante)" :
        (byteCampo !== byteC ? "ROSSO (CAMPO ≠ C)" :
        (byteC === byteA ? "VERDE (A = C)" : "GIALLO (C ≠ A ma CAMPO = C)")))
    );

    // ------------------------------------------------------------
    // 5) APPLICA COLORE
    // ------------------------------------------------------------
    if (!byteC) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    if (byteCampo !== byteC) {
        campo.style.backgroundColor = "#990000"; // rosso
        campo.style.color = "white";
        return;
    }

    if (byteC === byteA) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "#CCAA00"; // giallo
    campo.style.color = "black";
}
