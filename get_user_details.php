<?php

require_once "../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Only GET method is allowed."
    ]);
    exit;
}

$log_id = $_GET["log_id"] ?? "";

if (empty($log_id)) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}

$query = "SELECT
            l.log_id,
            l.email,
            l.usertype,
            l.status,
            CASE
                WHEN LOWER(l.usertype) = 'job seeker' THEN
                    (SELECT j.name FROM jobseeker j
                     WHERE j.log_id = l.log_id
                     LIMIT 1)
                WHEN LOWER(l.usertype) = 'employer' THEN
                    (SELECT e.ename FROM employer e
                     WHERE e.log_id = l.log_id
                     LIMIT 1)
                ELSE NULL
            END AS name
          FROM login l
          WHERE l.log_id = ?
          AND LOWER(l.usertype) IN ('job seeker', 'employer')";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare user details.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $log_id);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);
    exit;
}

$user = mysqli_fetch_assoc($result);

echo json_encode([
    "success" => true,
    "message" => "User details retrieved successfully.",
    "user" => $user
]);

?>