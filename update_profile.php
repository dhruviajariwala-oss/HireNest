<?php

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method allowed."
    ]);
    exit;
}

$log_id = $_POST["log_id"] ?? "";

if (empty($log_id)) {
    echo json_encode([
        "success" => false,
        "message" => "log_id is required."
    ]);
    exit;
}

$name = $_POST["name"] ?? "";
$phone = $_POST["phone"] ?? "";
$location = $_POST["location"] ?? "";
$experience = $_POST["experience"] ?? "";
$skills = $_POST["skills"] ?? "";
$basic_edu = $_POST["basic_edu"] ?? "";

$query = "UPDATE jobseeker
          SET name = ?,
              phone = ?,
              location = ?,
              experience = ?,
              skills = ?,
              basic_edu = ?
          WHERE log_id = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param(
    $stmt,
    "ssssssi",
    $name,
    $phone,
    $location,
    $experience,
    $skills,
    $basic_edu,
    $log_id
);

if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" => "Job Seeker profile updated successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Profile update failed."
    ]);
}

?>