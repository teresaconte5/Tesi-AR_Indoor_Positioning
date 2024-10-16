var test =0;
var arjs;


export function fake_update(cam, arjs){ //aggingi anche lat e long e fare funzione ps. qui andranno le coordinate raccolte dalle prevision
    var fake;
    console.log("Inizio aggiornamento posizione fake");

    if(test==0){
         fake = { lat: 51.06, lon: -0.72 };
        console.log("Test è 0: imposta fake a lat 51.06, lon -0.72");
    }   
    else{
         fake = { lat: 51.077, lon: -0.72 };
         console.log("Test è 1: imposta fake a lat 51.077, lon -0.72");
    } 
       
    test= (test+1)%2;
    console.log(`Valore di test aggiornato a: ${test}`);

    if (fake) {
        // Usa la posizione simulata per test
        console.log(`Invocazione di arjs.fakeGps con  Lat: ${fake.lat},Lon: ${fake.lon}`);
        arjs.fakeGps(fake.lon, fake.lat);
        cam.update();
    }else{
        console.log("Nessuna posizione fake definita.")
    }

    console.log("Fine aggiornamento posizione fake\n");

}