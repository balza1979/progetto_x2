function aggiornaColoreValore(indirizzo) {

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    const param = ultimoParametro;
    if (!param) return;

    // 1) Valore logico selezionato nella tendina
    const valoreLogicoCampo = campo.value;

    // 2) Converti in byte come fai quando salvi
    const byteCampo = convertValueToByte(param, valoreLogicoCampo);

    // 3) Leggi A/B/C come VALORI LOGICI
    let valoreA = null, valoreB = null, valoreC = null;

    if (memA && memA[indirizzo] !== undefined)
        valoreA = convertValueFromByte(param, memA[indirizzo]);

    if (memB && memB[indirizzo] !== undefined)
        valoreB = convertValueFromByte(param, memB[indirizzo]);

    if (memC && memC[indirizzo] !== undefined)
        valoreC = convertValueFromByte(param, memC[indirizzo]);

    // 4) DEBUG
    alert(
        "DEBUG COLORE\n\n" +
        "VALORE LOGICO CAMPO: " + valoreLogicoCampo + "\n" +
        "BYTE CAMPO: " + byteCampo + "\n\n" +
        "A (logico): " + valoreA + "\n" +
        "B (logico): " + valoreB + "\n" +
        "C (logico): " + valoreC + "\n\n"
    );

    // 5) LOGICA COLORI (sui valori logici)
    if (valoreC == null) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    if (valoreLogicoCampo !== valoreC) {
        campo.style.backgroundColor = "#990000"; // rosso
        campo.style.color = "white";
        return;
    }

    if (valoreA != null && valoreC !== valoreA) {
        campo.style.backgroundColor = "#CCAA00"; // giallo
        campo.style.color = "black";
        return;
    }

    campo.style.backgroundColor = "#006600"; // verde
    campo.style.color = "white";
}
