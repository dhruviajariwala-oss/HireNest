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
            js.name AS jobseeker_name,
            l.email,
            js.phone,
            j.title AS job_title,
            e.ename AS employer_name
          FROM application a
          INNER JOIN jobseeker js ON a.user_id = js.user_id
          INNER JOIN login l ON js.log_id = l.log_id
          INNER JOIN jobs j ON a.job_id = j.jobid
          INNER JOIN employer e ON a.emp_id = e.eid
          ORDER BY a.apply_id DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve applications.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

$applications = [];

while ($row = mysqli_fetch_assoc($result)) {
    $applications[] = $row;
}

echo json_encode([
    "success" => true,
    "message" => "Applications retrieved successfully.",
    "applications" => $applications
]);

?>
