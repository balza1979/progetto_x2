// Carica memB dal localStorage e la rende globale
(function() {
    const hexB = localStorage.getItem("memB_hex");
    if (hexB) {
        const memoriaB = window.hexToMemoryMap(hexB);
        window.memB = memoriaB;
    } else {
        window.memB = null;
    }
})();
