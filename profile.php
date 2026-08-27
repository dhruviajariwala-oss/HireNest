<?php

session_start();

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Only GET method is allowed."
    ]);
    exit;
}

$log_id = $_GET["log_id"] ?? ($_SESSION["log_id"] ?? "");

if (empty($log_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Login ID is required."
    ]);
    exit;
}


/* Check Login ID */

$checkQuery = "SELECT usertype FROM login WHERE log_id = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify user account."
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "i", $log_id);
mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid login ID."
    ]);
    exit;
}

$loginUser = mysqli_fetch_assoc($checkResult);


/* Role Validation */

if ($loginUser["usertype"] !== "Job Seeker") {
    echo json_encode([
        "success" => false,
        "message" => "Only Job Seekers can access a Job Seeker profile."
    ]);
    exit;
}


/* Get Profile */

$query = "SELECT 
            j.user_id,
            j.log_id,
            j.name,
            j.phone,
            j.location,
            j.experience,
            j.skills,
            j.basic_edu,
            j.master_edu,
            j.other_qual,
            j.dob,
            j.Resume,
            j.photo,
            l.email,
            l.usertype
          FROM jobseeker j
          INNER JOIN login l ON j.log_id = l.log_id
          WHERE j.log_id = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve Job Seeker profile."
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $log_id);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Job Seeker profile not found."
    ]);
    exit;
}

$user = mysqli_fetch_assoc($result);

echo json_encode([
    "success" => true,
    "message" => "Job Seeker profile retrieved successfully.",
    "user" => $user
]);

?>