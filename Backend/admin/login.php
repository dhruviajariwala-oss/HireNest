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

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit;
}

$query = "SELECT log_id, email, password, usertype, status
          FROM login
          WHERE email = ? AND usertype = 'Admin'";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to process admin login.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid admin email or password."
    ]);
    exit;
}

$admin = mysqli_fetch_assoc($result);

if ($admin["status"] != 1) {
    echo json_encode([
        "success" => false,
        "message" => "Admin account is inactive."
    ]);
    exit;
}

if ($password !== $admin["password"]) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid admin email or password."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Admin login successful.",
    "admin" => [
        "log_id" => $admin["log_id"],
        "email" => $admin["email"],
        "usertype" => $admin["usertype"]
    ]
]);

?>