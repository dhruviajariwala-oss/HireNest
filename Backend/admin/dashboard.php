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

$jobseekerQuery = "SELECT COUNT(*) AS total FROM jobseeker";
$employerQuery = "SELECT COUNT(*) AS total FROM employer";
$jobsQuery = "SELECT COUNT(*) AS total FROM jobs";
$applicationQuery = "SELECT COUNT(*) AS total FROM application";

$jobseekerResult = mysqli_query($conn, $jobseekerQuery);
$employerResult = mysqli_query($conn, $employerQuery);
$jobsResult = mysqli_query($conn, $jobsQuery);
$applicationResult = mysqli_query($conn, $applicationQuery);

if (!$jobseekerResult || !$employerResult || !$jobsResult || !$applicationResult) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve dashboard data.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

$jobseekers = mysqli_fetch_assoc($jobseekerResult);
$employers = mysqli_fetch_assoc($employerResult);
$jobs = mysqli_fetch_assoc($jobsResult);
$applications = mysqli_fetch_assoc($applicationResult);

echo json_encode([
    "success" => true,
    "message" => "Admin dashboard data retrieved successfully.",
    "dashboard" => [
        "total_jobseekers" => (int)$jobseekers["total"],
        "total_employers" => (int)$employers["total"],
        "total_jobs" => (int)$jobs["total"],
        "total_applications" => (int)$applications["total"]
    ]
]);

?>
