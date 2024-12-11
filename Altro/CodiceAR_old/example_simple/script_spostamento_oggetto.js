document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('button[data-action="Move"]');
    button.innerText = 'Move';

    let place = staticLoadPlace(); // Carica il luogo iniziale
    let initialPosition = { x: place.location.lng, y: 0, z: place.location.lat }; // Memorizza la posizione iniziale
    renderPlace(place);

    function staticLoadPlace() {
        return {
            name: 'Magnemite', // Nome dell'oggetto
            location: {
                lat: 40.986040,
                lng: 14.171448,
            }
        };
    }

    function renderPlace(place) {
        let scene = document.querySelector('a-scene');
        let latitudeOffset = 0;
        let longitudeOffset = 0;
        
        alert(`Got first GPS position: lon ${place.location.lng} lat ${place.location.lat}`);
        
        let model = document.createElement('a-entity');
        
        // Imposta la posizione iniziale dell'oggetto
        model.setAttribute('position', { x: initialPosition.x, y: initialPosition.y, z: initialPosition.z });
        model.setAttribute('gltf-model', './Assets/magnemite/scene.gltf');
        model.setAttribute('rotation', '0 180 0');
        model.setAttribute('animation-mixer', '');
        model.setAttribute('scale', '0.5 0.5 0.5');
        
        model.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-new-entity-place-loaded'))
        });
        
        scene.appendChild(model);

        // Aggiungi un event listener al pulsante per spostare l'oggetto
        
        document.querySelector('button[data-action="Move"]').addEventListener('click', function() {
            
            // Incrementa le coordinate z e x dell'oggetto per simulare il movimento
            latitudeOffset += 0.00002; // Incrementa la latitudine di 2 metri
            longitudeOffset += 0.00005; // Incrementa la longitudine di 5 metri
            
            // Calcola la nuova posizione in base agli offset di latitudine e longitudine
            let newX = initialPosition.x + longitudeOffset;
            let newZ = initialPosition.z + latitudeOffset;

            // Imposta la nuova posizione dell'oggetto
            model.setAttribute('position', { x: newX, y: initialPosition.y, z: newZ });
        });
    }
});
