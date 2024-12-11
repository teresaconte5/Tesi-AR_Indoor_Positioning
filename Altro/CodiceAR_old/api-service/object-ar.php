<?php

require 'api.php';

// Imposta l'intestazione per indicare che la risposta è in formato JSON
header('Content-Type: application/json');

$object_AR = $get_object_AR();

// Restituisci i dati in formato JSON
echo json_encode($object_AR);
