function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    const campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_minmax");

    if (!campo) return;

    // A (default) → DEC → HEX
    const byteA = Number(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE)
        .toString(16).toUpperCase().padStart(2, "0");

    // C (memoria C) → HEX
    let byteC = null;
    if (memC_modificata && memC_modificata[indirizzo] != null) {
        byteC = Number(memC_modificata[indirizzo])
            .toString(16).toUpperCase().padStart(2, "0");
    }

    // CAMPO → DEC → HEX
    const byteCampo = Number(campo.value)
        .toString(16).toUpperCase().padStart(2, "0");

    alert(
        "PARAMETRO: " + ultimoParametro.PARAMETRO + "\n" +
        "INDIRIZZO: " + indirizzo + "\n\n" +
        "A (default → HEX): " + byteA + "\n" +
        "C (memC → HEX): " + (byteC ?? "null") + "\n\n" +
        "CAMPO (umano): " + campo.value + "\n" +
        "CAMPO → HEX: " + byteCampo + "\n\n" +
        "COLORE ATTESO: " +
        (!byteC ? "VERDE (C mancante)" :
        (byteCampo !== byteC ? "ROSSO (CAMPO ≠ C)" :
        (byteC === byteA ? "VERDE (A = C)" : "GIALLO (C ≠ A ma CAMPO = C)")))
    );

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

    if (byteC === byteA) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "#CCAA00";
    campo.style.color = "black";
}
