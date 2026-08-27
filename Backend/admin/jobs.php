<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Only GET method is allowed."
    ]);
    exit;
}

$query = "SELECT
            j.jobid,
            j.eid,
            j.title,
            j.job_type,
            j.jobdesc,
            j.vacno,
            j.experience,
            j.basicpay,
            j.fnarea,
            j.location,
            j.industry,
            j.ugqual,
            j.pgqual,
            j.profile,
            j.postdate,
            j.status,
            e.ename AS company_name,
            e.ename AS posted_by
          FROM jobs j
          INNER JOIN employer e ON j.eid = e.eid
          ORDER BY j.jobid DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve jobs.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

$jobs = [];

while ($row = mysqli_fetch_assoc($result)) {
    $jobs[] = $row;
}

echo json_encode([
    "success" => true,
    "message" => "Jobs retrieved successfully.",
    "jobs" => $jobs
]);

?>