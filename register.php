<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method allowed."
    ]);
    exit;
}

$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";
$usertype = $_POST["usertype"] ?? "";

if (empty($email) || empty($password) || empty($usertype)) {
    echo json_encode([
        "success" => false,
        "message" => "Email, password and user type are required."
    ]);
    exit;
}


/* -----------------------------------
   VALID USER TYPE
----------------------------------- */

if ($usertype !== "Job Seeker" && $usertype !== "Employer") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid user type."
    ]);

    exit;
}


/* -----------------------------------
   CHECK EMAIL
----------------------------------- */

$checkQuery = "
    SELECT log_id
    FROM login
    WHERE email = ?
    LIMIT 1
";

$checkStmt = mysqli_prepare(
    $conn,
    $checkQuery
);

if (!$checkStmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to check email."
    ]);

    exit;
}

mysqli_stmt_bind_param(
    $checkStmt,
    "s",
    $email
);

mysqli_stmt_execute($checkStmt);

$checkResult =
    mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Email already registered."
    ]);

    exit;
}


/* -----------------------------------
   HASH PASSWORD
----------------------------------- */

$hashedPassword =
    password_hash(
        $password,
        PASSWORD_DEFAULT
    );


/* -----------------------------------
   CREATE LOGIN ACCOUNT
----------------------------------- */

$query = "
    INSERT INTO login
    (
        email,
        password,
        usertype,
        status
    )
    VALUES (?, ?, ?, 1)
";

$stmt = mysqli_prepare(
    $conn,
    $query
);

if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to create account."
    ]);

    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    "sss",
    $email,
    $hashedPassword,
    $usertype
);


/* -----------------------------------
   INSERT LOGIN
----------------------------------- */

if (!mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => false,
        "message" => "Registration failed."
    ]);

    exit;
}


/* -----------------------------------
   GET NEW LOGIN ID
----------------------------------- */

$log_id = mysqli_insert_id($conn);


/* -----------------------------------
   CREATE BASIC EMPLOYER RECORD
----------------------------------- */

if ($usertype === "Employer") {

    $employerQuery = "
        INSERT INTO employer
        (
            log_id
        )
        VALUES (?)
    ";

    $employerStmt = mysqli_prepare(
        $conn,
        $employerQuery
    );

    if (!$employerStmt) {

        echo json_encode([
            "success" => false,
            "message" => "Employer account created but employer profile could not be initialized."
        ]);

        exit;
    }

    mysqli_stmt_bind_param(
        $employerStmt,
        "i",
        $log_id
    );

    if (!mysqli_stmt_execute($employerStmt)) {

        echo json_encode([
            "success" => false,
            "message" => "Employer account created but employer profile could not be initialized.",
            "error" => mysqli_error($conn)
        ]);

        exit;
    }
}


/* -----------------------------------
   SUCCESS
----------------------------------- */

echo json_encode([
    "success" => true,
    "message" => "Registration successful.",
    "log_id" => $log_id
]);

?>