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

$eid = $_GET["eid"] ?? "";

if (empty($eid)) {
    echo json_encode([
        "success" => false,
        "message" => "Employer ID is required."
    ]);
    exit;
}

$checkQuery = "SELECT eid, log_id FROM employer WHERE eid = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify employer."
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "i", $eid);
mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Employer not found."
    ]);
    exit;
}

$query = "SELECT
            a.apply_id,
            a.user_id,
            a.emp_id,
            a.job_id,
            a.status,
            a.date_applied,
            a.resume,
            j.title,
            js.name,
            js.phone,
            js.location,
            js.experience,
            js.skills
          FROM application a
          INNER JOIN jobs j ON a.job_id = j.jobid
          INNER JOIN jobseeker js ON a.user_id = js.user_id
          WHERE a.emp_id = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve applications.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $eid);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$applications = [];

while ($row = mysqli_fetch_assoc($result)) {
    $applications[] = $row;
}

echo json_encode([
    "success" => true,
    "message" => "Job applications retrieved successfully.",
    "applications" => $applications
]);

?>
