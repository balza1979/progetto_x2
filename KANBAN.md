# 🗂️ KANBAN — Programmatore X1/X2
Versione: 1.1  
Ultimo aggiornamento: {{DATA}}

---

# 🟥 TO DO  
*(Task non iniziati)*

- [ ] 1.1 LocalStorage: struttura base A/B/C  
- [ ] 1.2 Caricamento A da file locale/Git  
- [ ] 1.3 Caricamento B da file locale/Git  
- [ ] 1.4 Creazione C come copia di B  
- [ ] 1.5 Rinomina C con ID impianto  

- [ ] 2.1 Visualizzazione parametri C  
- [ ] 2.2 Lettura parallela valori A e B  
- [ ] 2.3 Colorazione dinamica (verde/giallo/rosso)  
- [ ] 2.4 Colonne “valore A” e “valore B”  
- [ ] 2.5 Tasto “Ripristina da A”  
- [ ] 2.6 Tasto “Ripristina da B”  

- [ ] 3.1 Generazione HEX basata su C  
- [ ] 3.2 Pagina “Dettagli”  
- [ ] 3.3 Salvataggio `idxxxxxdett.json`  
- [ ] 3.4 Collegamento HEX + JSON  

- [ ] 4.1 Confronto A vs B  
- [ ] 4.2 Confronto B vs C  
- [ ] 4.3 Confronto A vs C  
- [ ] 4.4 Confronto dettagli A/B/C  
- [ ] 4.5 Confronto simultaneo A-B-C (tabella unica con evidenza differenze)  

- [ ] 5.1 Pagina analisi errori  
- [ ] 5.2 Dataset errori → parametri  
- [ ] 5.3 Compilazione blocchi  
- [ ] 5.4 Programmazione grafica con immagini  
- [ ] 5.5 Ricerca AI  
- [ ] 5.6 Visualizzazione flag e stato impianto (IN/OUT/FLAG)  
- [ ] 5.7 Gestione errori memorizzati nelle posizioni dedicate  

- [ ] 6.1 CAN: invio singolo parametro  
- [ ] 6.2 CAN: invio blocco parametri  
- [ ] 6.3 CAN: invio memoria completa C  
- [ ] 6.4 CAN: invio memoria A o B  
- [ ] 6.5 CAN: lettura parametri (reverse engineering)  

- [ ] 7.1 Apertura HTML da VBA  
- [ ] 7.2 Passaggio codici schede  
- [ ] 7.3 Precaricamento B da Git/cartella  
- [ ] 7.4 Creazione C con ID da VBA  
- [ ] 7.5 Compilazione JSON dettagli da VBA  
- [ ] 7.6 Stampa PDF filtrata  
- [ ] 7.7 Apertura memoria simile  

- [ ] 8.1 Generazione HEX finale  
- [ ] 8.2 Generazione PDF finale  
- [ ] 8.3 Salvataggio JSON dettagli finale  
- [ ] 8.4 Archiviazione fascicolo impianto  

---

# 🟧 DOING  
*(Task in corso — massimo 1–2 alla volta)*

- [ ] *(vuoto per ora)*  

---

# 🟩 DONE  
*(Task completati)*

- [ ] *(vuoto per ora)*  

---

# ❗ DA RIVEDERE  
*(Task completati ma con problemi da sistemare)*

- [ ] *(vuoto per ora)*  

---

# 🔒 BLOCCATI  
*(Task che richiedono dipendenze o informazioni mancanti)*

- [ ] *(vuoto per ora)*
---

# 📚 SEZIONE DI CONSULTAZIONE TECNICA  
*(Estratti sintetici da X2_MAPPA_COMPLETA — solo per riferimento rapido)*

Questa sezione NON è operativa.  
Serve solo come memoria rapida per capire dove si trovano tasti, ID, funzioni e flussi nei vari repository collegati al Programmatore X1/X2.

---

## 🔵 REPO: MultipdfElmi (DOCUMENTAZIONE ELMI)

### index.html
- **Tasti:** pulsante “Apri” (dinamico, senza ID)  
- **Funzione:**  
  `onclick → window.location.href = pdf.html?cartella=...&ts=...`  
- **Flusso:** index → pdf.html → loading.html

### lista.html
- **Tasti:** “Apri PDF”  
- **Funzione:**  
  `onclick → window.open(directUrl)`

### pdf.html
- Nessun tasto  
- Redirect immediato a loading.html

### loading.html
- Solo spinner

---

## 🔵 REPO: Schede_ausiliarie_Elmi

### index.html
- **Tasti:** “Apri” (dinamico)  
- **Funzione:**  
  `onclick → pdf.html?cartella=...`

### lista.html
- **Tasti:** “Apri / Scarica”, “Vedi Online”  
- **Funzioni:**  
  `openFast(url)`  
  `openSafe(directUrl, gviewUrl)`

### pdf.html (Galleria)
- **Tasti:**  
  - prev-btn → precedente  
  - next-btn → successiva  
  - slideshow-btn → autoplay  
  - fullscreen-btn → fullscreen  
  - mute-btn → audio ON/OFF  
  - pulsanti card: Apri Immagine / Scarica / Vedi Online / Apri Video  
- **Funzioni:**  
  `openFast()`, `openSafe()`, `showItem()`, `mute()`, `fullscreen()`

---

## 🔵 REPO: progetto_x2 (Programmatore X2)

### index.html
- **Tasti:**  
  mostra_tutto_btn, home_btn, crea_hex_btn, btnConfronto  
  menu_btn1..8, sottomenu_btn1..8  
- **Funzioni:**  
  popolaMenu(), popolaSottomenu(), popolaParametri(), mostraInfoParametro()

### confronto_memorie.html
- **Tasti:**  
  file1/2/3, btnAB/AC/BC/ABC, flagVisualizzaTutto  
- **Funzioni:**  
  confrontaAB(), confrontaAC(), confrontaBC(), confrontaABC()

### errori_x2.html
- **Tasti:**  
  btnMemA/B/C, btnLoadFile, btnAI  
- **Funzioni:**  
  buildErrorList(), selectError(), updateDetails()

### hex_generator.html
- **Tasti:**  
  csv_input, genera_hex_btn  
- **Funzioni:**  
  creaBufferMemoria(), bufferToIntelHex(), scaricaFile()

---

## 🔵 REPO: Elmi-Ricerca-errori
- **Tasti:** menu (select)  
- **Funzioni:** caricaExcel(), aggiornamento campi

---

## 🔵 REPO: errori_vers4
- **Tasti:** menu, menuDettaglio, chiudiModal  
- **Funzioni:** loadWorkbook(), caricaExcel(), selezionaFoglio()

---

## 🔵 REPO: Richiesta_Preventivo
- **Tasti:** miniBtn, selectDispositivi, btnInvia  
- **Funzioni:** aggiunta voci, mailto, redirect avviso.html

---

# 🔗 NOTE
Questa sezione è solo consultiva.  
Per dettagli completi → vedi X2_MAPPA_COMPLETA.md.
