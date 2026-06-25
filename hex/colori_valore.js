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
    // 3) DEBUG
    // -----------------------------
    alert(
        "DEBUG COLORE\n\n" +
        "CAMPO (logico): " + valoreLogicoCampo + "\n" +
        "A: " + valoreA + "\n" +
        "B: " + valoreB + "\n" +
        "C: " + valoreC + "\n\n"
    );

    // -----------------------------
    // 4) LOGICA COLORI UFFICIALE
    // -----------------------------

    // VERDE → A = B = C
    if (valoreA === valoreB && valoreB === valoreC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // GIALLO → A ≠ B MA B = C
    if (valoreB === valoreC && valoreA !== valoreB) {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
        return;
    }

    // ROSSO → C ≠ A
    if (valoreC !== valoreA) {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
        return;
    }

    // BLU → C ≠ B
    if (valoreC !== valoreB) {
        campo.style.backgroundColor = "#0000CC";
        campo.style.color = "white";
        return;
    }

    // NESSUN COLORE
    campo.style.backgroundColor = "black";
    campo.style.color = "white";
}
