<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
    echo json_encode([
        "success" => false,
        "message" => "Only DELETE method is allowed."
    ]);
    exit;
}

$input = file_get_contents("php://input");
parse_str($input, $_DELETE);

$jobid = $_DELETE["jobid"] ?? "";

if (empty($jobid)) {
    echo json_encode([
        "success" => false,
        "message" => "Job ID is required."
    ]);
    exit;
}

$checkQuery = "SELECT j.jobid, l.usertype
               FROM jobs j
               INNER JOIN employer e ON j.eid = e.eid
               INNER JOIN login l ON e.log_id = l.log_id
               WHERE j.jobid = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify job.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "i", $jobid);
mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Job not found."
    ]);
    exit;
}

$job = mysqli_fetch_assoc($checkResult);

if (strtolower($job["usertype"]) !== "employer") {
    echo json_encode([
        "success" => false,
        "message" => "Only Employers can delete jobs."
    ]);
    exit;
}

$query = "DELETE FROM jobs WHERE jobid = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare job deletion.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $jobid);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "success" => true,
        "message" => "Job deleted successfully.",
        "jobid" => $jobid
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete job.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

?>