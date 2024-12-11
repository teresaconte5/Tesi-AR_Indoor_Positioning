window.onload = () => {
    let testEntityAdded = false;

    const el = document.querySelector("[gps-new-camera]");
	
	//dato evento gps-new-camera prende la posizione quando rileva un movimento, aggiungo un box
    // con a-entity in una posizione a tott metri da quella rilevata inserendo il tutto nella scena
	
    el.addEventListener("gps-camera-update-position", e => {
        if (!testEntityAdded) {
            // Ottenere la posizione corrente utilizzando navigator.geolocation.getCurrentPosition()
            navigator.geolocation.getCurrentPosition(function (position) {
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                console.log(`Current GPS position: lon ${lng}, lat ${lat}`);
            });

            alert(`Got first GPS position: lon ${e.detail.position.longitude} lat ${e.detail.position.latitude}`);

            // Aggiungi una casella a nord della posizione GPS iniziale
            const entity = document.createElement("a-entity");
            entity.setAttribute("scale", {
                x: 0.5,
                y: 0.5,
                z: 0.5
            });
            entity.setAttribute('animation', "property: rotation; to: 0 360 10" );
            entity.setAttribute('gltf-model', './Assets/dragonite/scene.gltf' );
            entity.setAttribute('gps-new-entity-place', {
                latitude: e.detail.position.latitude + 0.001,
                longitude: e.detail.position.longitude
            });

            document.querySelector("a-scene").appendChild(entity);
            
            // Alert dopo l'aggiunta dell'entità alla scena
            alert("Entity added to the scene!");

            measure(e.detail.position.latitude,e.detail.position.longitude, e.detail.position.latitude + 0.001,e.detail.position.longitude);
        }
        testEntityAdded = true;
    });


    
};

// Calcolo distanze
function measure(lat1, lon1, lat2, lon2) {
    // Generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    distance = d * 1000; // Meters
    console.log(`Misurata distanza dell'area: ${distance} metri`);
    alert(`Misurata distanza dell'area: ${distance} metri`)
    return parseInt(distance);
}



function generateRandomCoordinates(lat, lon, radius) {
const maxOffsetLat = radius / 111132; // Conversione da metri a gradi
const maxOffsetLon = radius / 40075; // Conversione da metri a gradi

const randomLatOffset = (Math.random() * 2 - 1) * maxOffsetLat;
const randomLonOffset = (Math.random() * 2 - 1) * maxOffsetLon;

const newLat = lat + randomLatOffset;
const newLon = lon + randomLonOffset;

return { lat: newLat, lon: newLon };
}


