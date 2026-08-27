<?php

require_once "../config/database.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    echo json_encode([
        "success" => false,
        "message" => "Only GET method allowed."
    ]);

    exit;
}


/* =========================
   GET JOBS WITH COMPANY
========================= */

$query = "
    SELECT
        j.*,
        e.ename AS company_name
    FROM jobs j
    LEFT JOIN employer e
        ON j.eid = e.eid
    ORDER BY j.jobid DESC
";


$result =
    mysqli_query(
        $conn,
        $query
    );


if (!$result) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch jobs.",
        "error" => mysqli_error($conn)
    ]);

    exit;
}


$jobs = [];


while (
    $row =
    mysqli_fetch_assoc($result)
) {

    $jobs[] = $row;
}


echo json_encode([
    "success" => true,
    "count" => count($jobs),
    "jobs" => $jobs
]);

?>