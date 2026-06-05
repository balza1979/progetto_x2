# CREA_MEMORIA – MAPPA TECNICA (2026)

Questa è la mappa tecnica aggiornata del sistema **crea_memoria**, basata sulla struttura attuale del progetto X2.

---

# 1. STRUTTURA HTML

```
crea_memoria.html
 ├─ Blocco FILE A
 │    ├─ #labelFileA
 │    ├─ #file1
 │    └─ bottone → selezionaSlot("A")
 │
 ├─ Blocco FILE B
 │    ├─ #labelFileB
 │    ├─ #file2
 │    └─ bottone → selezionaSlot("B")
 │
 ├─ #btnResetMemoria
 │
 ├─ #crea-memoria-container
 │    ├─ #btnGeneraC
 │    └─ #log
 │
 ├─ Popup Git (#selettoreGit)
 │    ├─ #gitList
 │    └─ #btnChiudiGitList
 │
 ├─ SCRIPT: x2_parametri_data.js
 ├─ SCRIPT: memorie_tipo.js
 └─ SCRIPT: crea_memoria_v3_5_6_26_1647.js
```

---

# 2. JS – CREA_MEMORIA (LOGICA PRINCIPALE)

### Variabili
- `memoriaA`
- `memoriaB`

### Funzioni
- `leggiFileHex(input, callback)`
- `hexToMemoryMap(hexText)`
- `log(msg)`
- `onFileA_Change()`
- `onFileB_Change()`
- `aggiornaBloccoCreazione()`
- `resetCreazione()` *(non usata)*

### Eventi
- `DOMContentLoaded` → ripristina A/B + aggiorna UI  
- `btnGeneraC.click`  
- `btnResetMemoria.click` → clear localStorage + reload  

---

# 3. JS – MEMORIE_TIPO (GESTIONE TENDINA GIT)

### Variabili
- `slotAttivo`
- `strutturaGit` ← contenuto di `lista_memorie.json`
- `listaCompleta`

### Costanti
- `RAW_BASE = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/"`

### Funzioni
- `selezionaSlot(slot)`
- `caricaStrutturaGit()` → legge `lista_memorie.json`
- `popolaListaGit()` → riempie la tendina
- `confermaGit(path)` → scarica file HEX/BIN e lo carica nello slot
- `fakeFile(nome, contenuto)`
- `caricaFileGit(path)`
- `convertiBinInHex(buffer)`

### Eventi
- `btnChiudiGitList.click`

---

# 4. FLUSSO LOGICO COMPLETO

### FILE A locale
```
file1 → onFileA_Change → memoriaA → localStorage → aggiornaBloccoCreazione
```

### FILE B locale
```
file2 → onFileB_Change → memoriaB → localStorage → aggiornaBloccoCreazione
```

### FILE A da Git
```
selezionaSlot("A")
 → popup Git
 → confermaGit(path)
 → fakeFile
 → memoriaA
 → localStorage
 → aggiornaBloccoCreazione
```

### FILE B da Git
```
selezionaSlot("B")
 → popup Git
 → confermaGit(path)
 → fakeFile
 → memoriaB
 → localStorage
 → aggiornaBloccoCreazione
```

### Reset
```
btnResetMemoria → clear localStorage → reload
```

### Creazione C
```
btnGeneraC → usa memoriaA + memoriaB → genera C → log
```

---

# 5. ELEMENTI NON PRESENTI
- nessun file C visibile  
- nessuna tabella  
- nessun confronto A/B  
- nessun filtro  
- nessun runtime  
- nessuna API GitHub  
- nessun token  
- nessun limite API  

---

# 6. NOTE 2026
- La tendina Git usa **solo** `lista_memorie.json`
- Il JSON è aggiornato automaticamente dalla GitHub Action
- Il sistema è completamente offline e stabile
