<?php

require_once "../config/database.php";

header("Content-Type: application/json");


/* =========================
   CREATE EMPLOYER PROFILE
========================= */

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $log_id = $_POST["log_id"] ?? "";
    $ename = $_POST["ename"] ?? "";
    $etype = $_POST["etype"] ?? "";
    $industry = $_POST["industry"] ?? "";
    $address = $_POST["address"] ?? "";
    $pincode = $_POST["pincode"] ?? "";
    $executive = $_POST["executive"] ?? "";
    $phone = $_POST["phone"] ?? "";
    $location = $_POST["location"] ?? "";
    $profile = $_POST["profile"] ?? "";

    if (empty($log_id) || empty($ename)) {
        echo json_encode([
            "success" => false,
            "message" => "Login ID and company name are required."
        ]);
        exit;
    }

    $checkQuery = "SELECT usertype FROM login WHERE log_id = ?";
    $checkStmt = mysqli_prepare($conn, $checkQuery);

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

    if ($user["usertype"] !== "Employer") {
        echo json_encode([
            "success" => false,
            "message" => "Only Employers can create an Employer profile."
        ]);
        exit;
    }

    $query = "INSERT INTO employer
              (log_id, ename, etype, industry, address, pincode,
               executive, phone, location, profile)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $query);

    mysqli_stmt_bind_param(
        $stmt,
        "isssssssss",
        $log_id,
        $ename,
        $etype,
        $industry,
        $address,
        $pincode,
        $executive,
        $phone,
        $location,
        $profile
    );

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "success" => true,
            "message" => "Employer profile created successfully.",
            "employer_id" => mysqli_insert_id($conn)
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Employer profile creation failed.",
            "error" => mysqli_stmt_error($stmt)
        ]);
    }

    exit;
}


/* =========================
   GET EMPLOYER PROFILE
========================= */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $log_id = $_GET["log_id"] ?? "";

    if (empty($log_id)) {
        echo json_encode([
            "success" => false,
            "message" => "Login ID is required."
        ]);
        exit;
    }

    $checkQuery = "SELECT usertype FROM login WHERE log_id = ?";
    $checkStmt = mysqli_prepare($conn, $checkQuery);

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

    $loginUser = mysqli_fetch_assoc($checkResult);

    if ($loginUser["usertype"] !== "Employer") {
        echo json_encode([
            "success" => false,
            "message" => "Only Employers can access an Employer profile."
        ]);
        exit;
    }

    $query = "SELECT
                e.eid,
                e.log_id,
                e.ename,
                e.etype,
                e.industry,
                e.address,
                e.pincode,
                e.executive,
                e.phone,
                e.location,
                e.profile,
                e.logo,
                l.email,
                l.usertype
              FROM employer e
              INNER JOIN login l ON e.log_id = l.log_id
              WHERE e.log_id = ?";

    $stmt = mysqli_prepare($conn, $query);

    mysqli_stmt_bind_param($stmt, "i", $log_id);
    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Employer profile not found."
        ]);
        exit;
    }

    $employer = mysqli_fetch_assoc($result);

    echo json_encode([
        "success" => true,
        "message" => "Employer profile retrieved successfully.",
        "employer" => $employer
    ]);

    exit;
}


echo json_encode([
    "success" => false,
    "message" => "Only GET and POST methods are allowed."
]);

?>