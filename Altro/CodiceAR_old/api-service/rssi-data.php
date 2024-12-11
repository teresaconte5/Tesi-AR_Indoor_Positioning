<?php

require 'api.php';

// Imposta l'intestazione per indicare che la risposta è in formato JSON
header('Content-Type: application/json');

$rssi_data = $get_rssi_data();

// Restituisci i dati in formato JSON
echo json_encode($rssi_data);
