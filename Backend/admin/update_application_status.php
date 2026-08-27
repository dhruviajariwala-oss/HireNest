<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "PUT") {
    echo json_encode([
        "success" => false,
        "message" => "Only PUT method is allowed."
    ]);
    exit;
}

$input = file_get_contents("php://input");
parse_str($input, $_PUT);

$apply_id = $_PUT["apply_id"] ?? "";
$status = $_PUT["status"] ?? "";

if (empty($apply_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Application ID is required."
    ]);
    exit;
}

if ($status === "") {
    echo json_encode([
        "success" => false,
        "message" => "Application status is required."
    ]);
    exit;
}

if (!in_array((int)$status, [0, 1, 2], true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid status. Use 0 for Pending, 1 for Accepted, 2 for Rejected."
    ]);
    exit;
}

$checkQuery = "SELECT apply_id
               FROM application
               WHERE apply_id = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify application.",
        "error" => mysqli_error($conn)
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

$query = "UPDATE application
          SET status = ?
          WHERE apply_id = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare application status update.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

$status = (int)$status;

mysqli_stmt_bind_param($stmt, "ii", $status, $apply_id);

if (mysqli_stmt_execute($stmt)) {

    $statusName = "Pending";

    if ($status === 1) {
        $statusName = "Accepted";
    } elseif ($status === 2) {
        $statusName = "Rejected";
    }

    echo json_encode([
        "success" => true,
        "message" => "Application status updated successfully.",
        "apply_id" => $apply_id,
        "status" => $status,
        "status_name" => $statusName
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update application status.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

?>