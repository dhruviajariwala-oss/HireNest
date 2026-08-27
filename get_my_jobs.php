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


$log_id =
    $_POST["log_id"] ?? "";


if (empty($log_id)) {

    echo json_encode([
        "success" => false,
        "message" => "Login ID is required."
    ]);

    exit;
}


/* =========================
   VERIFY EMPLOYER
========================= */

$userQuery = "
    SELECT log_id, usertype
    FROM login
    WHERE log_id = ?
    LIMIT 1
";

$userStmt =
    mysqli_prepare(
        $conn,
        $userQuery
    );


if (!$userStmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify account."
    ]);

    exit;
}


mysqli_stmt_bind_param(
    $userStmt,
    "i",
    $log_id
);


mysqli_stmt_execute(
    $userStmt
);


$userResult =
    mysqli_stmt_get_result(
        $userStmt
    );


if (mysqli_num_rows($userResult) === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid user account."
    ]);

    exit;
}


$user =
    mysqli_fetch_assoc(
        $userResult
    );


if ($user["usertype"] !== "Employer") {

    echo json_encode([
        "success" => false,
        "message" => "Only Employers can access this page."
    ]);

    exit;
}


/* =========================
   GET EMPLOYER ID
========================= */

$employerQuery = "
    SELECT eid
    FROM employer
    WHERE log_id = ?
    LIMIT 1
";


$employerStmt =
    mysqli_prepare(
        $conn,
        $employerQuery
    );


if (!$employerStmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to find employer."
    ]);

    exit;
}


mysqli_stmt_bind_param(
    $employerStmt,
    "i",
    $log_id
);


mysqli_stmt_execute(
    $employerStmt
);


$employerResult =
    mysqli_stmt_get_result(
        $employerStmt
    );


if (mysqli_num_rows($employerResult) === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Employer profile not found."
    ]);

    exit;
}


$employer =
    mysqli_fetch_assoc(
        $employerResult
    );


$eid =
    $employer["eid"];


/* =========================
   GET EMPLOYER JOBS
========================= */

$query = "
    SELECT
        jobid,
        eid,
        title,
        jobdesc,
        vacno,
        experience,
        basicpay,
        fnarea,
        location,
        industry,
        ugqual,
        pgqual,
        profile,
        postdate
    FROM jobs
    WHERE eid = ?
    ORDER BY jobid DESC
";


$stmt =
    mysqli_prepare(
        $conn,
        $query
    );


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to load jobs."
    ]);

    exit;
}


mysqli_stmt_bind_param(
    $stmt,
    "i",
    $eid
);


mysqli_stmt_execute(
    $stmt
);


$result =
    mysqli_stmt_get_result(
        $stmt
    );


$jobs = [];


while (
    $row =
    mysqli_fetch_assoc($result)
) {

    $jobs[] = $row;

}


/* =========================
   RESPONSE
========================= */

echo json_encode([
    "success" => true,
    "jobs" => $jobs,
    "count" => count($jobs)
]);

?>