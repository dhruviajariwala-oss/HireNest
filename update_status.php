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

$apply_id = $_POST["apply_id"] ?? "";
$status = $_POST["status"] ?? "";

if (empty($apply_id) || $status === "") {
    echo json_encode([
        "success" => false,
        "message" => "Application ID and status are required."
    ]);
    exit;
}

if (!in_array($status, ["0", "1", "2"])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid status."
    ]);
    exit;
}

$checkQuery = "SELECT apply_id FROM application WHERE apply_id = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify application."
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "i", $apply_id);
mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Application not found."
    ]);
    exit;
}

$query = "UPDATE application SET status = ? WHERE apply_id = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare status update."
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "ii", $status, $apply_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "success" => true,
        "message" => "Application status updated successfully.",
        "apply_id" => $apply_id,
        "status" => $status
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update application status."
    ]);
}

?>