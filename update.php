<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed."
    ]);
    exit;
}

$jobid = $_POST["jobid"] ?? "";
$title = $_POST["title"] ?? "";
$job_type = $_POST["job_type"] ?? "";
$jobdesc = $_POST["jobdesc"] ?? "";
$vacno = $_POST["vacno"] ?? "";
$experience = $_POST["experience"] ?? "";
$basicpay = $_POST["basicpay"] ?? "";
$fnarea = $_POST["fnarea"] ?? "";
$location = $_POST["location"] ?? "";
$industry = $_POST["industry"] ?? "";
$ugqual = $_POST["ugqual"] ?? "";
$pgqual = $_POST["pgqual"] ?? "";
$profile = $_POST["profile"] ?? "";

if (empty($jobid)) {
    echo json_encode([
        "success" => false,
        "message" => "Job ID is required."
    ]);
    exit;
}

if (empty($job_type)) {
    echo json_encode([
        "success" => false,
        "message" => "Job type is required."
    ]);
    exit;
}

$allowedJobTypes = [
    "Full Time",
    "Part Time",
    "Internship",
    "Remote"
];

if (!in_array($job_type, $allowedJobTypes, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid job type."
    ]);
    exit;
}

$checkQuery = "SELECT 
                    j.jobid,
                    j.eid,
                    l.usertype
               FROM jobs j
               INNER JOIN employer e 
                    ON j.eid = e.eid
               INNER JOIN login l 
                    ON e.log_id = l.log_id
               WHERE j.jobid = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify job."
    ]);
    exit;
}

mysqli_stmt_bind_param(
    $checkStmt,
    "i",
    $jobid
);

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
        "message" => "Only Employers can update jobs."
    ]);
    exit;
}

$query = "UPDATE jobs SET
          title = ?,
          job_type = ?,
          jobdesc = ?,
          vacno = ?,
          experience = ?,
          basicpay = ?,
          fnarea = ?,
          location = ?,
          industry = ?,
          ugqual = ?,
          pgqual = ?,
          profile = ?
          WHERE jobid = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare job update.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    "ssssssssssssi",
    $title,
    $job_type,
    $jobdesc,
    $vacno,
    $experience,
    $basicpay,
    $fnarea,
    $location,
    $industry,
    $ugqual,
    $pgqual,
    $profile,
    $jobid
);

if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" => "Job updated successfully.",
        "jobid" => $jobid,
        "job_type" => $job_type
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update job.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

mysqli_stmt_close($stmt);
mysqli_stmt_close($checkStmt);

?>