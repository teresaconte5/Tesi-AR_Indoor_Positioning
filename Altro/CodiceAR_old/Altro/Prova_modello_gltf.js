// Prova_modello_gltf.js
let modelLoaded = false; // Stato per verificare se il modello è caricato

const loader = new THREE.GLTFLoader();

// Caricamento del modello GLTF
loader.load('texture/ancient_pillars.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(1, 1, 1); // Modifica la scala se necessario
    document.querySelector('#model').setObject3D('mesh', model);
    modelLoaded = true; // Modifica lo stato a caricato
    console.log('Modello caricato:', model);
}, undefined, function (error) {
    console.error('Errore nel caricamento del modello:', error);
});

// Funzione per gestire gli aggiornamenti GPS
function gpsupdate(data) {
    if (modelLoaded) {
        const modelEntity = document.querySelector('#model');
        // Aggiorna la posizione del modello con i dati GPS ricevuti
        modelEntity.object3D.position.set(data.longitude, data.latitude, 0);
    } else {
        console.warn('Il modello non è ancora caricato, non si può aggiornare la posizione.');
    }
}

// Assicurati di invocare gpsupdate() nel tuo codice quando ricevi dati GPS
// Esempio di invocazione (da sostituire con i tuoi dati GPS reali):
setInterval(() => {
    const fakeGPSData = {
        latitude: 51.10, // Simulazione di latitudine
        longitude: -0.82  // Simulazione di longitudine
    };
    gpsupdate(fakeGPSData);
}, 5000); // Aggiorna ogni 5 secondi (modifica secondo le tue esigenze)
