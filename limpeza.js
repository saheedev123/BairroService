
const container = document.getElementById("limpezaContainer");

let profissionaisLimpeza = [];

const BACKEND_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;

const DEFAULT_PHOTO = "images/default-profile.png";


// Load registered cleaning professionals
async function loadProfissionaisLimpeza() {
    try {
        container.innerHTML = "<p>Carregando profissionais de limpeza...</p>";

        const response = await fetch(
            `${BACKEND_URL}/api/professionals`
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar os profissionais.");
        }

        const data = await response.json();

        profissionaisLimpeza = (data.professionals || []).filter(person =>
            (person.profession || "").toLowerCase() === "cleaning"
        );

        displayProfissionaisLimpeza(profissionaisLimpeza);

    } catch (error) {
        console.error("Erro:", error);

        container.innerHTML = `
            <p>Não foi possível carregar os profissionais de limpeza.
            Verifique se o servidor está funcionando.</p>
        `;
    }
}


// Display cleaning professional cards
function displayProfissionaisLimpeza(list) {
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `
            <p>Nenhum profissional de limpeza encontrado nesta região.</p>
        `;
        return;
    }

    list.forEach(person => {

        const card = document.createElement("div");
        card.className = "professional-card";

        // Professional profile picture
        const photo = document.createElement("img");

        photo.className = "professional-photo";

        photo.src = person.photoUrl
            ? `${BACKEND_URL}${person.photoUrl}`
            : DEFAULT_PHOTO;

        photo.alt = `Foto de ${person.fullname || "Profissional"}`;

        photo.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_PHOTO;
        };

        // Professional information
        const info = document.createElement("div");
        info.className = "professional-info";

        const name = document.createElement("h3");
        name.textContent = person.fullname || "Profissional";

        const profession = document.createElement("p");
        profession.className = "profession-label";
        profession.textContent = "Profissional de limpeza";

        // Genuine customer ratings
        const review = document.createElement("div");
        review.className = "review-summary";

        const stars = document.createElement("span");
        stars.className = "review-stars";

        const totalReviews = Number(person.reviewCount) || 0;
        const averageRating = Number(person.averageRating) || 0;

        const filledStars = totalReviews > 0
            ? Math.max(0, Math.min(5, Math.round(averageRating)))
            : 0;

        stars.textContent =
            "★".repeat(filledStars) +
            "☆".repeat(5 - filledStars);

        const reviewText = document.createElement("span");
        reviewText.className = "review-text";

        reviewText.textContent = totalReviews > 0
            ? `${averageRating.toFixed(1)} (${totalReviews} ${
                totalReviews === 1 ? "avaliação" : "avaliações"
              })`
            : "Ainda sem avaliações";

        review.append(stars, reviewText);

        // View professional profile
        const viewProfile = document.createElement("a");

        viewProfile.className = "view-profile-button";
        viewProfile.textContent = "Ver perfil";

        viewProfile.href =
            `professional-profile.html?id=${encodeURIComponent(person.id)}`;

        info.append(name, profession, review, viewProfile);

        card.append(photo, info);

        container.appendChild(card);
    });
}


// Search by name, neighborhood or service
function searchProfissionaisLimpeza() {
    const search = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const results = profissionaisLimpeza.filter(person =>
        (person.fullname || "").toLowerCase().includes(search) ||
        (person.neighborhood || "").toLowerCase().includes(search) ||
        (person.serviceDescription || "").toLowerCase().includes(search)
    );

    displayProfissionaisLimpeza(results);
}


// Load professionals when page opens
loadProfissionaisLimpeza();
