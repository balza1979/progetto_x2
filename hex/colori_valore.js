// FILE: hex/colori_valore.js
// VERSIONE: 29/06/2026 14:10

function aggiornaColoreValore() {

    // 🔥 SE LE MEMORIE NON SONO ANCORA PRONTE → ESCO
    if (!memA || !memB || !memC) {
        // console.log("aggiornaColoreValore: memorie non pronte");
        return;
    }

    const campo = document.getElementById("tendina_valori");
    if (!campo) {
        // console.log("aggiornaColoreValore: nessuna tendina_valori trovata");
        return;
    }

    const param = ultimoParametro;
    if (!param) {
        // console.log("aggiornaColoreValore: nessun ultimoParametro");
        return;
    }

    const indirizzo = parseInt(param.LIBERA1, 16);
    if (isNaN(indirizzo) || indirizzo < 0 || indirizzo >= memA.length || indirizzo >= memB.length || indirizzo >= memC.length) {
        // console.log("aggiornaColoreValore: indirizzo fuori range", indirizzo);
        return;
    }

    let valoreA = memA[indirizzo];
    let valoreB = memB[indirizzo];
    let valoreC = memC[indirizzo];

    let colorePrevisto = "NESSUNO";

    if (valoreA === valoreB && valoreB === valoreC) {
        colorePrevisto = "VERDE";
    }
    else if (valoreC === valoreB && valoreC !== valoreA) {
        colorePrevisto = "GIALLO";
    }
    else if (valoreC !== valoreA) {
        colorePrevisto = "ROSSO";
    }
    else if (valoreC !== valoreB) {
        colorePrevisto = "BLU";
    }

    // 🔥 SOLO DEBUG, SE LO VUOI
    /*
    alert(
        "DEBUG COLORE\n\n" +
        "A: " + valoreA + "\n" +
        "B: " + valoreB + "\n" +
        "C: " + valoreC + "\n\n" +
        "COLORE PREVISTO: " + colorePrevisto + "\n"
    );
    */

    // 🔥 APPLICA COLORE ALLA TENDINA (SELECT) — NIENTE !important
    if (colorePrevisto === "VERDE") {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
    } else if (colorePrevisto === "GIALLO") {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
    } else if (colorePrevisto === "ROSSO") {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
    } else if (colorePrevisto === "BLU") {
        campo.style.backgroundColor = "#0000CC";
        campo.style.color = "white";
    } else {
        // nessuna condizione → stile base
        campo.style.backgroundColor = "#0d0d0d";
        campo.style.color = "#ffcccc";
    }
}
