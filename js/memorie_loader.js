// js/memorie_loader.js
// Loader unico A/B/C da localStorage → memA / memB / memC

function hexToMemoryMap(hexText) {
    const lines = hexText.trim().split(/\r?\n/);
    const memory = new Uint8Array(65536);

    for (const line of lines) {
        if (!line.startsWith(":")) continue;

        const byteCount  = parseInt(line.substr(1, 2), 16);
        const address    = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType !== 0) continue;

        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2);
            memory[address + i] = parseInt(byteHex, 16);
        }
    }

    return memory;
}

function caricaMemorieGlobali() {
    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");
    const hexC = localStorage.getItem("memC_hex");

    window.memA = hexA ? hexToMemoryMap(hexA) : null;
    window.memB = hexB ? hexToMemoryMap(hexB) : null;
    window.memC = hexC ? hexToMemoryMap(hexC) : null;
}
