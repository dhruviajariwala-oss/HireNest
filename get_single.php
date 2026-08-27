<?php

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Only GET method allowed."
    ]);
    exit;
}

if (!isset($_GET["jobid"]) || empty($_GET["jobid"])) {
    echo json_encode([
        "success" => false,
        "message" => "Job ID is required."
    ]);
    exit;
}

$jobid = intval($_GET["jobid"]);

$query = "SELECT * FROM jobs WHERE jobid = $jobid";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch job."
    ]);
    exit;
}

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Job not found."
    ]);
    exit;
}

$job = mysqli_fetch_assoc($result);

echo json_encode([
    "success" => true,
    "job" => $job
]);

?>