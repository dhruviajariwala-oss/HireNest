    <?php

    require_once "../config/database.php";

    if ($_SERVER["REQUEST_METHOD"] !== "GET") {
        echo json_encode([
            "success" => false,
            "message" => "Only GET method allowed."
        ]);
        exit;
    }

    $user_id = $_GET["user_id"] ?? "";

    if (empty($user_id)) {
        echo json_encode([
            "success" => false,
            "message" => "User ID is required."
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
                j.title,
                j.jobdesc,
                j.location,
                j.industry,
                j.basicpay
            FROM application a
            INNER JOIN jobs j ON a.job_id = j.jobid
            WHERE a.user_id = ?
            ORDER BY a.apply_id DESC";

    $stmt = mysqli_prepare($conn, $query);

    mysqli_stmt_bind_param($stmt, "i", $user_id);

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