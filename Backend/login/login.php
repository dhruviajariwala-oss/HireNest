<?php

session_start();

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

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";
$usertype = $_POST["usertype"] ?? "";


/* =========================
   VALIDATION
========================= */

if (empty($email) || empty($password) || empty($usertype)) {
    echo json_encode([
        "success" => false,
        "message" => "Email, password and user type are required."
    ]);
    exit;
}


/* =========================
   VALID USER TYPES
========================= */

if ($usertype !== "Job Seeker" && $usertype !== "Employer") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user type."
    ]);
    exit;
}


/* =========================
   FIND USER
========================= */

$query = "SELECT * FROM login WHERE email = ? LIMIT 1";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Login query failed.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "s", $email);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);


/* =========================
   USER NOT FOUND
========================= */

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit;
}

$user = mysqli_fetch_assoc($result);


/* =========================
   PASSWORD CHECK
========================= */

if (!password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit;
}


/* =========================
   ACCOUNT STATUS
========================= */

if (isset($user["status"]) && $user["status"] == 0) {
    echo json_encode([
        "success" => false,
        "message" => "Your account is inactive."
    ]);
    exit;
}


/* =========================
   ROLE CHECK
========================= */

if ($user["usertype"] !== $usertype) {

    echo json_encode([
        "success" => false,
        "message" => "This account is registered as " .
                     $user["usertype"] .
                     ". Please use the correct login."
    ]);

    exit;
}


/* =========================
   LOGIN SUCCESS
========================= */

$_SESSION["log_id"] = $user["log_id"];
$_SESSION["email"] = $user["email"];
$_SESSION["usertype"] = $user["usertype"];


/* =========================
   RESPONSE
========================= */

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "log_id" => $user["log_id"],
        "email" => $user["email"],
        "usertype" => $user["usertype"]
    ]
]);

exit;

?>