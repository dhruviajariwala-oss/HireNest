<?php

require_once "../config/database.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method allowed."
    ]);
    exit;
}

$log_id = $_POST["user_id"] ?? "";
$job_id = $_POST["job_id"] ?? "";
$resume = $_FILES["resume"] ?? null;

if (empty($log_id) || empty($job_id)) {
    echo json_encode([
        "success" => false,
        "message" => "User ID and Job ID are required."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| STEP 1: Resume validation
|--------------------------------------------------------------------------
*/

if (!$resume) {
    echo json_encode([
        "success" => false,
        "message" => "Resume is required."
    ]);
    exit;
}

if ($resume["error"] !== UPLOAD_ERR_OK) {
    echo json_encode([
        "success" => false,
        "message" => "Resume upload failed."
    ]);
    exit;
}

$fileExtension = strtolower(
    pathinfo($resume["name"], PATHINFO_EXTENSION)
);

if ($fileExtension !== "pdf") {
    echo json_encode([
        "success" => false,
        "message" => "Only PDF resume is allowed."
    ]);
    exit;
}

if ($resume["size"] > 5 * 1024 * 1024) {
    echo json_encode([
        "success" => false,
        "message" => "Resume size must be less than 5 MB."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| STEP 2: Get Job Seeker user_id from login log_id
|--------------------------------------------------------------------------
*/

$userQuery = "SELECT user_id
              FROM jobseeker
              WHERE log_id = ?
              LIMIT 1";

$userStmt = mysqli_prepare($conn, $userQuery);

if (!$userStmt) {
    echo json_encode([
        "success" => false,
        "message" => "User query failed.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($userStmt, "i", $log_id);
mysqli_stmt_execute($userStmt);

$userResult = mysqli_stmt_get_result($userStmt);

if (mysqli_num_rows($userResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Job Seeker profile not found for this login."
    ]);
    exit;
}

$user = mysqli_fetch_assoc($userResult);

$user_id = $user["user_id"];


/*
|--------------------------------------------------------------------------
| STEP 3: Get Employer ID from Job
|--------------------------------------------------------------------------
*/

$jobQuery = "SELECT eid
             FROM jobs
             WHERE jobid = ?
             LIMIT 1";

$jobStmt = mysqli_prepare($conn, $jobQuery);

if (!$jobStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Job query failed.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($jobStmt, "i", $job_id);
mysqli_stmt_execute($jobStmt);

$jobResult = mysqli_stmt_get_result($jobStmt);

if (mysqli_num_rows($jobResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Job not found."
    ]);
    exit;
}

$job = mysqli_fetch_assoc($jobResult);

$emp_id = $job["eid"];


/*
|--------------------------------------------------------------------------
| STEP 4: Check Already Applied
|--------------------------------------------------------------------------
*/

$checkQuery = "SELECT apply_id
               FROM application
               WHERE user_id = ?
               AND job_id = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Application check failed.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param(
    $checkStmt,
    "ii",
    $user_id,
    $job_id
);

mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) > 0) {
    echo json_encode([
        "success" => false,
        "message" => "You have already applied for this job."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| STEP 5: Create Resume Upload Folder
|--------------------------------------------------------------------------
*/

$uploadDirectory = "../../uploads/resumes/";

if (!is_dir($uploadDirectory)) {
    if (!mkdir($uploadDirectory, 0777, true)) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to create resume upload folder."
        ]);
        exit;
    }
}


/*
|--------------------------------------------------------------------------
| STEP 6: Generate Unique Resume File Name
|--------------------------------------------------------------------------
*/

$fileName = "resume_" . $user_id . "_" . $job_id . "_" . time() . ".pdf";

$filePath = $uploadDirectory . $fileName;


/*
|--------------------------------------------------------------------------
| STEP 7: Move Uploaded Resume
|--------------------------------------------------------------------------
*/

if (!move_uploaded_file($resume["tmp_name"], $filePath)) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save resume."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| STEP 8: Save Application
|--------------------------------------------------------------------------
*/

$status = 0;
$date_applied = date("Y-m-d");

$resumePath = "uploads/resumes/" . $fileName;

$query = "INSERT INTO application
          (user_id, emp_id, job_id, status, date_applied, resume)
          VALUES (?, ?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {

    // Delete uploaded file if database query fails
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    echo json_encode([
        "success" => false,
        "message" => "Application query failed.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    "iiiiss",
    $user_id,
    $emp_id,
    $job_id,
    $status,
    $date_applied,
    $resumePath
);


if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" => "Job application submitted successfully.",
        "apply_id" => mysqli_insert_id($conn),
        "resume" => $resumePath
    ]);

} else {

    // Delete uploaded file if insert fails
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    echo json_encode([
        "success" => false,
        "message" => "Failed to apply for job.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

?>