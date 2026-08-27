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

$eid = $_POST["eid"] ?? "";
$ename = $_POST["ename"] ?? "";
$etype = $_POST["etype"] ?? "";
$industry = $_POST["industry"] ?? "";
$address = $_POST["address"] ?? "";
$pincode = $_POST["pincode"] ?? "";
$executive = $_POST["executive"] ?? "";
$phone = $_POST["phone"] ?? "";
$location = $_POST["location"] ?? "";
$profile = $_POST["profile"] ?? "";


/* -----------------------------------
   Basic Validation
----------------------------------- */

if (empty($eid)) {
    echo json_encode([
        "success" => false,
        "message" => "Employer ID is required."
    ]);
    exit;
}


/* -----------------------------------
   Check Employer
----------------------------------- */

$checkQuery = "SELECT e.eid, l.usertype
               FROM employer e
               INNER JOIN login l ON e.log_id = l.log_id
               WHERE e.eid = ?";

$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify employer.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "i", $eid);

mysqli_stmt_execute($checkStmt);

$checkResult = mysqli_stmt_get_result($checkStmt);


/* -----------------------------------
   Employer Not Found
----------------------------------- */

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Employer profile not found."
    ]);
    exit;
}

$employer = mysqli_fetch_assoc($checkResult);


/* -----------------------------------
   Check User Type
----------------------------------- */

if (strtolower($employer["usertype"]) !== "employer") {
    echo json_encode([
        "success" => false,
        "message" => "Only Employers can update an employer profile."
    ]);
    exit;
}


/* -----------------------------------
   Update Employer Profile
----------------------------------- */

$query = "UPDATE employer SET
          ename = ?,
          etype = ?,
          industry = ?,
          address = ?,
          pincode = ?,
          executive = ?,
          phone = ?,
          location = ?,
          profile = ?
          WHERE eid = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare profile update.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    "sssssssssi",
    $ename,
    $etype,
    $industry,
    $address,
    $pincode,
    $executive,
    $phone,
    $location,
    $profile,
    $eid
);


/* -----------------------------------
   Execute Update
----------------------------------- */

if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" => "Employer profile updated successfully.",
        "eid" => $eid
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update employer profile.",
        "error" => mysqli_stmt_error($stmt)
    ]);
}

?>