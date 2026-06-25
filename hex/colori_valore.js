function aggiornaColoreValore(indirizzo) {

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    const param = ultimoParametro;
    if (!param) return;

    // -----------------------------
    // 1) Valore logico CAMPO
    // -----------------------------
    const valoreLogicoCampo = campo.value;
    const byteCampo = convertValueToByte(param, valoreLogicoCampo);

    // -----------------------------
    // 2) Valori logici A / B / C
    // -----------------------------
    let valoreA = null, valoreB = null, valoreC = null;

    if (memA && memA[indirizzo] !== undefined)
        valoreA = convertValueFromByte(param, memA[indirizzo]);

    if (memB && memB[indirizzo] !== undefined)
        valoreB = convertValueFromByte(param, memB[indirizzo]);

    if (memC && memC[indirizzo] !== undefined)
        valoreC = convertValueFromByte(param, memC[indirizzo]);

    // -----------------------------
    // 3) LOGICA COLORI UFFICIALE X2
    // -----------------------------

    // VERDE → A = B = C
    if (valoreA === valoreB && valoreB === valoreC) {

        alert(
            "DEBUG COLORE\n\n" +
            "CAMPO: " + valoreLogicoCampo + "\n" +
            "A: " + valoreA + "\n" +
            "B: " + valoreB + "\n" +
            "C: " + valoreC + "\n\n" +
            "COLORE PREVISTO: VERDE\n" +
            "MOTIVO: A = B = C"
        );

        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // GIALLO → A ≠ B MA B = C
    if (valoreB === valoreC && valoreA !== valoreB) {

        alert(
            "DEBUG COLORE\n\n" +
            "CAMPO: " + valoreLogicoCampo + "\n" +
            "A: " + valoreA + "\n" +
            "B: " + valoreB + "\n" +
            "C: " + valoreC + "\n\n" +
            "COLORE PREVISTO: GIALLO\n" +
            "MOTIVO: B = C ma A diverso"
        );

        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
        return;
    }

    // ROSSO → C ≠ A
    if (valoreC !== valoreA) {

        alert(
            "DEBUG COLORE\n\n" +
            "CAMPO: " + valoreLogicoCampo + "\n" +
            "A: " + valoreA + "\n" +
            "B: " + valoreB + "\n" +
            "C: " + valoreC + "\n\n" +
            "COLORE PREVISTO: ROSSO\n" +
            "MOTIVO: C diverso da A"
        );

        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
        return;
    }

    // BLU → C ≠ B
    if (valoreC !== valoreB) {

        alert(
            "DEBUG COLORE\n\n" +
            "CAMPO: " + valoreLogicoCampo + "\n" +
            "A: " + valoreA + "\n" +
            "B: " + valoreB + "\n" +
            "C: " + valoreC + "\n\n" +
            "COLORE PREVISTO: BLU\n" +
            "MOTIVO: C diverso da B"
        );

        campo.style.backgroundColor = "#0000CC";
        campo.style.color = "white";
        return;
    }

    // NESSUN COLORE
    alert(
        "DEBUG COLORE\n\n" +
        "CAMPO: " + valoreLogicoCampo + "\n" +
        "A: " + valoreA + "\n" +
        "B: " + valoreB + "\n" +
        "C: " + valoreC + "\n\n" +
        "COLORE PREVISTO: NESSUNO\n" +
        "MOTIVO: nessuna condizione soddisfatta"
    );

    campo.style.backgroundColor = "black";
    campo.style.color = "white";
}
