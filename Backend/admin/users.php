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
            l.log_id,
            l.email,
            l.usertype,
            l.status,
            CASE
                WHEN l.usertype = 'Job Seeker' THEN j.name
                WHEN l.usertype = 'Employer' THEN e.ename
                ELSE NULL
            END AS name
          FROM login l
          LEFT JOIN jobseeker j ON l.log_id = j.log_id
          LEFT JOIN employer e ON l.log_id = e.log_id
          WHERE l.usertype IN ('Job Seeker', 'Employer')
          ORDER BY l.log_id DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve users.",
        "error" => mysqli_error($conn)
    ]);
    exit;
}

$users = [];

while ($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

echo json_encode([
    "success" => true,
    "message" => "Users retrieved successfully.",
    "users" => $users
]);

?>
