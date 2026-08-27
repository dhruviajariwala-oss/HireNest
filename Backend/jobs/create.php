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


/* -----------------------------------
   GET LOGIN ID
----------------------------------- */

$log_id = $_POST["log_id"] ?? "";
$title = trim($_POST["title"] ?? "");
$job_type = trim($_POST["job_type"] ?? "");
$jobdesc = trim($_POST["jobdesc"] ?? "");
$vacno = $_POST["vacno"] ?? "";
$experience = trim($_POST["experience"] ?? "");
$basicpay = trim($_POST["basicpay"] ?? "");
$fnarea = trim($_POST["fnarea"] ?? "");
$location = trim($_POST["location"] ?? "");
$industry = trim($_POST["industry"] ?? "");
$ugqual = trim($_POST["ugqual"] ?? "");
$pgqual = trim($_POST["pgqual"] ?? "");
$profile = trim($_POST["profile"] ?? "");


/* -----------------------------------
   BASIC VALIDATION
----------------------------------- */

if (
    empty($log_id) ||
    empty($title) ||
    empty($job_type) ||
    empty($jobdesc) ||
    empty($vacno) ||
    empty($location)
) {

    echo json_encode([
        "success" => false,
        "message" => "Required fields are missing."
    ]);

    exit;
}


/* -----------------------------------
   VERIFY EMPLOYER LOGIN
----------------------------------- */

$userQuery = "
    SELECT log_id, usertype
    FROM login
    WHERE log_id = ?
    LIMIT 1
";

$userStmt = mysqli_prepare($conn, $userQuery);

if (!$userStmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify user account."
    ]);

    exit;
}

mysqli_stmt_bind_param(
    $userStmt,
    "i",
    $log_id
);

mysqli_stmt_execute($userStmt);

$userResult =
    mysqli_stmt_get_result($userStmt);


if (mysqli_num_rows($userResult) === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid user account."
    ]);

    exit;
}

$user =
    mysqli_fetch_assoc($userResult);


/* -----------------------------------
   CHECK USER TYPE
----------------------------------- */

if ($user["usertype"] !== "Employer") {

    echo json_encode([
        "success" => false,
        "message" => "Only Employers can post jobs."
    ]);

    exit;
}


/* -----------------------------------
   GET EMPLOYER ID
----------------------------------- */

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
        "message" => "Unable to find employer profile."
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


/* -----------------------------------
   EMPLOYER PROFILE NOT FOUND
----------------------------------- */

if (mysqli_num_rows($employerResult) === 0) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Employer profile not found. Please create your employer profile first."
    ]);

    exit;
}

$employer =
    mysqli_fetch_assoc(
        $employerResult
    );

$eid =
    $employer["eid"];


/* -----------------------------------
   CREATE JOB
----------------------------------- */

$postdate =
    date("Y-m-d");

$query = "
    INSERT INTO jobs
    (
        eid,
        title,
        job_type,
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
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";
$stmt =
    mysqli_prepare(
        $conn,
        $query
    );

if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Unable to prepare job creation request."
    ]);

    exit;
}


/* -----------------------------------
   BIND VALUES
----------------------------------- */

mysqli_stmt_bind_param(
    $stmt,
    "isssssssssssss",
    $eid,
    $title,
    $job_type,
    $jobdesc,
    $vacno,
    $experience,
    $basicpay,
    $fnarea,
    $location,
    $industry,
    $ugqual,
    $pgqual,
    $profile,
    $postdate
);

/* -----------------------------------
   INSERT JOB
----------------------------------- */

if (mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true,
        "message" =>
            "Job posted successfully.",
        "jobid" =>
            mysqli_insert_id($conn)
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to post job.",
        "error" =>
            mysqli_error($conn)
    ]);
}

?>