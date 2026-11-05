<>

document.addEventListener("DOMContentLoaded", function () {

    const accountType = document.getElementById("accountType");

    const professionSection = document.getElementById("professionSection");
    const businessSection = document.getElementById("businessSection");

    const profession = document.getElementById("profession");

    const businessName = document.getElementById("businessName");
    const businessCategory = document.getElementById("businessCategory");

    const registerForm = document.getElementById("registerForm");

    // Show the correct fields depending on account type

    function updateRegistrationFields() {

        professionSection.style.display = "none";
        businessSection.style.display = "none";

        profession.required = false;
        businessName.required = false;
        businessCategory.required = false;

        if (accountType.value === "professional") {

            professionSection.style.display = "block";
            profession.required = true;

        } else if (accountType.value === "business") {

            businessSection.style.display = "block";
            businessName.required = true;
            businessCategory.required = true;

        }
    }

    accountType.addEventListener("change", updateRegistrationFields);

    // Handle registration form

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const fullname = document.getElementById("fullname").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const neighborhood = document.getElementById("neighborhood").value;

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        if (accountType.value === "professional" && !profession.value) {
            alert("Por favor, escolha sua profissão.");
            return;
        }

        if (accountType.value === "business" &&
            (!businessName.value || !businessCategory.value)) {

            alert("Por favor, preencha os dados do seu negócio.");
            return;
        }

        // Save basic profile information for this browser session.
        // Never save passwords here.

        const userProfile = {
            fullname: fullname,
            email: email,
            phone: phone,
            neighborhood: neighborhood,
            accountType: accountType.value,
            profession: profession.value,
            businessName: businessName.value,
            businessCategory: businessCategory.value,
            businessDescription:
                document.getElementById("businessDescription")?.value || ""
        };

        sessionStorage.setItem(
            "bairroUser",
            JSON.stringify(userProfile)
        );

        alert("Cadastro validado com sucesso!");

        // Redirect according to account type

        if (accountType.value === "business") {

            window.location.href = "business-dashboard.html";

        } else if (accountType.value === "professional") {

            window.location.href = "professional-dashboard.html";

        }

    });

});
