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

$log_id = $_DELETE["log_id"] ?? "";

if (empty($log_id)) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}

$checkQuery = "SELECT log_id, usertype
               FROM login
               WHERE log_id = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify user.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "i", $log_id);
mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);
    exit;
}

$user = mysqli_fetch_assoc($checkResult);

if (strtolower($user["usertype"]) === "admin") {
    echo json_encode([
        "success" => false,
        "message" => "Admin account cannot be deleted."
    ]);
    exit;
}

$query = "DELETE FROM login WHERE log_id = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare user deletion.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $log_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "success" => true,
        "message" => "User deleted successfully.",
        "log_id" => $log_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete user.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

?>