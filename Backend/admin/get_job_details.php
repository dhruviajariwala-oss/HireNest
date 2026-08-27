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

$jobid = $_GET["jobid"] ?? "";

if (empty($jobid)) {
    echo json_encode([
        "success" => false,
        "message" => "Job ID is required."
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
            e.ename AS employer_name
          FROM jobs j
          INNER JOIN employer e ON j.eid = e.eid
          WHERE j.jobid = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare job details.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $jobid);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

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
    "message" => "Job details retrieved successfully.",
    "job" => $job
]);

?>
