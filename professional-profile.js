const BACKEND_URL = `http://${window.location.hostname}:3000`;
const DEFAULT_PHOTO = "images/default-profile.png";

const params = new URLSearchParams(window.location.search);
const professionalId = params.get("id");

const statusMessage = document.getElementById("profileStatus");
const errorMessage = document.getElementById("profileError");
const profileSection = document.getElementById("publicProfile");

const professionNames = {
    electrician: "Eletricista",
    plumber: "Encanador",
    carpenter: "Carpinteiro",
    cleaner: "Serviços de limpeza"
};

async function loadProfessionalProfile() {
    try {
        if (!professionalId) {
            throw new Error("Perfil profissional não encontrado.");
        }

        const response = await fetch(
            `${BACKEND_URL}/api/professionals`
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar os profissionais.");
        }

        const data = await response.json();

        const professional = (data.professionals || []).find(
            person => String(person.id) === professionalId
        );

        if (!professional) {
            throw new Error("Este profissional não foi encontrado.");
        }

        // Profile picture
        const profileImage = document.getElementById("profileImage");

        profileImage.src = professional.photoUrl
            ? `${BACKEND_URL}${professional.photoUrl}`
            : DEFAULT_PHOTO;

        profileImage.alt = `Foto de ${professional.fullname}`;

        profileImage.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_PHOTO;
        };

        // Professional information
        document.getElementById("profileName").textContent =
            professional.fullname || "Profissional";

        const profession = professional.profession || "";

        document.getElementById("profileProfession").textContent =
            professionNames[profession.toLowerCase()] ||
            profession;

        document.getElementById("profileNeighborhood").textContent =
            professional.neighborhood
                ? `📍 ${professional.neighborhood}`
                : "Localização não informada";

        document.getElementById("profileDescription").textContent =
            professional.serviceDescription ||
            "Descrição ainda não adicionada.";

        document.getElementById("profileExperience").textContent =
            professional.experience ||
            "Experiência ainda não informada.";

        // WhatsApp contact
        const whatsappButton = document.getElementById("whatsappButton");

        if (professional.whatsappLink) {
            whatsappButton.href =
                professional.whatsappLink +
                "?text=" +
                encodeURIComponent(
                    `Olá ${professional.fullname}, encontrei seu perfil no BairroServices e gostaria de saber mais sobre seus serviços.`
                );
        } else {
            whatsappButton.hidden = true;
        }

        statusMessage.hidden = true;
        profileSection.hidden = false;

        document.title =
            `${professional.fullname} | BairroServices`;

    } catch (error) {
        console.error("Profile error:", error);

        statusMessage.hidden = true;
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
    }
}

loadProfessionalProfile();
