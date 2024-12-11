# AR Indoor Positioning
## Overview
Questo progetto esplora un sistema di posizionamento indoor basato su machine learning integrato con un'interfaccia di realtà aumentata (AR), progettato per tracciare in tempo reale la posizione degli
utenti in ambienti chiusi. L'architettura attuale utilizza segnali RSSI provenienti da beacon Bluetooth e modelli di machine learning per stimare le coordinate degli utenti, visualizzandole poi in una 
scena AR accessibile tramite smartphone.

## a) System Architecture
# Architettura Proposta
L’architettura proposta è composta da una parte **Edge Side**, che gestisce i componenti e le operazioni vicine all’utente e ai dispositivi hardware, e una parte **Cloud Side**, che fornisce supporto per la gestione dei dati e dei contenuti centralizzati.
![architettura](https://github.com/teresaconte5/Tesi-AR_Indoor_Positioning/blob/main/images/Architettura_proposta.png).
# Edge Side #

**1. Hardware Components**

- **IoT Device - BLE Tag:**  Piccoli beacon distribuiti nell'ambiente che emettono segnali RSSI (Received Signal Strength Indicator).

- **Available Devices(Smartphone, Tablet, Smart Glasses)**: Dispositivi con connettività BLE e capacità di elaborazione per applicazioni AR.

**2. Software Components**

- **RSSI Scanner:** Raccoglie i segnali RSSI dai BLE Tag e fornisce i dati grezzi per la stima della posizione.

- **ML Position Predictor:** Modulo basato su machine learning che elabora i segnali RSSI per calcolare le coordinate precise dell'utente, compensando ostacoli e variazioni di segnale.

- **AR Module:** Utilizza le coordinate generate per posizionare e visualizzare oggetti virtuali in tempo reale, creando un'esperienza AR immersiva e contestualizzata.

**3. Mobile Application**
La Mobile Application è il cuore del sistema e fornisce le seguenti funzionalità:

- Riceve i dati RSSI dai BLE Tag tramite l'RSSI Scanner.
- Stima la posizione dell'utente tramite il ML Position Predictor.
- Visualizza i contenuti AR grazie al modulo AR, posizionando gli oggetti virtuali.
- Gestisce connessioni al database delle posizioni per aggiornamenti in tempo reale.
  
# Cloud Side #
**1. Position Real-Time Database**
Questo database contiene le posizioni degli utenti in tempo reale, popolato e aggiornato tramite il componente Microservices.

**2. 3D Objects Database**
Il 3D Objects Database memorizza i modelli 3D utilizzati nell’applicazione AR.

**3. Microservices**
I Microservices rappresentano il principale punto di connessione tra l’Edge Side e il Cloud Side. Questo componente è responsabile di:
- Gestire le richieste di aggiornamento e recupero per il Position Real-Time Database e il 3D Objects Database.
- Fornire un’interfaccia API per la Mobile Application, che permette la sincronizzazione dei dati e l’aggiornamento in tempo reale delle posizioni.
- Coordinare la distribuzione degli oggetti 3D tra gli utenti e gestire la visualizzazione AR in base ai dati presenti nei database.

** 4. 3D Contents Management Administrator GUI**
Questa interfaccia grafica `e destinata agli amministratori del sistema per la gestione
dei contenuti 3D.

# Architettura realmente realizzata del sistema del sistema

L'architettura realizzata differisce rispetto all'Architettura Proposta per la realizzazione del modulo AR:
- Modulo AR è  implementato localmente sul server e non direttamente sul dispositivo mobile.
- La comunicazione tra l'applicazione mobile e il server avviene tramite richieste e utilizzo di un MQTT Broker, che pubblica i dati di posizione stimati al modulo AR.
- La visualizzazione AR avviene sui dispositivi compatibili (come smartphone e computer), ma dipende dal server centrale per ottenere le informazioni di posizionamento e visualizzazione.

![architettura](https://github.com/teresaconte5/Tesi-AR_Indoor_Positioning/blob/main/images/Architettura_Realizzata.png)


