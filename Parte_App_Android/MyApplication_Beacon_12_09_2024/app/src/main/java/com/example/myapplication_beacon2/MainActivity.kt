package com.example.myapplication_beacon2

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.MenuItem
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ListView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat.startActivity
import androidx.lifecycle.Observer
import com.example.myapplication_beacon2.permission.BeaconScanPermissionsActivity
import org.altbeacon.beacon.Beacon
import org.altbeacon.beacon.BeaconManager

class MainActivity : AppCompatActivity() {
    lateinit var beaconListView: ListView
    lateinit var beaconCountTextView: TextView
    lateinit var monitoringButton: Button
    lateinit var beaconReferenceApplication: BeaconReferenceApplication
    var alertDialog: AlertDialog? = null
    lateinit var tbCounter: TextView
    private var isMonitoring = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Inizializza la variabile beaconReferenceApplication con l'istanza dell'applicazione
        beaconReferenceApplication = application as BeaconReferenceApplication

        // Ottieni il ViewModel della regione dal BeaconManager
        val regionViewModel = BeaconManager.getInstanceForApplication(this).getRegionViewModel(beaconReferenceApplication.region)
        regionViewModel.rangedBeacons.observe(this, rangingObserver)

        // Inizializza i vari elementi dell'interfaccia utente
        monitoringButton = findViewById(R.id.monitoringButton)
        beaconListView = findViewById(R.id.beaconList)
        beaconCountTextView = findViewById(R.id.beaconCount)
        tbCounter = findViewById(R.id.tbCounter)

        // Imposta il testo iniziale del conteggio dei beacon
        beaconCountTextView.text = "Nessun beacons rilevato"
        beaconListView.adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, arrayOf("--"))

        // Imposta il listener per il pulsante di monitoraggio
        monitoringButton.setOnClickListener { monitoringButtonTapped() }
    }

    override fun onPause() {
        Log.d(TAG, "onPause")
        super.onPause()
    }

    override fun onResume() {
        Log.d(TAG, "onResume")
        super.onResume()
        if (!BeaconScanPermissionsActivity.allPermissionsGranted(this, true)) {
            val intent = Intent(this, BeaconScanPermissionsActivity::class.java)
            intent.putExtra("backgroundAccessRequested", true)
            startActivity(intent)
        } else {
            if (BeaconManager.getInstanceForApplication(this).monitoredRegions.size == 0) {
                (application as BeaconReferenceApplication).setupBeaconScanning()
            }
        }
    }

    // Osservatore per i beacon rilevati
    val rangingObserver = Observer<Collection<Beacon>> { beacons ->
        Log.d(TAG, "Ranged: ${beacons.count()} beacons")
        if (BeaconManager.getInstanceForApplication(this).rangedRegions.size > 0) {
            beaconCountTextView.text = "Ranging abilitato: ${beacons.count()} beacon(s) rilevati"
            beaconListView.adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, beacons
                .sortedBy { it.distance }
                .map { "${it.id1}\nid2: ${it.id2} id3: ${it.id3}\nrssi: ${it.rssi}" }.toTypedArray())
        }
    }

    // Metodo chiamato quando il pulsante di monitoraggio viene premuto
    private fun monitoringButtonTapped() {
        val beaconManager = BeaconManager.getInstanceForApplication(this)
        var dialogTitle: String
        var dialogMessage: String

        if (!isMonitoring) {
            // Inizia il monitoraggio e il ranging dei beacon
            beaconManager.startMonitoring(beaconReferenceApplication.region)
            beaconManager.startRangingBeacons(beaconReferenceApplication.region)

            dialogTitle = "Monitoraggio/Ranging Beacon iniziata."
            dialogMessage = "Verrà visualizzata una finestra di dialogo se viene rilevato un beacon e un'altra se i beacon non vengono più rilevati."
            monitoringButton.text = "Stop Monitoring"
            isMonitoring = true

            // Incrementa stepCount solo quando si inizia il monitoraggio
            beaconReferenceApplication.incrementStepCount()
            tbCounter.text = beaconReferenceApplication.stepCount.toString()

            // Imposta un handler per fermare il monitoraggio dopo 20 secondi
            Handler(Looper.getMainLooper()).postDelayed({
                beaconManager.stopMonitoring(beaconReferenceApplication.region)
                beaconManager.stopRangingBeacons(beaconReferenceApplication.region)

                dialogTitle = "Beacon monitoring/ranging stopped."
                dialogMessage = "Non vedrai più le finestre di dialogo quando i beacon iniziano/interrompono il rilevamento."
                monitoringButton.text = "Start Monitoring"
                isMonitoring = false
                beaconReferenceApplication.isMonitoringActive = false // Imposta il monitoraggio inattivo
            }, 10000) // 10000 millisecondi = 10 secondi
        } else {
            // Ferma il monitoraggio e il ranging dei beacon
            beaconManager.stopMonitoring(beaconReferenceApplication.region)
            beaconManager.stopRangingBeacons(beaconReferenceApplication.region)

            dialogTitle = "Beacon monitoring/ranging stopped."
            dialogMessage = "Non vedrai più le finestre di dialogo quando i beacon iniziano/interrompono il rilevamento."
            monitoringButton.text = "Start Monitoring"
            isMonitoring = false
            beaconReferenceApplication.isMonitoringActive = false // Imposta il monitoraggio inattivo
        }

        // Mostra una finestra di dialogo con il messaggio appropriato
        val builder = AlertDialog.Builder(this)
        builder.setTitle(dialogTitle)
        builder.setMessage(dialogMessage)
        builder.setPositiveButton(android.R.string.ok, null)
        alertDialog?.dismiss()
        alertDialog = builder.create()
        alertDialog?.show()
    }

    companion object {
        val TAG = "MainActivity"
        val PERMISSION_REQUEST_BACKGROUND_LOCATION = 0
        val PERMISSION_REQUEST_BLUETOOTH_SCAN = 1
        val PERMISSION_REQUEST_BLUETOOTH_CONNECT = 2
        val PERMISSION_REQUEST_FINE_LOCATION = 3
    }
}

/*   override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == R.id.record_button) {
            mRecordingViewModel.toggleIsRecording()

            return true
        } else if (item.itemId == R.id.settings_button) {
            // Open settings activity
            val intent = Intent(
                this,
                //SettingsActivity::class.java
            )
            startActivity(intent)

            return true
        }

        return super.onOptionsItemSelected(item)
    }*/


