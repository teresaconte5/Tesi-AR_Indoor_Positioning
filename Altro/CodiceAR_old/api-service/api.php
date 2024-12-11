<?php

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/path/to/php-error.log');
error_reporting(E_ALL);

$host = "localhost";
$user = "root";
$password = "rootpassword";
$database = "indoor_positioning_db";


$get_rssi_data = function () use ($host, $user, $password, $database) {

    try {
        // Creazione connessione
        $conn = new mysqli($host, $user, $password, $database);

        if ($conn->connect_error) {

            throw new Exception("Connessione fallita: " . $conn->connect_error);
        }

        $sql_comand = "SELECT position_id,Latitude,Longitude,timestamp FROM rssi_data";

        $rssi_data = [];

        if ($result = $conn->query($sql_comand)) {

            if ($result->num_rows > 0) {

                while ($row = $result->fetch_array()) {

                    $rssi_data[] = [
                        "position_id"=>$row['position_id'],
                        "latitude" => $row['Latitude'],
                        "longitude" => $row['Longitude'],
                        "timestamp" => $row['timestamp']
                    ];
                }
                $result->free();

                
            }
        } else {

            throw new Exception("Recupero dati non possibile: " . $conn->connect_error);
        }

        $conn->close();

        return [
            "result" => 'true',
            "rssi_data" => $rssi_data,
        ];
    } catch (Exception $ex) {

        return [
            "result" => 'false',
            "message" => $ex->getMessage()
        ];
    }
};



$get_object_AR = function () use ($host, $user, $password, $database) {

    try {
        // Creazione connessione
        $conn = new mysqli($host, $user, $password, $database);

        if ($conn->connect_error) {

            throw new Exception("Connessione fallita: " . $conn->connect_error);
        }

        $sql_comand = "SELECT lat, lon, file_path FROM oggettiAR";

        $object_AR = [];

        if ($result = $conn->query($sql_comand)) {

            if ($result->num_rows > 0) {

                while ($row = $result->fetch_array()) {

                    $object_AR[] = [
                        "lat" => $row['lat'],
                        "lon" => $row['lon'],
                        "file_path" => $row['file_path']
                    ];
                }
                $result->free();
            }
        } else {

            throw new Exception("Recupero dati non possibile: " . $conn->connect_error);
        }

        $conn->close();

        return [
            "result" => 'true',
            "object_AR" => $object_AR,
        ];
    } catch (Exception $ex) {

        return [
            "result" => 'false',
            "message" => $ex->getMessage()
        ];
    }
};
