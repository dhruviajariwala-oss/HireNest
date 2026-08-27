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

$log_id = $_POST["log_id"] ?? "";
$usertype = $_POST["usertype"] ?? "";
$name = $_POST["name"] ?? "";
$phone = $_POST["phone"] ?? "";

if (empty($log_id) || empty($usertype) || empty($name)) {
    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing."
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

$user = mysqli_fetch_assoc($checkResult);

$actualUserType = $user["usertype"];


/* Role Validation */

if ($usertype === "Job Seeker" && $actualUserType !== "Job Seeker") {
    echo json_encode([
        "success" => false,
        "message" => "Only Job Seekers can create a Job Seeker profile."
    ]);
    exit;
}

if ($usertype === "Employer" && $actualUserType !== "Employer") {
    echo json_encode([
        "success" => false,
        "message" => "Only Employers can create an Employer profile."
    ]);
    exit;
}

if ($usertype !== "Job Seeker" && $usertype !== "Employer") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user type."
    ]);
    exit;
}


/* JOB SEEKER */

if ($actualUserType === "Job Seeker") {

    $location = $_POST["location"] ?? "";
    $experience = $_POST["experience"] ?? "";
    $skills = $_POST["skills"] ?? "";
    $basic_edu = $_POST["basic_edu"] ?? "";

    $query = "INSERT INTO jobseeker
              (log_id, name, phone, location, experience, skills, basic_edu)
              VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $query);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to create Job Seeker profile."
        ]);
        exit;
    }

    mysqli_stmt_bind_param(
        $stmt,
        "issssss",
        $log_id,
        $name,
        $phone,
        $location,
        $experience,
        $skills,
        $basic_edu
    );

    $successMessage = "Job Seeker profile created successfully.";


/* EMPLOYER */

} else {

    $etype = $_POST["etype"] ?? "";
    $industry = $_POST["industry"] ?? "";
    $address = $_POST["address"] ?? "";
    $pincode = $_POST["pincode"] ?? "";
    $executive = $_POST["executive"] ?? "";
    $location = $_POST["location"] ?? "";
    $profile = $_POST["profile"] ?? "";

    $query = "INSERT INTO employer
              (log_id, ename, etype, industry, address, pincode,
               executive, phone, location, profile)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $query);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Unable to create Employer profile."
        ]);
        exit;
    }

    mysqli_stmt_bind_param(
        $stmt,
        "isssssssss",
        $log_id,
        $name,
        $etype,
        $industry,
        $address,
        $pincode,
        $executive,
        $phone,
        $location,
        $profile
    );

    $successMessage = "Employer profile created successfully.";
}


/* Create Profile */

if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" => $successMessage
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Profile creation failed."
    ]);
}

?>