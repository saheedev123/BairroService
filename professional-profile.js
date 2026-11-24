
const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:3000`;
const DEFAULT_PHOTO = "images/default-profile.png";

const params = new URLSearchParams(window.location.search);
const professionalId = params.get("id");

const statusMessage = document.getElementById("profileStatus");
const errorMessage = document.getElementById("profileError");
const profileSection = document.getElementById("publicProfile");

const token = sessionStorage.getItem("bairroToken");

let selectedRating = 0;
let hasExistingReview = false;

const professionNames = {
    electrician: "Eletricista",
    plumber: "Encanador",
    carpenter: "Carpinteiro",
    cleaning: "Limpeza",
    "home-repairs": "Reparos domésticos"
};


// Display stars for a rating
function makeStars(rating) {
    const roundedRating = Math.round(Number(rating) || 0);

    return "★".repeat(roundedRating) +
           "☆".repeat(5 - roundedRating);
}


// Select a rating using the five star buttons
function setSelectedRating(rating) {
    selectedRating = rating;

    document.getElementById("selectedRating").value = rating;

    document.querySelectorAll(".rating-choice").forEach(button => {
        const value = Number(button.dataset.rating);
        const active = value <= rating;

        button.textContent = active ? "★" : "☆";
        button.classList.toggle("selected", active);
        button.setAttribute("aria-pressed", String(value === rating));
    });
}


// Connect the star buttons
document.querySelectorAll(".rating-choice").forEach(button => {
    button.addEventListener("click", () => {
        setSelectedRating(Number(button.dataset.rating));
    });
});


// Load professional information
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

        const profileImage = document.getElementById("profileImage");

        profileImage.src = professional.photoUrl
            ? `${BACKEND_URL}${professional.photoUrl}`
            : DEFAULT_PHOTO;

        profileImage.alt = `Foto de ${professional.fullname}`;

        profileImage.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_PHOTO;
        };

        document.getElementById("profileName").textContent =
            professional.fullname || "Profissional";

        const profession = professional.profession || "";

        document.getElementById("profileProfession").textContent =
            professionNames[profession.toLowerCase()] || profession;

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

        // Load public reviews and customer review form
        await loadPublicReviews();
        await setupReviewForm();

    } catch (error) {
        console.error("Profile error:", error);

        statusMessage.hidden = true;
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
    }
}


// Load and display public reviews
async function loadPublicReviews() {
    const reviewsList = document.getElementById("publicReviewsList");

    try {
        const response = await fetch(
            `${BACKEND_URL}/api/professionals/${encodeURIComponent(professionalId)}/reviews`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Não foi possível carregar as avaliações.");
        }

        const averageRating = data.averageRating;
        const totalReviews = data.total || 0;

        document.getElementById("averageRating").textContent =
            totalReviews > 0 ? Number(averageRating).toFixed(1) : "—";

        document.getElementById("averageStars").textContent =
            totalReviews > 0 ? makeStars(averageRating) : "☆☆☆☆☆";

        document.getElementById("reviewCount").textContent =
            totalReviews === 1
                ? "1 avaliação"
                : `${totalReviews} avaliações`;

        reviewsList.innerHTML = "";

        if (totalReviews === 0) {
            reviewsList.innerHTML = `
                <p class="no-reviews">
                    Este profissional ainda não recebeu avaliações.
                    Seja o primeiro a compartilhar sua experiência!
                </p>
            `;
            return;
        }

        // Show newest reviews first
        const sortedReviews = [...(data.reviews || [])].sort(
            (a, b) =>
                new Date(b.updatedAt || b.createdAt) -
                new Date(a.updatedAt || a.createdAt)
        );

        sortedReviews.forEach(review => {
            const reviewCard = document.createElement("article");
            reviewCard.className = "customer-review";

            const reviewHeader = document.createElement("div");
            reviewHeader.className = "customer-review-header";

            const customerName = document.createElement("strong");
            customerName.textContent = review.customerName || "Cliente";

            const reviewDate = document.createElement("span");
            reviewDate.className = "review-date";

            const date = new Date(review.updatedAt || review.createdAt);

            reviewDate.textContent = Number.isNaN(date.getTime())
                ? ""
                : date.toLocaleDateString("pt-BR");

            reviewHeader.append(customerName, reviewDate);

            const stars = document.createElement("div");
            stars.className = "review-stars";
            stars.textContent = makeStars(review.rating);

            const comment = document.createElement("p");
            comment.className = "customer-review-comment";
            comment.textContent = review.comment;

            reviewCard.append(reviewHeader, stars, comment);
            reviewsList.appendChild(reviewCard);
        });

    } catch (error) {
        console.error("Reviews error:", error);

        reviewsList.innerHTML = `
            <p class="review-error">
                Não foi possível carregar as avaliações.
                Tente novamente mais tarde.
            </p>
        `;
    }
}


// Check the customer account and find an existing review
async function setupReviewForm() {
    const formSection = document.getElementById("reviewFormSection");
    const loginPrompt = document.getElementById("loginReviewPrompt");
    const customerOnlyMessage = document.getElementById("customerOnlyMessage");

    const savedUser = sessionStorage.getItem("bairroUser");

    if (!token || !savedUser) {
        loginPrompt.hidden = false;
        return;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        loginPrompt.hidden = false;
        return;
    }

    if (user.accountType !== "customer") {
        customerOnlyMessage.hidden = false;
        return;
    }

    formSection.hidden = false;

    try {
        const response = await fetch(
            `${BACKEND_URL}/api/my-reviews`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Não foi possível verificar sua avaliação.");
        }

        const existingReview = (data.reviews || []).find(
            review => String(review.professionalId) === professionalId
        );

        if (existingReview) {
            hasExistingReview = true;

            setSelectedRating(Number(existingReview.rating));

            document.getElementById("reviewComment").value =
                existingReview.comment || "";

            document.getElementById("reviewFormHint").textContent =
                "Você já avaliou este profissional. Você pode atualizar sua avaliação.";

            document.getElementById("submitReviewButton").textContent =
                "Atualizar avaliação";
        }

    } catch (error) {
        console.error("Existing review error:", error);

        document.getElementById("reviewFormMessage").textContent =
            "Não foi possível verificar sua avaliação anterior. Você ainda pode tentar enviar uma avaliação.";
    }
}


// Submit or update a review
document.getElementById("reviewForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const message = document.getElementById("reviewFormMessage");
        const submitButton = document.getElementById("submitReviewButton");

        const comment = document.getElementById("reviewComment")
            .value.trim();

        if (!selectedRating) {
            message.textContent = "Por favor, escolha uma nota de 1 a 5 estrelas.";
            message.className = "review-form-message error";
            return;
        }

        if (comment.length < 10 || comment.length > 1000) {
            message.textContent =
                "Sua avaliação deve ter entre 10 e 1000 caracteres.";
            message.className = "review-form-message error";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
        message.textContent = "";

        try {
            const response = await fetch(
                `${BACKEND_URL}/api/reviews`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        professionalId,
                        rating: selectedRating,
                        comment
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Não foi possível enviar sua avaliação."
                );
            }

            message.textContent = data.message;
            message.className = "review-form-message success";

            hasExistingReview = true;

            document.getElementById("reviewFormHint").textContent =
                "Sua avaliação foi salva. Você pode atualizá-la quando quiser.";

            submitButton.textContent = "Atualizar avaliação";

            // Refresh average rating and public comments
            await loadPublicReviews();

        } catch (error) {
            console.error("Review submission error:", error);

            message.textContent = error.message;
            message.className = "review-form-message error";

        } finally {
            submitButton.disabled = false;

            submitButton.textContent = hasExistingReview
                ? "Atualizar avaliação"
                : "Enviar avaliação";
        }
    }
);


// Start the profile page
loadProfessionalProfile();
