<?php

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
    echo json_encode([
        "success" => false,
        "message" => "Only DELETE method allowed."
    ]);
    exit;
}

$apply_id = $_GET["apply_id"] ?? "";
$user_id = $_GET["user_id"] ?? "";

if (empty($apply_id) || empty($user_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Application ID and User ID are required."
    ]);
    exit;
}

// Check application belongs to this user
$checkQuery = "SELECT apply_id FROM application
               WHERE apply_id = ? AND user_id = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

mysqli_stmt_bind_param(
    $checkStmt,
    "ii",
    $apply_id,
    $user_id
);

mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Application not found or does not belong to this user."
    ]);
    exit;
}

// Delete application
$query = "DELETE FROM application
          WHERE apply_id = ? AND user_id = ?";

$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param(
    $stmt,
    "ii",
    $apply_id,
    $user_id
);

if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" => "Application deleted successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete application.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

?>