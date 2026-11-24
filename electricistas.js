
const container = document.getElementById("electricistasContainer");

let electricians = [];
const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:3000`;
const DEFAULT_PHOTO = "images/default-profile.png";

// Load registered electricians
async function loadElectricistas() {
    try {
        container.innerHTML = "<p>Carregando eletricistas...</p>";

        const response = await fetch(
            `${BACKEND_URL}/api/professionals`
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar os profissionais.");
        }

        const data = await response.json();

        electricians = (data.professionals || []).filter(person =>
            (person.profession || "").toLowerCase() === "electrician"
        );

        displayElectricians(electricians);

    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = `
            <p>Não foi possível carregar os eletricistas.
            Verifique se o servidor está funcionando.</p>
        `;
    }
}


// Display professional cards
function displayElectricians(list) {
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `
            <p>Nenhum eletricista encontrado nesta região.</p>
        `;
        return;
    }

    list.forEach(person => {
        const card = document.createElement("div");
        card.className = "professional-card";

        // Profile picture
        const photo = document.createElement("img");
        photo.className = "professional-photo";
        photo.src = person.photoUrl
            ? `${BACKEND_URL}${person.photoUrl}`
            : DEFAULT_PHOTO;

        photo.alt = `Foto de ${person.fullname}`;

        photo.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_PHOTO;
        };

        // Card information
        const info = document.createElement("div");
        info.className = "professional-info";

        const name = document.createElement("h3");
        name.textContent = person.fullname || "Profissional";

        const profession = document.createElement("p");
        profession.className = "profession-label";
        profession.textContent = "Eletricista";

        // Reviews placeholder until real reviews are implemented
     
        // Display genuine customer ratings
       
        // Display genuine customer ratings
        const review = document.createElement("div");
        review.className = "review-summary";

        const stars = document.createElement("span");
        stars.className = "review-stars";

        const totalReviews = Number(person.reviewCount) || 0;
        const averageRating = Number(person.averageRating) || 0;

        const filledStars = totalReviews > 0
            ? Math.round(averageRating)
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

        // View profile link
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


// Search by name, neighborhood or description
function searchElectricistas() {
    const search = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const results = electricians.filter(person => {
        return (
            (person.fullname || "").toLowerCase().includes(search) ||
            (person.neighborhood || "").toLowerCase().includes(search) ||
            (person.serviceDescription || "").toLowerCase().includes(search)
        );
    });

    displayElectricians(results);
}


// Load directory when page opens
loadElectricistas();
