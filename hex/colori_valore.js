function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    // --- VALORE A ---
    const valA = String(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE)
                    .toUpperCase()
                    .padStart(2, "0");

    // --- VALORE B (se esiste) ---
    const valB = ultimoParametro.VALORE_B
        ? String(ultimoParametro.VALORE_B).toUpperCase().padStart(2, "0")
        : null;

    // --- VALORE C ---
    let valC = null;
    if (memC) {
        const raw = memC[indirizzo];

        // CONVERSIONE SICURA
        if (typeof raw === "number") {
            valC = raw.toString(16).toUpperCase().padStart(2, "0");
        } else {
            valC = String(raw).toUpperCase().padStart(2, "0");
        }
    }

    // --- Se non ho C → verde ---
    if (!valC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // --- C = A → VERDE ---
    if (valC === valA) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // --- C = B → GIALLO ---
    if (valB && valC === valB) {
        campo.style.backgroundColor = "#999900";
        campo.style.color = "white";
        return;
    }

    // --- C diverso da A e B → ROSSO ---
    campo.style.backgroundColor = "#990000";
    campo.style.color = "white";
}
