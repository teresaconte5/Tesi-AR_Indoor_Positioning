var test =0;
var arjs;


export function fake_update(cam, arjs, lat, long) { // Aggiungo lat e long come parametri
    var fake;
    console.log("Inizio aggiornamento posizione fake");

    if (test == 0) {
        // Usa lat e long passati come argomenti
        fake = { lat: lat, lon: long }; // Imposta fake a lat e lon ricevuti
        console.log(`Test è 0: imposta fake a lat ${lat}, lon ${long}`);
    } else {
        fake = { lat: lat + 0.017, lon: long }; // modifico qui se desidero variare leggermente
        console.log(`Test è 1: imposta fake a lat ${lat + 0.017}, lon ${long}`);
    }

    test = (test + 1) % 2;
    console.log(`Valore di test aggiornato a: ${test}`);

    if (fake) {
        // Usa la posizione simulata per test
        console.log(`Invocazione di arjs.fakeGps con Lat: ${fake.lat}, Lon: ${fake.lon}`);
        arjs.fakeGps(fake.lon, fake.lat);
        cam.update();
    } else {
        console.log("Nessuna posizione fake definita.");
    }

    console.log("Fine aggiornamento posizione fake\n");
}
