# X2_OPERATIVO.md
# VERSIONE: 1.0 — SUPER COMPATTA
# SCOPO: memoria tecnica sintetica del Programmatore X2 + repository collegati

============================================================
1. PROGRAMMATORE X2 (REPO: progetto_x2)
============================================================

index.html → UI principale (menu, sottomenu, parametri, valori)
confronto_memorie.html → confronto A/B/C
errori_x2.html → errori 0x8000–0x8FFF + gemme IN/OUT/FLAG
hex_generator.html → generatore memoria HEX

JS principali:
x2_menu_struttura_data.js → struttura menu/sottomenu
x2_parametri_data.js → database parametri
x2_loader.js → caricamento JSON tendine
x2_core.js → logica interna parametri
x2_ui.js → UI completa (menu, sottomenu, parametri, valori)
x2_debug.js → debug
x2_compare.js → confronto X1/X2

Cartelle:
json_tendine/ → valori dinamici parametri
img/ → icone valori/menu/sottomenu

============================================================
ID PRINCIPALI (TUTTE LE PAGINE)
============================================================

index:
mostra_tutto_btn, home_btn, crea_hex_btn, btnConfronto
menu, menu_btn1..8
sottomenu, sottomenu_btn1..8
screen-warning

confronto_memorie:
file1, file2, file3
labelFileA, labelFileB, labelFileC
selettoreGit, gitList, btnChiudiGit, btnConfermaGit, gitPopup
btnAB, btnAC, btnBC, btnABC
flagVisualizzaTutto, columnFilters
risultati

errori_x2:
btnMemA, btnMemB, btnMemC, btnLoadFile
btnAI
errorList
detailsErrore
gridIN, gridOUT, gridFLAG

hex_generator:
csv_input
genera_hex_btn
log

============================================================
FUNZIONI PRINCIPALI (MAPPATURA)
============================================================

index / x2_ui.js:
popolaMenu(), popolaSottomenu()
popolaParametri()
mostraInfoParametro()
caricaValoriJSON()
gestisciFonteValori()
aggiornaPulsantiVal()
aggiornaPulsantiParam()
gestisciNavigazione()

confronto_memorie.js:
onFileA_Change(), onFileB_Change(), onFileC_Change()
selezionaSlot(), chiudiPopup()
confrontaAB(), confrontaAC(), confrontaBC(), confrontaABC()
apriErrori()

errori_x2.html (inline):
buildErrorList(), selectError(), updateDetails()
buildGems(), updateGems()
setMem(), aiMock()

hex_generator.html (inline):
creaBufferMemoria()
applicaBlocchiFF()
intelHexChecksum()
bufferToIntelHex()
scaricaFile()
scriviParametriDaTabella()

============================================================
FLUSSI PRINCIPALI
============================================================

FLUSSO MENU/SOTTOMENU:
x2_menu_struttura_data.js → x2_ui.js → index.html

FLUSSO PARAMETRI:
x2_parametri_data.js → x2_ui.js → index.html

FLUSSO VALORI:
json_tendine/*.json → x2_loader.js → x2_ui.js → UI

FLUSSO CONFRONTO:
file1/2/3 → confronto_memorie.js → risultati

FLUSSO ERRORI:
memA/B/C → errori_x2.html → errorList + detailsErrore + gemme

FLUSSO HEX:
x2_parametri → scriviParametriDaTabella() → bufferToIntelHex() → scaricaFile()

============================================================
SEQUENZA DI CARICAMENTO (index)
============================================================
1. x2_menu_struttura_data.js
2. x2_parametri_data.js
3. x2_loader.js
4. x2_core.js
5. x2_ui.js
6. x2_debug.js
7. x2_compare.js

============================================================
GESTIONE JSON
============================================================
json_tendine/<parametro>.json → elenco valori dinamici
x2_loader.js → x2_caricaJSON()
x2_ui.js → gestisciFonteValori()

============================================================
GESTIONE PARAMETRI
============================================================
Fonte: x2_parametri_data.js
Campi chiave: PARAMETRO, DESCRIZIONE, VALORE, LIBERA1..6
LIBERA1 = indirizzo HEX
LIBERA2 = size
LIBERA3 = tipo (NUM, ENUM, BIT, INT)
LIBERA4 = scala
LIBERA6 = offset

============================================================
GESTIONE HEX
============================================================
hex_generator.html:
buffer 8192 byte
blocchi FF: 0x0000–01FF, 0x0520–05FF, 0x0A00–1FFF
scriviParametriDaTabella() → ignora runtime + 0x0500–051F
firmware X2: buf[0x0351] = 0x03

============================================================
GESTIONE ERRORI
============================================================
range errori: 0x8000–0x8FFF (16 errori × 16 byte)
errorList → card dinamiche
detailsErrore → cod/piano/data/ora
gridIN/OUT/FLAG → 64/64/32 gemme

============================================================
GESTIONE CONFRONTO
============================================================
file1/2/3 → parse → confronto_memorie.js
flagVisualizzaTutto → rilancia confronto
columnFilters → mostra/nasconde colonne

============================================================
MAPPATURA RAPIDA (ID → FILE → FUNZIONE)
============================================================
menu_btnX → index → x2_ui.js → openMenu(X)
sottomenu_btnX → index → x2_ui.js → openSottomenu(X)
file1 → confronto_memorie → onFileA_Change()
btnAB → confronto_memorie → confrontaAB()
btnMemA → errori_x2 → setMem('A')
btnAI → errori_x2 → aiMock()
genera_hex_btn → hex_generator → genera HEX

============================================================
REPOSITORY ESTERNI (STRUTTURA FUTURA)
============================================================
Ogni repo → sintetizzato in:
REPO: nome
FILE: elenco file chiave
RUOLO: funzione nel progetto
USO: dove viene richiamato
LINK: collegamento logico

============================================================
NOTE TECNICHE
============================================================
gitList duplicato → unificare
json_tendine → valori dinamici
x2_ui.js → file critico
scriviParametriDaTabella → logica definitiva

============================================================
2. MULTIPDFELMI (REPO: MultipdfElmi)
============================================================

FILE:
index.html, lista.html, pdf.html, loading.html

ID:
index → folder-container
lista → titolo, pdf-container
loading → .loader

FUNZIONI:
index → fetch elenco.json → genera card → redirect pdf.html
lista → fetch elenco.json → lista PDF
pdf → redirect loading.html
loading → spinner

FLUSSO:
elenco.json → index → lista → pdf → loading

============================================================
3. SCHEDE AUSILIARIE ELMI (REPO: Schede_ausiliarie_Elmi)
============================================================

FILE:
index.html, lista.html, loading.html, viewer.html, pdf.html (galleria)

ID:
index → folder-container
lista → titolo, pdf-container
viewer → iframe generato
loading → .loader

pdf.html (galleria):
big-gallery
viewer-container
big-image
big-video
fullscreen-btn
mute-btn
prev-btn
next-btn
slideshow-btn
speed-control
counter
pdf-container
bottom-spacer
loadingPopup
loadingSub
testFrame

FUNZIONI:
openFast()
openSafe()
showLoading()
showItem()
prev/next
mute
fullscreen

FLUSSO:
elenco.json → pdf.html → galleria → viewer → loading

============================================================
4. ERRORI ELMI (REPO: Elmi-Ricerca-errori)
============================================================

ID:
labelA/B/C/D
menu
campoB/C/D

FUNZIONI:
caricaExcel()
menu.onchange → aggiorna campi

============================================================
5. ERRORI_VERS4 (REPO: errori_vers4)
============================================================

ID:
versione
titoloErrore
menu
manuali-container
menuDettaglio
campoB/C/D
labelA_det, labelB, labelC, labelD
modal, modalText, chiudiModal

FUNZIONI:
loadWorkbook()
caricaExcel()
selezionaFoglio()
gestione manuali (colonne 13–20)
modale fullscreen

============================================================
6. RICHIESTA PREVENTIVO (REPO: Richiesta_Preventivo)
============================================================

ID:
txtID
txtNome
txtTelefono
txtDescrizione
txtSchede
selectDispositivi
miniBtn
btnInvia

FUNZIONI:
miniBtn.onclick → aggiunge voce
selectDispositivi.onchange → aggiunge voce
btnInvia → valida + mailto + redirect avviso.html

avviso.html:
goEmail → apre mailto → redirect home

============================================================
7. VIEWER / LOADER / PDF (TUTTI I REPO)
============================================================

viewer.html → Google Viewer
loading.html → spinner
pdf.html → galleria immagini/video/PDF

============================================================
8. DIPENDENZE GLOBALI
============================================================

elenco.json
errori.xlsx
pdfManualiErrori/
pdf/<cartella>/
loading.html
Google Docs Viewer
libreria XLSX
