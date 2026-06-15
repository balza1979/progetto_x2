function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1, 16);
    if (isNaN(indirizzo)) return;

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    // A (default)
    const byteA = Number(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE)
        .toString(16).toUpperCase().padStart(2, "0");

    // B (memoria B)
    let byteB = null;
    if (memB && memB[indirizzo] != null) {
        byteB = memB[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    // C (memoria C)
    let byteC = null;
    if (memC && memC[indirizzo] != null) {
        byteC = memC[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    // CAMPO
    const byteCampo = Number(campo.value)
        .toString(16).toUpperCase().padStart(2, "0");

    // ============================
    // POPUP DEBUG
    // ============================
    alert(
        "PARAMETRO: " + ultimoParametro.PARAMETRO + "\n" +
        "INDIRIZZO: " + indirizzo + "\n\n" +
        "A (default → HEX): " + byteA + "\n" +
        "B (memB → HEX): " + (byteB ?? "null") + "\n" +
        "C (memC → HEX): " + (byteC ?? "null") + "\n\n" +
        "CAMPO (umano): " + campo.value + "\n" +
        "CAMPO → HEX: " + byteCampo + "\n\n" +
        "COLORE ATTESO: " +
        (!byteC ? "VERDE (C mancante)" :
        (byteCampo !== byteC ? "ROSSO (CAMPO ≠ C)" :
        (byteC === byteA ? "VERDE (A = C)" : "GIALLO (C ≠ A ma CAMPO = C)")))
    );

    // ============================
    // COLORI
    // ============================

    if (!byteC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    if (byteCampo !== byteC) {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
        return;
    }

    if (byteC !== byteA) {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
        return;
    }

    campo.style.backgroundColor = "#006600";
    campo.style.color = "white";
}
