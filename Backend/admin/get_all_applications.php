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

$query = "SELECT
            a.apply_id,
            a.user_id,
            a.emp_id,
            a.job_id,
            a.status,
            a.date_applied,
            a.resume,

            j.title,
            j.location,
            j.basicpay,

            js.name,
            js.phone,
            js.location AS seeker_location,
            js.experience,
            js.skills,

            e.ename AS company_name

          FROM application a

          INNER JOIN jobs j
              ON a.job_id = j.jobid

          INNER JOIN jobseeker js
              ON a.user_id = js.user_id

          INNER JOIN employer e
              ON a.emp_id = e.eid

          ORDER BY a.apply_id DESC";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve applications.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$applications = [];

while ($row = mysqli_fetch_assoc($result)) {
    $applications[] = $row;
}

echo json_encode([
    "success" => true,
    "count" => count($applications),
    "applications" => $applications
]);

?>