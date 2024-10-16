package com.example.myapplication_beacon2

import android.app.Application
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.TaskStackBuilder
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.lifecycle.Observer
import com.example.myapplication_beacon2.Mqtt.MqttHandler
import org.altbeacon.beacon.Beacon
import org.altbeacon.beacon.BeaconManager
import org.altbeacon.beacon.BeaconParser
import org.altbeacon.beacon.MonitorNotifier
import org.altbeacon.beacon.Region
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDateTime

class BeaconReferenceApplication : Application() {
    var region = Region("all-beacons", null, null, null)
    private var mqttHandler = MqttHandler("messaggio")
    var stepCount = 0
    private val beaconDataList = mutableListOf<JSONObject>()
    var isMonitoringActive = false

    override fun onCreate() {
        super.onCreate()

        // Inizializza il gestore MQTT
        mqttHandler.setMqttCallBackAndConnect()

        // Inizializza il BeaconManager e imposta il parser per i beacon
        val beaconManager = BeaconManager.getInstanceForApplication(this)
        BeaconManager.setDebug(true)
        beaconManager.beaconParsers.clear()
        val layout1 = "m:0-1=0501,i:2-17,i:20-21,i:22-23,d:25-25"
        val parser = BeaconParser().setBeaconLayout(layout1)
        parser.setHardwareAssistManufacturerCodes(intArrayOf(0x0105))
        beaconManager.beaconParsers.add(parser)

        // Configura la scansione dei beacon
        setupBeaconScanning()
    }

    // Impostazione della scansione dei beacon
    fun setupBeaconScanning() {
        val beaconManager = BeaconManager.getInstanceForApplication(this)

        try {
            setupForegroundService()
        } catch (e: SecurityException) {
            Log.d(TAG, "Non avviare la scansione del servizio in primo piano finché l'utente non concede il permesso di accesso alla posizione")
            return
        }

        // Imposta l'intervallo tra le scansioni a 0 per eseguire la scansione continuamente
        beaconManager.backgroundBetweenScanPeriod = 0L

        // Avvia il monitoraggio e il ranging dei beacon
        beaconManager.startMonitoring(region)
        beaconManager.startRangingBeacons(region)

        // Ottieni il ViewModel della regione
        val regionViewModel = BeaconManager.getInstanceForApplication(this).getRegionViewModel(region)

        // Osserva lo stato del monitoraggio della regione
        regionViewModel.regionState.observeForever(centralMonitoringObserver)

        // Osserva i beacon rilevati
        regionViewModel.rangedBeacons.observeForever(centralRangingObserver)

        isMonitoringActive = true
    }

    // Inizializza il servizio in primo piano per la scansione dei beacon
    private fun setupForegroundService() {
        val builder = Notification.Builder(this, "BeaconReferenceApplication")
        builder.setSmallIcon(R.drawable.ic_launcher_background)
        builder.setContentTitle("Scanning for Beacons")
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        builder.setContentIntent(pendingIntent)
        val channel = NotificationChannel("beacon-ref-notification-id", "My Notification Name", NotificationManager.IMPORTANCE_DEFAULT)
        channel.description = "My Notification Channel Description"
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
        builder.setChannelId(channel.id)
        BeaconManager.getInstanceForApplication(this).enableForegroundServiceScanning(builder.build(), 456)
    }

    // Osservatore per il monitoraggio della regione
    private val centralMonitoringObserver = Observer<Int> { state ->
        if (state == MonitorNotifier.INSIDE) {
            Log.d(TAG, "Rilevato un beacon per la prima volta")
            showNotification("Beacon detected", "A beacon is nearby.")
        } else {
            Log.d(TAG, "Nessun beacon rilevato")
            showNotification("No beacons detected", "No beacons are nearby.")
        }
    }

    // Osservatore per il rilevamento dei beacon
    private val centralRangingObserver = Observer<Collection<Beacon>> { beacons ->
        val rangeAgeMillis = System.currentTimeMillis() - (beacons.firstOrNull()?.lastCycleDetectionTimestamp ?: 0)
        if (rangeAgeMillis < 100000) {
            for (beacon: Beacon in beacons) {
                val macAddress = beacon.bluetoothAddress
                val rssi = beacon.rssi
                val timestamp = LocalDateTime.now().toString()
                val beaconData = JSONObject()

                // Usa il valore corrente di stepCount
                beaconData.put("Posizione", stepCount)
                beaconData.put("timestamp", timestamp)
                beaconData.put("macAddress", macAddress)
                beaconData.put("RSSI", rssi)

                synchronized(beaconDataList) {
                    beaconDataList.add(beaconData)
                }

                sendBatchData()
                isMonitoringActive = false
            }
        } else {
            Log.d(MainActivity.TAG, "Ignora beacon obsoleti di un range di tempo $rangeAgeMillis millisecondi fa")
        }
    }

    // Metodo per incrementare stepCount
    fun incrementStepCount() {
        stepCount++
    }

    // Metodo per inviare i dati dei beacon a batch
    private fun sendBatchData() {
        if (beaconDataList.isNotEmpty()) {
            val batchData = JSONArray(beaconDataList)
            mqttHandler.publish("beaconData", batchData.toString())
            beaconDataList.clear()
        }
    }

    private fun showNotification(title: String, message: String) {
        val builder = NotificationCompat.Builder(this, "beacon-ref-notification-id")
            .setSmallIcon(R.drawable.ic_launcher_background)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
        val stackBuilder = TaskStackBuilder.create(this)
        stackBuilder.addNextIntent(Intent(this, MainActivity::class.java))
        val resultPendingIntent = stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        builder.setContentIntent(resultPendingIntent)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(1, builder.build())
    }

    companion object {
        val TAG = "BeaconReferenceApplication"
    }
}
