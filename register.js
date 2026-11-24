
document.addEventListener("DOMContentLoaded", function () {

    const accountType = document.getElementById("accountType");
    const professionSection = document.getElementById("professionSection");
    const businessSection = document.getElementById("businessSection");

    const profession = document.getElementById("profession");
    const businessName = document.getElementById("businessName");
    const businessCategory = document.getElementById("businessCategory");

    const registerForm = document.getElementById("registerForm");

    // Show the correct registration fields
    function updateRegistrationFields() {

        professionSection.style.display = "none";
        businessSection.style.display = "none";

        profession.required = false;
        businessName.required = false;
        businessCategory.required = false;

        if (accountType.value === "professional") {
            professionSection.style.display = "block";
            profession.required = true;
        }

        if (accountType.value === "business") {
            businessSection.style.display = "block";
            businessName.required = true;
            businessCategory.required = true;
        }
    }

    accountType.addEventListener("change", updateRegistrationFields);
    updateRegistrationFields();

    // Registration form submission
    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Your passwords do not match!");
            return;
        }

        const userData = {
            fullname: document.getElementById("fullname").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            neighborhood: document.getElementById("neighborhood").value.trim(),
            accountType: accountType.value,
            profession: profession.value,
            businessName: businessName.value.trim(),
            businessCategory: businessCategory.value,
            businessDescription: document.getElementById("businessDescription").value.trim(),
            password: password
        };

        try {

            const response = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Registration failed.");
                return;
            }

          
console.log("Registration successful!");
console.log("Account type:", userData.accountType);

// Save the registered user's profile in this browser session
const dashboardUser = {
    fullname: userData.fullname,
    email: userData.email,
    phone: userData.phone,
    neighborhood: userData.neighborhood,
    accountType: userData.accountType,
    profession: userData.profession,
    businessName: userData.businessName,
    businessCategory: userData.businessCategory,
    businessDescription: userData.businessDescription
};

sessionStorage.setItem(
    "bairroUser",
    JSON.stringify(dashboardUser)
);



            // Redirect users to their dashboards
          // Redirect users according to their account type

if (userData.accountType === "customer") {

    alert("Sua conta de cliente foi criada! Faça login para continuar.");

    window.location.href = "./login.html";

} else if (userData.accountType === "professional") {

    window.location.href = "./professional-dashboard.html";

} else if (userData.accountType === "business") {

    window.location.href = "./smallbusiness-dashboard.html";

}

        } catch (error) {

            console.error("Registration error:", error);

            alert("Unable to connect to the server. Please check your backend.");

        }

    });

});
