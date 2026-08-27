const API_BASE = "http://localhost/Job_Portal/Backend";

let allJobs = [];

// DYNAMIC NAVBAR

function setupNavbar() {
    const navbar = document.getElementById("mainNavbar");

    const navButtons = document.getElementById("navButtons");

    if (!navbar || !navButtons) return;
    const usertype = localStorage.getItem("usertype");
    const currentPath = window.location.pathname;

// LOGGED-IN JOB SEEKER

    if (usertype === "Job Seeker") {

        let dashboardActive = "";
        let jobsActive = "";
        let applicationsActive = "";
        let profileActive = "";

        if (
            currentPath.includes("/jobseeker/dashboard.html")
        ) {
            dashboardActive = "active";
        }

        if (
            currentPath.includes("/jobseeker/jobs.html") || 
            currentPath.includes("/jobseeker/job-details.html")
        ) {
            jobsActive = "active";
        }

        if (
            currentPath.includes("/jobseeker/my-applications.html")
        ) {
            applicationsActive = "active";
        }

        if (
            currentPath.includes("/jobseeker/profile.html") ||
            currentPath.includes("/jobseeker/edit-profile.html")
        ) {
            profileActive = "active";
        }

        navbar.innerHTML = `
            <a href="dashboard.html"
               class="${dashboardActive}"
            >
                Dashboard
            </a>

            <a href="jobs.html"
               class="${jobsActive}"
            >
                Find Jobs
            </a>

            <a href="my-applications.html"
               class="${applicationsActive}"
            >
                My Applications
            </a>

            <a href="profile.html"
               class="${profileActive}"
            >
                Profile
            </a>
        `;

        navButtons.innerHTML = `
            <button
                type="button"
                class="btn btn-outline logout-btn"
                onclick="jobSeekerLogout()"
            >
                Logout
            </button>
        `;
        return;
    }

// LOGGED-IN EMPLOYER

    if (usertype === "Employer") {

        let dashboardActive = "";
        let jobsActive = "";
        let applicationsActive = "";
        let postActive = "";
        let profileActive = "";

        if (currentPath.includes("/employer/dashboard.html")
        ) {
            dashboardActive = "active";
        }

        if (
            currentPath.includes("/employer/my-jobs.html") ||
            currentPath.includes("/employer/edit-job.html")
        ) {
            jobsActive = "active";
        }

        if (
            currentPath.includes("/employer/applications.html")
        ) {
            applicationsActive = "active";
        }


        if (currentPath.includes("/employer/post-job.html")
        ) {
            postActive = "active";
        }

        if (
            currentPath.includes("/employer/profile.html") ||
            currentPath.includes("/employer/edit-profile.html")
        ) {
            profileActive = "active";
        }

        navbar.innerHTML = `
            <a href="dashboard.html"
               class="${dashboardActive}"
            >
                Dashboard
            </a>

            <a href="my-jobs.html"
               class="${jobsActive}"
            >
                My Jobs
            </a>

            <a href="applications.html"
               class="${applicationsActive}"
            >
                Applications
            </a>

            <a href="post-job.html"
               class="${postActive}"
            >
                Post a Job
            </a>

            <a href="profile.html"
               class="${profileActive}"
            >
                Profile
            </a>
        `;

        navButtons.innerHTML = `
            <button
                type="button"
                class="btn btn-outline logout-btn"
                onclick="employerLogout()"
            >
                Logout
            </button>
        `;
        return;
    }
    // GUEST USER

    navbar.innerHTML = `

        <a href="../index.html">Home</a>
        <a href="jobs.html"
           class="active"
        >
            Find Jobs
        </a>
        <a href="../index.html#about">About</a>
        <a href="../index.html#contact">Contact</a>
    `;

    navButtons.innerHTML = `
        <a href="login.html"
           class="btn btn-outline"
        >
            Job Seeker
        </a>

        <a href="../employer/login.html"
           class="btn btn-primary"
        >
            Employer
        </a>
    `;
}
// LOAD HOME JOBS

async function loadJobs() {
    const jobList = document.getElementById("jobList");
    if (!jobList) return;
    jobList.innerHTML =
        '<div class="loading">Loading latest jobs...</div>';

    try {
        const response = await fetch(`${API_BASE}/jobs/get_all.php`);

        if (!response.ok) {throw new Error("HTTP Error: " + response.status);}

        const data = await response.json();

        if (!data.success || !data.jobs || data.jobs.length === 0) {
            jobList.innerHTML = '<div class="loading">No jobs available.</div>';
            return;
        }

        jobList.innerHTML = "";

        data.jobs.slice(0, 6).forEach(job => {
            jobList.appendChild(
                createJobCard(job)
            );
        });

    } catch (error) {
        console.error("Job loading error:", error);
        jobList.innerHTML = `
            <div class="loading">
                Unable to connect to server.
            </div>
        `;
    }
}

//LOAD ALL JOBS

async function loadAllJobs() {
    const jobList = document.getElementById("allJobList");

    if (!jobList) return;
    jobList.innerHTML = '<div class="loading">Loading jobs...</div>';

    try {
        const response =
            await fetch(`${API_BASE}/jobs/get_all.php`);

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        const data = await response.json();
        if (!data.success || !data.jobs) {
            jobList.innerHTML = '<div class="loading">No jobs available.</div>';
            return;
        }

        allJobs = data.jobs;

        const params = new URLSearchParams(window.location.search);
        const title = params.get("title");
        const location = params.get("location");
        const titleInput = document.getElementById("jobSearchTitle");
        const locationInput = document.getElementById("jobSearchLocation");

        if (title && titleInput) {
            titleInput.value = title;
        }

        if (location && locationInput) {
            locationInput.value = location;
        }

        if (title || location) {
            filterJobs();
        } 
        else {
            displayAllJobs(allJobs);
        }

    } catch (error) {

        console.error("All jobs loading error:",error);

        jobList.innerHTML = `
            <div class="loading">Unable to connect to server.</div>`;
    }
}

// DISPLAY JOBS

function displayAllJobs(jobs) {

    const jobList = document.getElementById("allJobList");

    const jobCount = document.getElementById("jobCount");

    if (!jobList) return;

    if (jobCount) {
        jobCount.textContent = `${jobs.length} Jobs Found`;
    }

    if (jobs.length === 0) {
        jobList.innerHTML = `
            <div class="loading">No jobs found matching your search.</div>`;
        return;
    }

    jobList.innerHTML = "";

    jobs.forEach(job => {
        jobList.appendChild(createJobCard(job));
    });
}

// CREATE JOB CARD

function createJobCard(job) {

    const card = document.createElement("div");

    card.className = "job-card";

    card.innerHTML = `
        <div class="job-card-top">
            <div class="job-icon">💼</div>

            <span class="job-type">Full Time</span>
        </div>

        <h3>${escapeHTML(job.title)}</h3>

        <p class="company">
            ${escapeHTML(job.company_name ||"Company")}
        </p>

        <div class="job-info">
            <span>
                📍 ${escapeHTML(job.location || "Not specified")}
            </span>

            <span>
                💰 ${escapeHTML(job.basicpay || "Not specified")}
            </span>
        </div>

        <div class="job-info">
            <span>
                🎓 ${escapeHTML(job.ugqual || "Not specified")}
            </span>

            <span>
                🧑‍💻 ${escapeHTML(job.experience || "Fresher")}
            </span>
        </div>

        <a
            href="${window.location.origin}/Job_Portal/Frontend/jobseeker/job-details.html?id=${encodeURIComponent(job.jobid)}"
            class="job-btn"
        >
            View Job
        </a>
    `;
    return card;
}

// FILTER JOBS

function filterJobs() {

    const titleInput = document.getElementById("jobSearchTitle");
    const locationInput = document.getElementById("jobSearchLocation");

    if (!titleInput || !locationInput) return;

    const title = titleInput.value.trim().toLowerCase();

    const location = locationInput.value.trim().toLowerCase();

    const filteredJobs =
        allJobs.filter(job => {

            const jobTitle =
                String(job.title || "").toLowerCase();

            const jobLocation =
                String(job.location || "").toLowerCase();

            return (
                (!title || jobTitle.includes(title)) &&
                (!location || jobLocation.includes(location))
            );
        });
    displayAllJobs(filteredJobs);
}

// SEARCH JOBS

function searchJobs() {

    const title = document.getElementById("searchTitle")?.value.trim();
    const location = document.getElementById("searchLocation")?.value.trim();
    const params = new URLSearchParams();

    if (title) {params.set("title", title);}

    if (location) {params.set("location", location);}

    window.location.href = `jobseeker/jobs.html?${params.toString()}`;
}

// JOB DETAILS

async function loadJobDetails() {
    const jobTitle = document.getElementById("jobTitle");

    if (!jobTitle) return;

    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("id");

    if (!jobId) {
        showJobError(
            "Job not found.",
            "No job ID was provided."
        );
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/jobs/get_all.php`);

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        const data = await response.json();

        if (!data.success || !data.jobs) {
            throw new Error("Unable to retrieve jobs.");
        }

        const job = data.jobs.find(
                item =>
                    String(item.jobid) ===
                    String(jobId)
            );

        if (!job) {
            showJobError(
                "Job not found.",
                "The requested job does not exist."
            );
            return;
        }
        /* SAVE EMPLOYER ID FOR APPLICATION */
        localStorage.setItem("current_job_eid",String(job.eid || ""));

        document.getElementById("jobTitle").textContent = job.title || "Job Opportunity";
        document.getElementById("companyName").textContent = job.company_name ||"Company";
        document.getElementById("jobDescription").textContent = job.jobdesc ||"No description available.";
        document.getElementById("jobType").textContent = job.job_type ||"Not specified";  
        document.getElementById("experience").textContent = job.experience ||"Not specified";
        document.getElementById("ugqual").textContent = job.ugqual ||"Not specified";
        document.getElementById("pgqual").textContent = job.pgqual ||"Not specified";
        document.getElementById("vacno").textContent = job.vacno ||"Not specified";
        document.getElementById("fnarea").textContent = job.fnarea ||"Not specified";
        document.getElementById("industry").textContent = job.industry ||"Not specified";
        document.getElementById("location").textContent = job.location ||"Not specified";
        document.getElementById("salary").textContent = job.basicpay ||"Not specified";
        document.getElementById("profile").textContent = job.profile ||"No profile information available.";
        document.title = "HireNest - " + (job.title || "Job Details");

    } catch (error) {
        console.error("Job details error:",error);

        showJobError(
            "Unable to load job.",
            "Please check your server connection."
        );
    }
}

// JOB ERROR

function showJobError(title, message) {
    document.body.innerHTML = `
        <div class="error">
            <h2>${escapeHTML(title)}</h2>
            <p>${escapeHTML(message)}</p>
            <br>

            <a href="jobs.html"> ← Back to Jobs</a>
        </div>`;
}

// JOB SEEKER LOGIN

async function jobSeekerLogin(event) {
    event.preventDefault();

    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");
    const button = document.getElementById("loginButton");

    if (!form || !message || !button) return;
    const formData =new FormData(form);

    formData.set("usertype","Job Seeker");

    message.className ="login-message";
    message.textContent = "";

    button.disabled = true;
    button.textContent ="Logging in...";

    try {
        // LOGIN

        const response = await fetch(`${API_BASE}/login/login.php`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                }
            );

        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message ||"Login failed.";
            message.className = "login-message show error";
            return;
        }

        // SAVE LOGIN DETAILS

        localStorage.setItem("log_id",data.user.log_id);
        localStorage.setItem("email",data.user.email);
        localStorage.setItem("usertype",data.user.usertype);

        message.textContent = "Login successful. Checking your profile...";
        message.className = "login-message show success";

        // CHECK PROFILE

        const profileResponse =
            await fetch(`${API_BASE}/jobseeker/profile.php?log_id=${encodeURIComponent(data.user.log_id)}`,
                {
                    method: "GET"
                }
            );

        const profileData = await profileResponse.json();

        // PROFILE EXISTS

        if (
            profileData.success && profileData.user
        ) {
            setTimeout(() => {
                window.location.href = "dashboard.html";}, 500);
            return;
        }

        // PROFILE DOES NOT EXIST

        setTimeout(() => {
            window.location.href = "create-profile.html";}, 700);

    } catch (error) {
        console.error("Job seeker login error:",error);

        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Login";
    }
}

// JOB SEEKER LOGOUT

function jobSeekerLogout() {

    localStorage.removeItem("log_id");
    localStorage.removeItem("email");
    localStorage.removeItem("usertype");

    window.location.href = "../index.html";
}

// EMPLOYER LOGIN

async function employerLogin(event) {
    event.preventDefault();

    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");
    const button = document.getElementById("loginButton");

    if (!form || !message || !button) {
        return;
    }

    const formData = new FormData(form);

    formData.set(
        "usertype",
        "Employer"
    );

    message.className = "login-message";

    message.textContent = "";

    button.disabled = true;
    button.textContent = "Logging in...";

    try {
        // EMPLOYER LOGIN

        const response =
            await fetch(`${API_BASE}/login/login.php`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                }
            );

        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message || "Login failed.";
            message.className = "login-message show error";
            return;
        }

        // SAVE LOGIN DETAILS

        localStorage.setItem("log_id",data.user.log_id);
        localStorage.setItem("email",data.user.email);
        localStorage.setItem("usertype",data.user.usertype);

        message.textContent = "Login successful. Checking your profile...";

        message.className = "login-message show success";

        // CHECK EMPLOYER PROFILE

        const profileResponse =
            await fetch(
                `${API_BASE}/employer/profile.php?log_id=${encodeURIComponent(data.user.log_id)}`,
                {
                    method: "GET"
                }
            );

        const profileData = await profileResponse.json();

        // PROFILE EXISTS

        if (
            profileData.success && profileData.employer
        ) {
            setTimeout(() => {
                window.location.href = "dashboard.html";}, 500);
            return;
        }

        // PROFILE DOES NOT EXIST

        setTimeout(() => {
            window.location.href = "create-profile.html";}, 700);

    } catch (error) {
        console.error("Employer login error:",error);
        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent ="Login";
    }
}
// EMPLOYER LOGOUT

function employerLogout() {

    localStorage.removeItem("log_id");
    localStorage.removeItem("email");
    localStorage.removeItem("usertype");

    window.location.href = "../index.html";
}

// JOB SEEKER REGISTER

async function jobSeekerRegister(event) {
    event.preventDefault();
    const form = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");
    const button = document.getElementById("registerButton");

    if (!form || !message || !button)
        return;

    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    message.className ="login-message";
    message.textContent = "";

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.className = "login-message show error";
        return;
    }

    const formData = new FormData(form);

    button.disabled = true;
    button.textContent = "Creating Account...";

    try {
        const response =
            await fetch(`${API_BASE}/login/register.php`,
                {
                    method: "POST",
                    body: formData
                }
            );
        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message || "Registration failed.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message || "Registration successful.";
        message.className = "login-message show success";

        setTimeout(() => {
            window.location.href ="login.html";
        }, 1000);

    } catch (error) {
        console.error("Registration error:",error);
        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Create Account";
    }
}

// EMPLOYER REGISTER

async function employerRegister(event) {
    event.preventDefault();
    const form = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");
    const button = document.getElementById("registerButton");

    if (!form || !message || !button) return;

    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    message.className = "login-message";
    message.textContent = "";

    /* PASSWORD CHECK */

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.className = "login-message show error";
        return;
    }

    const formData = new FormData(form);

    /* VERY IMPORTANT */

    formData.set(
        "usertype",
        "Employer"
    );

    button.disabled = true;
    button.textContent = "Creating Account...";

    try {
        const response = await fetch(`${API_BASE}/login/register.php`,
                {
                    method: "POST",
                    body: formData
                }
            );
        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message || "Registration failed.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message ||"Registration successful.";
        message.className = "login-message show success";

        /* GO TO EMPLOYER LOGIN */

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (error) {
        console.error("Employer registration error:",error);
        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Create Employer Account";
    }
}

// CREATE JOB SEEKER PROFILE

async function createJobSeekerProfile(event) {
    event.preventDefault();
    const form = document.getElementById("createProfileForm");
    const message = document.getElementById("profileMessage");
    const button = document.getElementById("profileButton");

    if (!form || !message || !button)
        return;

    /* GET LOGIN ID */

    const logId = localStorage.getItem("log_id");

    if (!logId) {
        message.textContent = "Login session not found. Please login again.";
        message.className = "login-message show error";
        return;
    }

    const formData = new FormData(form);

    /* ADD LOGIN ID */

    formData.append("log_id",logId);

    /* ADD USER TYPE */

    formData.set("usertype","Job Seeker");

    message.className = "login-message";
    message.textContent = "";

    button.disabled = true;
    button.textContent = "Creating Profile...";

    try {
        const response = await fetch(`${API_BASE}/login/register_profile.php`,
                {
                    method: "POST",
                    body: formData
                }
            );
        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message || "Profile creation failed.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message || "Profile created successfully.";
        message.className = "login-message show success";

        /* GO TO DASHBOARD */

        setTimeout(() => {
            window.location.href ="dashboard.html";
        }, 1000);


    } catch (error) {
        console.error("Profile creation error:",error);

        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Create Profile";
    }
}

// ESCAPE HTML

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

// POPULAR SEARCH

document.addEventListener("click",
    function(event) {
        if (
            event.target.matches(".popular span")
        ) {
            const searchTitle = document.getElementById("searchTitle");

            if (searchTitle) {
                searchTitle.value =
                    event.target
                        .textContent
                        .trim();
                searchJobs();
            }
        }
    }
);

// ENTER KEY SEARCH

document.addEventListener(
    "keydown",
    function(event) {
        if (event.key !== "Enter")
            return;
        const activeElement =
            document.activeElement;

        if (!activeElement)
            return;

        if (
            activeElement.id === "searchTitle" ||
            activeElement.id === "searchLocation"
        ) {
            searchJobs();
        }

        if (
            activeElement.id === "jobSearchTitle" ||
            activeElement.id === "jobSearchLocation"
        ) {
            filterJobs();
        }
    }
);

// DOM READY

document.addEventListener(
    "DOMContentLoaded",
    function() {
        setupNavbar();
        /* JOBS */

        loadJobs();
        loadAllJobs();
        loadJobDetails();

        loadEmployerDashboard();
        loadMyApplications();
        loadJobSeekerDashboard();
        loadEmployerMyJobs();
        loadEmployerApplications();
        loadEditJob();

        loadEmployerProfile();
        loadEditEmployerProfile();

        const createEmployerProfileForm = document.getElementById("createEmployerProfileForm");

        if (createEmployerProfileForm) {
            createEmployerProfileForm.addEventListener("submit",createEmployerProfile);
        }

        const editEmployerProfileForm = document.getElementById("editEmployerProfileForm");

        if (editEmployerProfileForm) {
            editEmployerProfileForm.addEventListener("submit",updateEmployerProfile);
        }
        const editJobForm = document.getElementById("editJobForm");

        if (editJobForm) {
            editJobForm.addEventListener("submit",updateEmployerJob);
        }

        /* JOB SEARCH BUTTON */
        const searchButton = document.getElementById("jobSearchButton");

        if (searchButton) {
            searchButton.addEventListener("click",filterJobs);
        }

        /* LOGIN FORM */

        const loginForm = document.getElementById("loginForm");

        if (loginForm) {
            if (window.location.pathname.includes("/employer/")) {
                loginForm.addEventListener("submit",employerLogin);
            } else {
                loginForm.addEventListener("submit",jobSeekerLogin);
            }
        }

        /* REGISTER FORM */

        const registerForm = document.getElementById("registerForm");

        if (registerForm) {
            if (window.location.pathname.includes("/employer/")) {
                registerForm.addEventListener("submit",employerRegister);
            } else {
                registerForm.addEventListener("submit",jobSeekerRegister);
            }
        }

        /* POST JOB FORM */

        const postJobForm = document.getElementById("postJobForm");

        if (postJobForm) {
            postJobForm.addEventListener("submit",postJob);
        }

        /* EDIT PROFILE */

        loadEditProfile();

        const editProfileForm = document.getElementById("editProfileForm");

        if (editProfileForm) {
            editProfileForm.addEventListener("submit",updateJobSeekerProfile);
        }

        /* CREATE PROFILE FORM */

        const createProfileForm = document.getElementById("createProfileForm");

        if (createProfileForm) {
            createProfileForm.addEventListener("submit",createJobSeekerProfile);
        }

        /* APPLY BUTTON */

        const applyButton = document.getElementById("applyJobButton");

        if (applyButton) {
            applyButton.addEventListener("click",applyForJob);
            setupApplyButton();
        }
    }
);

async function applyForJob() {

    const button =
        document.getElementById("applyJobButton");

    const message =
        document.getElementById("applyMessage");

    if (!button) {
        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const jobId =
        params.get("id");

    const logId =
        localStorage.getItem("log_id");

    const usertype =
        localStorage.getItem("usertype");

    /*
    |--------------------------------------------------------------------------
    | LOGIN CHECK
    |--------------------------------------------------------------------------
    */

    if (!logId || usertype !== "Job Seeker") {
        window.location.href = "login.html";
        return;
    }

    /*
    |--------------------------------------------------------------------------
    | JOB ID CHECK
    |--------------------------------------------------------------------------
    */

    if (!jobId) {

        if (message) {
            message.textContent = "Job ID not found.";
            message.style.color = "#dc2626";
        }

        return;
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE OLD POPUP
    |--------------------------------------------------------------------------
    */

    const oldPopup =
        document.getElementById("resumePopup");

    if (oldPopup) {
        oldPopup.remove();
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE POPUP
    |--------------------------------------------------------------------------
    */

    const popup =
        document.createElement("div");

    popup.id = "resumePopup";

    popup.innerHTML = `

        <div class="resume-popup-overlay">

            <div class="resume-popup">

                <button
                    type="button"
                    class="resume-popup-close"
                    id="closeResumePopup"
                >
                    ×
                </button>

                <div class="resume-popup-icon">
                    📄
                </div>

                <h2>
                    Apply for this Job
                </h2>

                <p class="resume-popup-description">
                    Upload your resume to complete your application.
                </p>

                <div class="resume-upload-section">

                    <label
                        for="popupResumeInput"
                        class="resume-upload-title"
                    >
                        Select Resume
                    </label>

                    <input
                        type="file"
                        id="popupResumeInput"
                        accept=".pdf,application/pdf"
                    >

                    <p class="resume-help">
                        PDF only • Maximum 5 MB
                    </p>

                </div>

                <button
                    type="button"
                    id="popupSubmitApplication"
                    class="resume-submit-button"
                >
                    Submit Application
                </button>

                <div
                    id="popupResumeMessage"
                    class="resume-popup-message"
                ></div>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    /*
    |--------------------------------------------------------------------------
    | POPUP STYLES
    |--------------------------------------------------------------------------
    */

    if (!document.getElementById("resumePopupStyles")) {

        const style =
            document.createElement("style");

        style.id =
            "resumePopupStyles";

        style.textContent = `

            .resume-popup-overlay {

                position: fixed;

                inset: 0;

                background: rgba(15, 23, 42, 0.65);

                display: flex;

                align-items: center;

                justify-content: center;

                padding: 20px;

                z-index: 99999;

                backdrop-filter: blur(3px);
            }


            .resume-popup {

                width: 100%;

                max-width: 460px;

                background: #ffffff;

                border-radius: 18px;

                padding: 32px;

                position: relative;

                box-shadow:
                    0 25px 70px rgba(0, 0, 0, 0.25);

                animation: resumePopupOpen
                    0.2s ease-out;
            }


            @keyframes resumePopupOpen {

                from {
                    opacity: 0;
                    transform: scale(.95) translateY(10px);
                }

                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }


            .resume-popup-close {

                position: absolute;

                top: 12px;

                right: 15px;

                width: 34px;

                height: 34px;

                border: none;

                background: #f3f4f6;

                border-radius: 50%;

                font-size: 22px;

                color: #6b7280;

                cursor: pointer;
            }


            .resume-popup-close:hover {

                background: #e5e7eb;

                color: #111827;
            }


            .resume-popup-icon {

                width: 64px;

                height: 64px;

                border-radius: 50%;

                background: #eef0ff;

                display: flex;

                align-items: center;

                justify-content: center;

                font-size: 30px;

                margin: 0 auto 18px;
            }


            .resume-popup h2 {

                margin: 0;

                text-align: center;

                color: #172033;

                font-size: 23px;
            }


            .resume-popup-description {

                text-align: center;

                color: #697386;

                font-size: 14px;

                line-height: 1.6;

                margin: 10px 0 25px;
            }


            .resume-upload-section {

                margin-bottom: 18px;
            }


            .resume-upload-title {

                display: block;

                margin-bottom: 8px;

                font-size: 13px;

                font-weight: 700;

                color: #172033;
            }


            #popupResumeInput {

                width: 100%;

                padding: 12px;

                border: 1px solid #dfe3eb;

                border-radius: 10px;

                background: #ffffff;

                font-size: 13px;

                cursor: pointer;
            }


            #popupResumeInput:hover {

                border-color: #6366f1;
            }


            .resume-help {

                margin: 7px 0 0;

                color: #8a93a3;

                font-size: 11px;
            }


            .resume-submit-button {

                width: 100%;

                border: none;

                background: #4f46e5;

                color: #ffffff;

                padding: 13px 18px;

                border-radius: 10px;

                font-size: 14px;

                font-weight: 700;

                cursor: pointer;
            }


            .resume-submit-button:hover {

                background: #4338ca;
            }


            .resume-submit-button:disabled {

                opacity: .7;

                cursor: not-allowed;
            }


            .resume-popup-message {

                margin-top: 14px;

                text-align: center;

                font-size: 13px;

                font-weight: 600;

                line-height: 1.5;
            }


            @media(max-width:500px) {

                .resume-popup {

                    max-width: 100%;

                    padding: 25px 20px;
                }
            }

        `;

        document.head.appendChild(style);
    }

    /*
    |--------------------------------------------------------------------------
    | GET POPUP ELEMENTS
    |--------------------------------------------------------------------------
    */

    const closeButton =
        document.getElementById(
            "closeResumePopup"
        );

    const resumeInput =
        document.getElementById(
            "popupResumeInput"
        );

    const submitButton =
        document.getElementById(
            "popupSubmitApplication"
        );

    const popupMessage =
        document.getElementById(
            "popupResumeMessage"
        );


    /*
    |--------------------------------------------------------------------------
    | CLOSE BUTTON
    |--------------------------------------------------------------------------
    */

    closeButton.onclick =
        function () {

            popup.remove();

        };


    /*
    |--------------------------------------------------------------------------
    | BACKGROUND CLICK CLOSE
    |--------------------------------------------------------------------------
    */

    const overlay =
        popup.querySelector(
            ".resume-popup-overlay"
        );

    overlay.onclick =
        function (event) {

            if (
                event.target === overlay
            ) {

                popup.remove();

            }
        };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT APPLICATION
    |--------------------------------------------------------------------------
    */

    submitButton.onclick =
        async function () {

            if (!resumeInput.files.length) {

                popupMessage.textContent =
                    "Please select your resume.";

                popupMessage.style.color =
                    "#dc2626";

                return;
            }


            const resumeFile =
                resumeInput.files[0];


            /*
            | PDF CHECK
            */

            if (
                resumeFile.type !==
                    "application/pdf" &&
                !resumeFile.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                popupMessage.textContent =
                    "Only PDF resume is allowed.";

                popupMessage.style.color =
                    "#dc2626";

                resumeInput.value = "";

                return;
            }


            /*
            | SIZE CHECK
            */

            const maxSize =
                5 * 1024 * 1024;

            if (
                resumeFile.size >
                maxSize
            ) {

                popupMessage.textContent =
                    "Resume size must be less than 5 MB.";

                popupMessage.style.color =
                    "#dc2626";

                resumeInput.value = "";

                return;
            }


            /*
            | SUBMIT
            */

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Submitting...";

            popupMessage.textContent =
                "Uploading resume and submitting application...";

            popupMessage.style.color =
                "#697386";


            const formData =
                new FormData();

            formData.append(
                "user_id",
                logId
            );

            formData.append(
                "job_id",
                jobId
            );

            formData.append(
                "resume",
                resumeFile
            );


            try {

                const response =
                    await fetch(
                        `${API_BASE}/application/apply.php`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "HTTP Error: " +
                        response.status
                    );
                }


                const data =
                    await response.json();


                console.log(
                    "APPLICATION RESPONSE:",
                    data
                );


                if (!data.success) {

                    popupMessage.textContent =
                        data.message ||
                        "Unable to submit application.";

                    popupMessage.style.color =
                        "#dc2626";

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Application";

                    return;
                }


                /*
                | SUCCESS
                */

                popupMessage.textContent =
                    data.message ||
                    "Application submitted successfully.";

                popupMessage.style.color =
                    "#16a34a";

                submitButton.textContent =
                    "Applied";

                submitButton.disabled =
                    true;

                resumeInput.disabled =
                    true;


                setTimeout(
                    function () {

                        popup.remove();

                        button.textContent =
                            "Applied";

                        button.disabled =
                            true;

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Application error:",
                    error
                );

                popupMessage.textContent =
                    "Unable to connect to server.";

                popupMessage.style.color =
                    "#dc2626";

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Application";
            }
        };
}
// EMPLOYER POST JOB

async function postJob(event) {
    event.preventDefault();

    const form = document.getElementById("postJobForm");
    const message = document.getElementById("postJobMessage");
    const button = document.getElementById("postJobButton");

    if (!form || !message || !button) return;

    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    /* CHECK EMPLOYER LOGIN */

    if (!logId || usertype !== "Employer") {
        message.textContent = "Please login as an Employer first.";
        message.className = "login-message show error";
        return;
    }

    const formData = new FormData(form);

    // Employer login information
    
    formData.set("log_id", logId);
    formData.set("usertype", "Employer");

    button.disabled = true;
    button.textContent = "Posting Job...";

    message.className = "login-message";
    message.textContent = "";

    try {
        const response = await fetch(`${API_BASE}/jobs/create.php`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        const data = await response.json();

        console.log("CREATE JOB RESPONSE:", data);

        if (!data.success) {
            message.textContent = data.message || "Unable to post job.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message || "Job posted successfully.";
        message.className = "login-message show success";
        form.reset();

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1200);

    } catch (error) {
        console.error("Post job error:", error);

        message.textContent = "Unable to connect to server.";

        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Post Job";
    }
}

// LOAD EMPLOYER JOBS

async function loadEmployerDashboard() {
    const jobList = document.getElementById("employerJobList");

    if (!jobList) return;
    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer") {
        window.location.href = "login.html";
        return;
    }
    try {
        const formData = new FormData();

        formData.append("log_id",logId);
        
        const response =await fetch(`${API_BASE}/jobs/get_my_jobs.php`,
                {
                    method: "POST",
                    body: formData
                }
            );
        const data = await response.json();
        if (!data.success) {
            jobList.innerHTML = `
                <div class="empty-jobs">
                    <h3>Unable to load jobs</h3>
                    <p>${escapeHTML(data.message ||"Something went wrong.")}</p>
                </div>
            `;
            return;
        }
        const jobs = data.jobs || [];

        updateEmployerDashboardStats(jobs);

        if (jobs.length === 0) {
            jobList.innerHTML = `
                <div class="empty-jobs">
                    <h3>No Jobs Posted Yet</h3>
                    <p>
                        Start by posting your first
                        job opportunity on HireNest.
                    </p>
                    <a href="post-job.html">
                        + Post a Job
                    </a>
                </div>
            `;
            return;
        }

        jobList.innerHTML = "";

        jobs.forEach(job => {
            const card = document.createElement("div");
            card.className ="employer-job-card";
            card.innerHTML = `<div class="employer-job-top">
                    <div>
                        <h3 class="employer-job-title">
                            ${escapeHTML(job.title)}
                        </h3>

                        <span class="job-status">Active</span>
                        <div class="employer-job-meta">
                            <span>
                                📍
                                ${escapeHTML(job.location ||"Not specified")}
                            </span>
                            <span>
                                💰
                                ${escapeHTML(job.basicpay ||"Not specified")}
                            </span>
                            <span>
                                👥
                                ${escapeHTML(String(job.vacno ||"0"))}
                                Vacancies
                            </span>
                            <span>
                                🧑‍💻
                                ${escapeHTML(job.experience ||"Not specified")}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="employer-job-actions">
                    <a href="../jobseeker/job-details.html?id=${encodeURIComponent(
                            job.jobid
                        )}&from=employer"

                        class="view-job-btn"
                    >
                        View
                    </a>

                    <a href="edit-job.html?id=${encodeURIComponent(job.jobid)}"
                        class="edit-job-btn"
                    >
                        Edit
                    </a>
                    <button
                        type="button"
                        class="delete-job-btn"
                        onclick="deleteEmployerJob(${Number(job.jobid)})"
                    >
                        Delete
                    </button>
                </div>
            `;

            jobList.appendChild(card);
        });

    } catch (error) {
        console.error("Employer dashboard error:",error);

        jobList.innerHTML = `
            <div class="empty-jobs">
                <h3>Server Connection Error</h3>
                <p>Unable to connect to the server.</p>
            </div>
        `;
    }
}
function updateEmployerDashboardStats(jobs) {
    
    const totalJobsElement = document.getElementById("totalJobs");
    const totalVacanciesElement = document.getElementById("totalVacancies");
    const totalJobs = jobs.length;
    const totalVacancies =jobs.reduce((total, job) => total + Number(job.vacno || 0),0);

    if (totalJobsElement) {
        totalJobsElement.textContent = totalJobs;
    }

    if (totalVacanciesElement) {
        totalVacanciesElement.textContent = totalVacancies;
    }
}

// LOAD EDIT PROFILE

async function loadEditProfile() {

    const form = document.getElementById("editProfileForm");

    if (!form) return;

    const message = document.getElementById("editProfileMessage");
    const logId = localStorage.getItem("log_id");

    if (!logId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
                `${API_BASE}/jobseeker/profile.php?log_id=${encodeURIComponent(logId)}`
            );
        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message || "Unable to load profile.";
            message.className = "login-message show error";
            return;
        }

        const user = data.user;
        document.getElementById("editName").value = user.name || "";
        document.getElementById("editPhone").value = user.phone || "";
        document.getElementById("editLocation").value = user.location || "";
        document.getElementById("editExperience").value = user.experience || "";
        document.getElementById("editSkills").value = user.skills || "";
        document.getElementById("editEducation").value = user.basic_edu || "";
    } catch (error) {
        console.error("Edit profile loading error:",error);
        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";
    }
}

// UPDATE JOB SEEKER PROFILE

async function updateJobSeekerProfile(event) {
    event.preventDefault();

    const form = document.getElementById("editProfileForm");
    const message = document.getElementById("editProfileMessage");
    const button = document.getElementById("editProfileButton");
    const logId = localStorage.getItem("log_id");

    if (!logId) {
        window.location.href ="login.html";
        return;
    }

    const formData = new FormData(form);

    formData.append("log_id",logId);
    button.disabled = true;
    button.textContent = "Saving...";

    message.className = "login-message";
    message.textContent = "";

    try {
        const response = await fetch(
                `${API_BASE}/jobseeker/update_profile.php`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data = await response.json();
        console.log("UPDATE PROFILE:",data);

        if (!data.success) {
            message.textContent = data.message || "Profile update failed.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message || "Profile updated successfully.";
        message.className = "login-message show success";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);

    } catch (error) {
        console.error("Profile update error:",error);

        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Save Changes";
    }
}

// LOAD MY APPLICATIONS

async function loadMyApplications() {
    const applicationsList = document.getElementById("applicationsList");
    
    if (!applicationsList) return;
    
    const logId = localStorage.getItem("log_id");

    if (!logId) {
        window.location.href = "login.html";
        return;
    }

    applicationsList.innerHTML = `
        <div class="applications-loading">
            Loading your applications...
        </div>
    `;

    try {
        /* GET ACTUAL JOB SEEKER USER ID */

        const profileResponse = await fetch(
                `${API_BASE}/jobseeker/profile.php?log_id=${encodeURIComponent(logId)}`
            );
        const profileData = await profileResponse.json();

        if (!profileData.success || !profileData.user
        ) {
            applicationsList.innerHTML = `
                <div class="applications-empty">
                    <div class="applications-empty-icon">👤</div>
                    <h3>Profile Not Found</h3>
                    <p>Please create your Job Seeker profile first.</p>
                    <a href="create-profile.html"
                       class="applications-find-btn"
                    >
                        Create Profile
                    </a>
                </div>
            `;
            return;
        }

        const userId = profileData.user.user_id;

        /* GET APPLICATIONS */

        const response = await fetch(
                `${API_BASE}/application/my_applications.php?user_id=${encodeURIComponent(userId)}`
            );
        const data = await response.json();

        console.log("MY APPLICATIONS:",data);

        if (!data.success) {
            applicationsList.innerHTML = `
                <div class="applications-empty">
                    <h3>Unable to Load Applications</h3>
                    <p>${escapeHTML(data.message || "Something went wrong.")}</p>
                </div>
            `;
            return;
        }
        const applications = data.applications || [];

        /* COUNTS */

        const totalElement = document.getElementById("totalApplications");
        const pendingElement = document.getElementById("pendingApplications");
        const selectedElement = document.getElementById("selectedApplications");
        const pendingCount =applications.filter(app => String(app.status) === "0").length;
        const selectedCount =applications.filter(app => String(app.status) === "3").length;

        if (totalElement) {totalElement.textContent = applications.length;}
        if (pendingElement) {pendingElement.textContent = pendingCount;}
        if (selectedElement) {selectedElement.textContent = selectedCount;}

        /* NO APPLICATIONS */

        if (applications.length === 0) {
            applicationsList.innerHTML = `
                <div class="applications-empty">
                    <div class="applications-empty-icon">📄</div>
                    <h3>No Applications Yet</h3>
                    <p>You haven't applied for any jobs yet.</p>
                    <a href="jobs.html"
                       class="applications-find-btn"
                    >
                        Find Jobs
                    </a>
                </div>
            `;
            return;
        }

        /* DISPLAY */

        applicationsList.innerHTML = "";
        applications.forEach(application => {

            const card = document.createElement("div");

            card.className = "application-card";

            const status = String(application.status);

            let statusText = "Pending";

            if (status === "1") {
                statusText = "Shortlisted";
            } else if (status === "2") {
                statusText = "Rejected";
            } else if (status === "3") {
                statusText = "Selected";
            }

            card.innerHTML = `
                <div class="application-main">
                    <div class="application-icon">💼</div>
                    <div class="application-content">
                        <h3>${escapeHTML(application.title || "Job")}</h3>
                        <p>
                            📍
                            ${escapeHTML(application.location ||"Location not specified")}
                        </p>

                        <p>
                            💰
                            ${escapeHTML(application.basicpay || "Salary not specified")}
                        </p>

                        <span class="application-date">
                            Applied on
                            ${escapeHTML(application.date_applied || "")}
                        </span>
                    </div>
                </div>

                <div class="application-actions">
                    <span
                        class="application-status status-${status}"
                    >
                        ${statusText}
                    </span>

                    <a
                        href="job-details.html?id=${encodeURIComponent(
                            application.job_id
                        )}"
                        class="application-view-btn"
                    >
                        View Job
                    </a>

                    <button
                        type="button"
                        class="application-cancel-btn"
                        onclick="cancelApplication(${Number(
                            application.apply_id
                        )})"
                    >
                        Cancel Application
                    </button>
                </div>
            `;
            applicationsList.appendChild(card);
        });

    } catch (error) {
        console.error("My applications error:",error);

        applicationsList.innerHTML = `
            <div class="applications-empty">
                <h3>Server Connection Error</h3>
                <p>Unable to connect to the server.</p>
            </div>
        `;
    }
}

// CANCEL APPLICATION

async function cancelApplication(applyId) {
    const logId = localStorage.getItem("log_id");

    if (!logId) {
        window.location.href = "login.html";
        return;
    }

    const confirmed = confirm(
            "Are you sure you want to cancel this application?"
        );

    if (!confirmed) {
        return;
    }

    try {

        /* GET ACTUAL USER ID */

        const profileResponse =
            await fetch(
                `${API_BASE}/jobseeker/profile.php?log_id=${encodeURIComponent(logId)}`
            );

        const profileData = await profileResponse.json();

        if (!profileData.success || !profileData.user
        ) {
            alert("Job Seeker profile not found.");
            return;
        }

        const userId = profileData.user.user_id;

        /* DELETE APPLICATION */

        const response = await fetch(
                `${API_BASE}/application/delete_application.php?apply_id=${encodeURIComponent(applyId)}&user_id=${encodeURIComponent(userId)}`,
                {
                    method: "DELETE"
                }
            );

        const data = await response.json();

        console.log("CANCEL APPLICATION:", data
        );

        if (!data.success) {
            alert(data.message || "Unable to cancel application.");
            return;
        }

        alert("Application cancelled successfully.");

        loadMyApplications();

    } catch (error) {
        console.error("Cancel application error:",error);
        alert("Unable to connect to server.");
    }
}

// LOAD JOB SEEKER DASHBOARD

async function loadJobSeekerDashboard() {
    const availableJobsElement = document.getElementById("availableJobs");
    const myApplicationsElement = document.getElementById("myApplications");
    const dashboardName = document.getElementById("dashboardName");
    const summaryName = document.getElementById("summaryName");
    const summaryEmail = document.getElementById("summaryEmail");
    const summaryLocation = document.getElementById("summaryLocation");
    const summaryExperience = document.getElementById("summaryExperience");
    const dashboardJobList = document.getElementById("dashboardJobList");

    if (
        !availableJobsElement &&
        !myApplicationsElement &&
        !dashboardJobList
    ) {
        return;
    }

    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Job Seeker"
    ) {
        window.location.href = "login.html";
        return;
    }

    try {

        // GET JOB SEEKER PROFILE

        const profileResponse = await fetch(
                `${API_BASE}/jobseeker/profile.php?log_id=${encodeURIComponent(logId)}`
            );

        const profileData = await profileResponse.json();

        if (profileData.success && profileData.user) {
            const user = profileData.user;

            if (dashboardName) {
                dashboardName.textContent = user.name || "Job Seeker";
            }

            if (summaryName) {
                summaryName.textContent = user.name || "Not provided";
            }

            if (summaryEmail) {
                summaryEmail.textContent = user.email || "Not provided";
            }

            if (summaryLocation) {
                summaryLocation.textContent = user.location || "Not provided";
            }

            if (summaryExperience) {
                summaryExperience.textContent = user.experience || "Not provided";
            }
        }

    // CHECK PROFILE STATUS

        const profileStatus = document.getElementById("profileStatus");
        const profileAction = document.getElementById("profileAction");

        if (profileStatus) {
            const user = profileData.user;
            const isComplete =
                user.name &&
                user.phone &&
                user.location &&
                user.experience &&
                user.skills &&
                user.basic_edu;

            if (isComplete) {

                profileStatus.textContent = "Complete";

                profileStatus.className = "profile-status complete";

                if (profileAction) {
                    profileAction.textContent = "View Profile";
                    profileAction.href = "profile.html";
                }
            } else {
                profileStatus.textContent = "Incomplete";
                profileStatus.className = "profile-status incomplete";

                if (profileAction) {
                    profileAction.textContent = "Complete Profile";

                    profileAction.href = "edit-profile.html";
                }
            }
        }
        
        // GET ALL JOBS

        const jobsResponse = await fetch(
                `${API_BASE}/jobs/get_all.php`
            );

        const jobsData = await jobsResponse.json();

        if (jobsData.success && Array.isArray(jobsData.jobs)) {
            const jobs = jobsData.jobs;

            if (availableJobsElement) {
                availableJobsElement.textContent = jobs.length;
            }

            // LATEST 4 JOBS

            if (dashboardJobList) {
                dashboardJobList.innerHTML = "";

                if (jobs.length === 0) {
                    dashboardJobList.innerHTML = `
                        <div class="dashboard-loading">
                            No jobs available right now.
                        </div>
                    `;
                } else {
                    jobs
                        .slice(0, 4)
                        .forEach(job => {
                            const jobCard = document.createElement("div");

                            jobCard.className = "dashboard-job-card";

                            jobCard.innerHTML = `
                                <h3>
                                    ${escapeHTML(job.title || "Job Opportunity")}
                                </h3>

                                <p>
                                    📍
                                    ${escapeHTML(
                                        job.location || "Location not specified"
                                    )}
                                </p>


                                <div class="dashboard-job-meta">

                                    <span>
                                        💰
                                        ${escapeHTML(
                                            job.basicpay || "Not specified"
                                        )}
                                    </span>

                                    <span>
                                        🧑‍💻
                                        ${escapeHTML(
                                            job.experience || "Not specified"
                                        )}
                                    </span>
                                </div>

                                <a
                                    href="job-details.html?id=${encodeURIComponent(job.jobid)}"
                                >
                                    View Job →
                                </a>
                            `;

                            dashboardJobList.appendChild(jobCard);
                        });
                }
            }
        }

        // GET ACTUAL USER ID

        let userId = null;

        if (profileData.success && profileData.user) {
            userId = profileData.user.user_id;
        }

        // GET MY APPLICATIONS

        if (userId) {
            const applicationsResponse = await fetch(
                    `${API_BASE}/application/my_applications.php?user_id=${encodeURIComponent(userId)}`
                );

            const applicationsData = await applicationsResponse.json();

            if (
                applicationsData.success && Array.isArray(
                    applicationsData.applications
                )
            ) {

                if (myApplicationsElement) {
                    myApplicationsElement.textContent = applicationsData.applications.length;
                }

            } else {
                if (myApplicationsElement) {
                    myApplicationsElement.textContent = "0";
                }
            }
        } else {
            if (myApplicationsElement) {
                myApplicationsElement.textContent = "0";
            }
        }

    } catch (error) {
        console.error("Job seeker dashboard error:",error);
    }
}

// SET APPLY BUTTON STATUS

async function setupApplyButton() {

    const button = document.getElementById("applyJobButton");
    const message = document.getElementById("applyMessage");

        if (!button) return;

        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");

        if (from === "employer") {
            const applySection = document.getElementById("jobApplySection");

            if (applySection) {
                applySection.style.display = "none";
            }
            return;
        }
        const logId = localStorage.getItem("log_id");
        const usertype = localStorage.getItem("usertype");

    // GUEST USER

    if (!logId || usertype !== "Job Seeker"
    ) {
        button.textContent = "Login & Apply";
        return;
    }

    // LOGGED-IN JOB SEEKER

    try {
        const profileResponse = await fetch(
                `${API_BASE}/jobseeker/profile.php?log_id=${encodeURIComponent(logId)}`
            );

        const profileData = await profileResponse.json();

        if (!profileData.success ||!profileData.user
        ) {
            button.textContent = "Complete Profile";

            button.onclick = function() {
                window.location.href = "create-profile.html";
            };
            return;
        }

        const userId = profileData.user.user_id;
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get("id");

        if (!jobId) {
            button.textContent = "Apply Now";
            return;
        }

        // CHECK APPLICATION

        const response = await fetch(
                `${API_BASE}/application/my_applications.php?user_id=${encodeURIComponent(userId)}`
            );

        const data = await response.json();

        if (data.success && Array.isArray(data.applications)
        ) {
            const alreadyApplied =
                data.applications.some(
                    application => String(application.job_id) === String(jobId)
                );

            if (alreadyApplied) {
                button.textContent ="Applied";
                button.disabled = true;
                button.classList.add("already-applied");

                if (message) {
                    message.textContent = "You have already applied for this job.";
                    message.style.color = "#16a34a";
                }
                return;
            }
        }

        // READY TO APPLY
        button.textContent = "Apply Now";
 
    } catch (error) {
        console.error("Apply button setup error:",error);

        if (logId && usertype === "Job Seeker"
        ) {
            button.textContent = "Apply Now";
        } else {
            button.textContent = "Login & Apply";
        }
    }
}
   
// LOAD EMPLOYER MY JOBS

async function loadEmployerMyJobs() {
    const jobList = document.getElementById("myJobsList");

    if (!jobList) return;

    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer"
    ) {
        window.location.href = "login.html";
        return;
    }

    try {
        const formData = new FormData();

        formData.append("log_id", logId);

        const response = await fetch(
                `${API_BASE}/jobs/get_my_jobs.php`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data = await response.json();

        if (!data.success) {
            jobList.innerHTML = `
                <div class="empty-jobs">
                    <h3>Unable to load jobs</h3>
                    <p>
                        ${escapeHTML(data.message || "Something went wrong.")}
                    </p>
                </div>
            `;
            return;
        }

        const jobs = data.jobs || [];
        const countElement = document.getElementById("myJobsCount");
        const vacanciesElement = document.getElementById("myJobsVacancies");

        if (countElement) {
            countElement.textContent = jobs.length;
        }

        const totalVacancies = jobs.reduce((total, job) => total + Number(job.vacno || 0), 0);

        if (vacanciesElement) {
            vacanciesElement.textContent = totalVacancies;
        }

        if (jobs.length === 0) {
            jobList.innerHTML = `
                <div class="applications-empty">
                    <div class="applications-empty-icon">💼</div>
                    <h3>No Jobs Posted Yet</h3>
                    <p>Start by posting your first job opportunity.</p>
                    <a
                        href="post-job.html"
                        class="applications-find-btn"
                    >
                        + Post a Job
                    </a>
                </div>
            `;
            return;
        }

        jobList.innerHTML = "";

        jobs.forEach(job => {
            const card = document.createElement("div");

            card.className = "my-job-card";

            card.innerHTML = `
                <div class="my-job-main">
                    <div class="my-job-icon">💼</div>
                    <div class="my-job-content">
                        <div class="my-job-title-row">
                            <h3>
                                ${escapeHTML(job.title ||"Untitled Job")}
                            </h3>
                            <span class="job-status">Active</span>
                        </div>

                        <p class="my-job-location">
                            📍
                            ${escapeHTML(job.location || "Location not specified")}
                        </p>

                        <div class="my-job-meta">
                            <span>
                                💰
                                ${escapeHTML(job.basicpay || "Not specified")}
                            </span>

                            <span>
                                🧑‍💻
                                ${escapeHTML(job.experience || "Not specified")}
                            </span>

                            <span>
                                👥
                                ${escapeHTML(
                                    String(job.vacno || "0")
                                )}
                                Vacancies
                            </span>
                        </div>
                    </div>
                </div>

                <div class="my-job-actions">
                    <a href="../jobseeker/job-details.html?id=${encodeURIComponent(job.jobid)}&from=employer" class="my-job-view-btn">
                        View Job
                    </a>

                    <a href="edit-job.html?id=${encodeURIComponent(job.jobid)}" class="my-job-edit-btn">
                        Edit
                    </a>

                    <button type="button" class="my-job-delete-btn" onclick="deleteEmployerJob(${Number(job.jobid)})">
                        Delete
                    </button>
                </div>
            `;

            jobList.appendChild(card);
        });

    } catch (error) {
        console.error("Employer My Jobs error:",error);

        jobList.innerHTML = `
            <div class="empty-jobs">
                <h3>Server Connection Error</h3>
                <p>Unable to connect to the server.</p>
            </div>
        `;
    }
}

// DELETE EMPLOYER JOB

async function deleteEmployerJob(jobid) {
    if (!jobid) {
        alert("Job ID is required.");
        return;
    }

    const confirmed = confirm("Are you sure you want to delete this job?");

    if (!confirmed) return;

    const formData = new URLSearchParams();

    formData.append("jobid", String(jobid));

    try {
        const response = await fetch(
                `${API_BASE}/jobs/delete.php`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body:
                        formData.toString()
                }
            );
        const data = await response.json();

        console.log("DELETE JOB RESPONSE:", data);

        if (!data.success) {
            alert(data.message || "Unable to delete job.");
            return;
        }
        alert(data.message || "Job deleted successfully.");
        loadEmployerMyJobs();

    } catch (error) {
        console.error("Delete job error:", error);

        alert("Unable to connect to server.");
    }
}

// LOAD EDIT JOB

async function loadEditJob() {
    const form = document.getElementById("editJobForm");

    if (!form) return;

    const params = new URLSearchParams(
            window.location.search
        );
    const jobId = params.get("id");
    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!jobId || !logId || usertype !== "Employer") {
        window.location.href = "dashboard.html";
        return;
    }

    try {
        const formData = new FormData();

        formData.append("log_id", logId);

        const response = await fetch(
                `${API_BASE}/jobs/get_my_jobs.php`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data = await response.json();

        if (!data.success || !Array.isArray(data.jobs)) {
            return;
        }
        const job = data.jobs.find(item => String(item.jobid) === String(jobId));

        if (!job) {
            alert("Job not found.");
            window.location.href = "my-jobs.html";
            return;
        }

        document.getElementById("editTitle").value = job.title || "";
        document.getElementById("editJobType").value = job.job_type || "";
        document.getElementById("editJobdesc").value = job.jobdesc || "";
        document.getElementById("editLocation").value = job.location || "";
        document.getElementById("editBasicpay").value = job.basicpay || "";
        document.getElementById("editExperience").value = job.experience || "";
        document.getElementById("editUgqual").value = job.ugqual || "";
        document.getElementById("editPgqual").value = job.pgqual || "";
        document.getElementById("editVacno").value = job.vacno || "";
        document.getElementById("editFnarea").value = job.fnarea || "";
        document.getElementById("editIndustry").value = job.industry || "";
        document.getElementById("editProfile").value = job.profile || "";

    } catch (error) {
        console.error("Edit job loading error:",error);
    }
}
   
// UPDATE EMPLOYER JOB

async function updateEmployerJob(event) {
    event.preventDefault();

    const form = document.getElementById("editJobForm");
    const message = document.getElementById("editJobMessage");
    const button = document.getElementById("editJobButton");
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("id");
    const logId = localStorage.getItem("log_id");

    if (!form || !jobId || !logId) {
        return;
    }

    const formData = new FormData(form);

    formData.set("jobid", jobId);
    formData.set("log_id", logId);

    button.disabled = true;
    button.textContent = "Saving...";

    message.className = "login-message";
    message.textContent = "";

    try {
        const response = await fetch(
                `${API_BASE}/jobs/update.php`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message || "Unable to update job.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message || "Job updated successfully.";
        message.className = "login-message show success";

        setTimeout(() => {
            window.location.href = "my-jobs.html";
        }, 800);

    } catch (error) {
        console.error("Update job error:", error);

        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Save Changes";
    }
}
   
// LOAD EMPLOYER APPLICATIONS

async function loadEmployerApplications() {
    const list = document.getElementById("employerApplicationsList");

    if (!list) return;

    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer") {
        window.location.href = "login.html";
        return;
    }
    list.innerHTML = `
        <div class="applications-empty">
            <div class="applications-empty-icon">📄</div>
            <h3>Loading Applications...</h3>
            <p>Please wait while applications are loaded.</p>
        </div>
    `;

    try {

        // GET EMPLOYER PROFILE

        const profileResponse = await fetch(
                `${API_BASE}/employer/profile.php?log_id=${encodeURIComponent(logId)}`
            );
        const profileData = await profileResponse.json();

        if (!profileData.success || !profileData.employer) {
            list.innerHTML = `
                <div class="applications-empty">
                    <div class="applications-empty-icon">👤</div>
                    <h3>Employer Profile Not Found</h3>
                    <p>Please complete your employer profile first.</p>
                </div>
            `;
            return;
        }

        const employerId = profileData.employer.eid;

        // GET EMPLOYER APPLICATIONS

        const response = await fetch(
                `${API_BASE}/application/get_job_applications.php?eid=${encodeURIComponent(employerId)}`
            );

        const data = await response.json();

        console.log("EMPLOYER APPLICATIONS:", data);

        if (!data.success) {
            list.innerHTML = `
                <div class="applications-empty">
                    <div class="applications-empty-icon">⚠️</div>
                    <h3>Unable to Load Applications</h3>
                    <p>${escapeHTML(data.message || "Something went wrong.")}</p>
                </div>
            `;
            return;
        }
        const applications = data.applications || [];

        // TOTAL COUNT

        const countElement = document.getElementById("employerApplicationsCount");

        if (countElement) {
            countElement.textContent = applications.length;
        }

        // NO APPLICATIONS

        if (applications.length === 0) {
            list.innerHTML = `
                <div class="applications-empty">
                    <div class="applications-empty-icon">📄</div>
                    <h3>No Applications Yet</h3>
                    <p>No candidates have applied for your jobs yet.</p>
                </div>
            `;
            return;
        }

        // DISPLAY APPLICATIONS

        list.innerHTML = "";

        applications.forEach(
            application => {

                const card = document.createElement("div");

                card.className = "employer-application-card";

                const status = String(application.status);

                let statusText = "Pending";
                let statusClass = "status-pending";

                if (status === "1") {
                    statusText = "Accepted";
                    statusClass = "status-accepted";

                } else if (status === "2") {
                    statusText = "Rejected";
                    statusClass = "status-rejected";
                }

                card.innerHTML = `
                    <div class="application-left">
                        <div class="application-avatar">👤</div>
                        <div class="application-info">
                            <h3>${escapeHTML(application.name || "Applicant")}</h3>

                            <p class="job-name">
                                Applied for:
                                ${escapeHTML(application.title || "Job")}
                            </p>

                            <p>
                                📞
                                ${escapeHTML(application.phone || "Phone not provided")}
                            </p>

                            <p>
                                📍
                                ${escapeHTML(application.location || "Location not provided")}
                            </p>

                           <div class="application-meta">
                                <span>
                                    🧑‍💻
                                    ${escapeHTML(application.experience || "Fresher")}
                                </span>

                                <span>
                                    🛠️
                                    ${escapeHTML(application.skills || "Skills not provided")}
                                </span>

                                <span>
                                    📅
                                    ${escapeHTML(application.date_applied || "")}
                                </span>
                            </div>

                            ${
                                application.resume
                                    ? `
                                        <div style="margin-top:14px;">
                                            <a
                                                href="${window.location.origin}/Job_Portal/${application.resume}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="resume-view-btn"
                                            >
                                                📄 View Resume
                                            </a>

                                            <a
                                                href="${window.location.origin}/Job_Portal/${application.resume}"
                                                download
                                                class="resume-download-btn"
                                            >
                                                ⬇ Download Resume
                                            </a>
                                        </div>
                                    `
                                    : `
                                        <p style="margin-top:14px;color:#9ca3af;font-size:12px;">
                                            No resume uploaded.
                                        </p>
                                    `
                            }
                        </div>
                    </div>

                    <div class="application-right">
                        <span
                            class="application-status ${statusClass}"
                        >
                            ${statusText}
                        </span>

                        <div class="application-actions">
                            <button
                                type="button"
                                class="application-action-btn pending-btn"
                                onclick="updateApplicationStatus(
                                    ${Number(application.apply_id)},
                                    0
                                )"
                                ${status === "0" ? "disabled" : ""}
                            >
                                Pending
                            </button>

                            <button
                                type="button"
                                class="application-action-btn accept-btn"
                                onclick="updateApplicationStatus(
                                    ${Number(application.apply_id)},
                                    1
                                )"
                                ${status === "1" ? "disabled" : ""}
                            >
                                Accept
                            </button>

                            <button
                                type="button"
                                class="application-action-btn reject-btn"
                                onclick="updateApplicationStatus(
                                    ${Number(application.apply_id)},
                                    2
                                )"
                                ${status === "2" ? "disabled" : ""}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            }
        );

    } catch (error) {
        console.error("Employer applications error:",error);
        
        list.innerHTML = `
            <div class="applications-empty">
                <div class="applications-empty-icon">⚠️</div>
                <h3>Server Connection Error</h3>
                <p>Unable to connect to the server.</p>
            </div>
        `;
    }
}

// UPDATE APPLICATION STATUS

async function updateApplicationStatus(applyId, status) {

    if (!applyId) {
        alert("Application ID is required.");
        return;
    }

    let action = "Pending";

    if (String(status) === "1") {
        action = "Accept";
    } else if (String(status) === "2") {
        action = "Reject";
    }

    const confirmed = confirm(
        `Are you sure you want to ${action.toLowerCase()} this application?`
    );

    if (!confirmed) {
        return;
    }

    const formData = new FormData();

    formData.append("apply_id", String(applyId));
    formData.append("status", String(status));

    try {

        const response = await fetch(
            `${API_BASE}/application/update_status.php`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(
                "HTTP Error: " + response.status
            );
        }

        const data = await response.json();

        console.log(
            "UPDATE APPLICATION STATUS:",
            data
        );

        if (!data.success) {
            alert(
                data.message ||
                "Unable to update application status."
            );
            return;
        }

        alert(
            data.message ||
            "Application status updated successfully."
        );

        loadEmployerApplications();

    } catch (error) {

        console.error(
            "Application status error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}   
// CREATE EMPLOYER PROFILE

async function createEmployerProfile(event) {
    
    event.preventDefault();
    
    const form = document.getElementById("createEmployerProfileForm" );
    const message = document.getElementById("employerProfileMessage");
    const button = document.getElementById("createEmployerProfileButton");

    if (!form || !message || !button) {
        return;
    }
    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer") {
        window.location.href = "login.html";
        return;
    }
    const formData = new FormData(form);

    formData.set("log_id", logId);

    button.disabled = true;
    button.textContent = "Creating Profile...";

    message.className = "login-message";
    message.textContent = "";

    try {
        const response = await fetch(
                `${API_BASE}/employer/profile.php`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data = await response.json();

        console.log("CREATE EMPLOYER PROFILE:", data);

        if (!data.success) {
            message.textContent = data.message || "Unable to create employer profile.";
            message.className = "login-message show error";
            return;
        }

        message.textContent =  data.message || "Employer profile created successfully.";
        message.className = "login-message show success";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);

    } catch (error) {
        console.error("Create employer profile error:", error);

        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Create Profile";
    }
}

// LOAD EMPLOYER PROFILE

async function loadEmployerProfile() {
    const profileName = document.getElementById("employerProfileName");

    if (!profileName) {
        return;
    }

    const message = document.getElementById("employerProfileMessage");
    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer"
    ) {
        window.location.href = "login.html";
        return;
    }
    try {
        const response = await fetch(
                `${API_BASE}/employer/profile.php?log_id=${encodeURIComponent(logId)}`
            );
        const data = await response.json();

        console.log("EMPLOYER PROFILE:", data);

        if (!data.success || !data.employer) {
            if (message) {
                message.textContent = data.message || "Employer profile not found.";
                message.className = "login-message show error";}
            return;
        }
        const employer = data.employer;

        document.getElementById("employerProfileName").textContent = employer.ename || "Company";
        document.getElementById("employerProfileEmail").textContent = employer.email || "Email not available";
        document.getElementById("employerProfileType").value = employer.etype || "Not provided";
        document.getElementById("employerProfileIndustry").value = employer.industry || "Not provided";
        document.getElementById("employerProfileAddress").value = employer.address || "Not provided";
        document.getElementById("employerProfilePincode").value = employer.pincode || "Not provided";
        document.getElementById("employerProfileExecutive").value = employer.executive || "Not provided";
        document.getElementById("employerProfilePhone").value = employer.phone || "Not provided";
        document.getElementById("employerProfileLocation").value = employer.location || "Not provided";
        document.getElementById("employerProfileDescription").value = employer.profile || "Not provided";

    } catch (error) {

        console.error("Load employer profile error:",error);

        if (message) {
            message.textContent = "Unable to connect to server.";
            message.className = "login-message show error";
        }
    }
}

// LOAD EDIT EMPLOYER PROFILE

async function loadEditEmployerProfile() {
    const form = document.getElementById("editEmployerProfileForm");

    if (!form) {
        return;
    }

    const message = document.getElementById("editEmployerProfileMessage");
    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer") {
        window.location.href = "login.html";
        return;
    }
    try {
        const response = await fetch(
                `${API_BASE}/employer/profile.php?log_id=${encodeURIComponent(logId)}`
            );
        const data = await response.json();

        if (!data.success || !data.employer) {
            if (message) {
                message.textContent = data.message || "Employer profile not found.";
                message.className = "login-message show error";
            }
            return;
        }
        const employer = data.employer;

        document.getElementById("editEmployerId").value = employer.eid || "";
        document.getElementById("editEmployerName").value = employer.ename || "";
        document.getElementById("editEmployerType").value = employer.etype || "";
        document.getElementById("editEmployerIndustry").value = employer.industry || "";
        document.getElementById("editEmployerAddress").value = employer.address || "";
        document.getElementById("editEmployerPincode").value = employer.pincode || "";
        document.getElementById("editEmployerExecutive").value = employer.executive || "";
        document.getElementById("editEmployerPhone").value = employer.phone || "";
        document.getElementById("editEmployerLocation").value = employer.location || "";
        document.getElementById("editEmployerProfile").value = employer.profile || "";

    } catch (error) {
        console.error("Load edit employer profile error:",error);

        if (message) {
            message.textContent ="Unable to connect to server.";
            message.className ="login-message show error";
        }
    }
}

// UPDATE EMPLOYER PROFILE

async function updateEmployerProfile(event) {

    event.preventDefault();

    const form = document.getElementById("editEmployerProfileForm");
    const message = document.getElementById("editEmployerProfileMessage");
    const button = document.getElementById("editEmployerProfileButton");

    if (!form || !message || !button) {
        return;
    }

    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (!logId || usertype !== "Employer") {
        window.location.href = "login.html";
        return;
    }
    const formData = new FormData(form);

    button.disabled = true;
    button.textContent = "Saving...";

    message.className = "login-message";
    message.textContent = "";

    try {
        const response = await fetch(
                `${API_BASE}/employer/update_profile.php`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data = await response.json();

        console.log("UPDATE EMPLOYER PROFILE:", data);

        if (!data.success) {
            message.textContent =data.message || "Unable to update employer profile.";
            message.className = "login-message show error";
            return;
        }

        message.textContent = data.message || "Employer profile updated successfully.";
        message.className = "login-message show success";

        setTimeout(() => {
            window.location.href = "profile.html";
        }, 800);

    } catch (error) {
        console.error("Update employer profile error:", error);

        message.textContent = "Unable to connect to server.";
        message.className = "login-message show error";

    } finally {
        button.disabled = false;
        button.textContent = "Save Changes";
    }
}
function handleEmployerPostJob(event) {

    event.preventDefault();

    const logId = localStorage.getItem("log_id");
    const usertype = localStorage.getItem("usertype");

    if (logId && usertype === "Employer") {
        window.location.href = "employer/post-job.html";
        return;
    }

    window.location.href = "employer/login.html";
}