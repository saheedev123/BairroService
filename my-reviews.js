
const BACKEND_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;

const token = sessionStorage.getItem("bairroToken");

const reviewsList = document.getElementById("myReviewsList");
const reviewsStatus = document.getElementById("reviewsStatus");
const reviewsError = document.getElementById("reviewsError");
const emptyReviews = document.getElementById("emptyReviews");

const professionNames = {
    electrician: "Eletricista",
    plumber: "Encanador",
    carpenter: "Carpinteiro",
    cleaning: "Limpeza",
    "home-repairs": "Reparos domésticos"
};

function formatStars(rating) {
    const value = Number(rating) || 0;

    return "★".repeat(value) + "☆".repeat(5 - value);
}

function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("pt-BR");
}


// Create an individual review card
function createReviewCard(review) {

    const card = document.createElement("article");
    card.className = "my-review-card";

    const header = document.createElement("div");
    header.className = "my-review-header";

    const professionalInfo = document.createElement("div");

    const name = document.createElement("h2");
    name.textContent = review.professionalName || "Profissional";

    const profession = document.createElement("p");
    profession.className = "my-review-profession";

    profession.textContent =
        professionNames[(review.profession || "").toLowerCase()] ||
        review.profession ||
        "Profissional";

    professionalInfo.append(name, profession);

    const neighborhood = document.createElement("p");
    neighborhood.className = "my-review-neighborhood";

    neighborhood.textContent = review.neighborhood
        ? `📍 ${review.neighborhood}`
        : "";

    header.append(professionalInfo, neighborhood);

    // Rating
    const rating = document.createElement("div");
    rating.className = "my-review-rating";
    rating.textContent = formatStars(review.rating);

    const ratingNumber = document.createElement("span");
    ratingNumber.className = "my-review-rating-number";
    ratingNumber.textContent = `${review.rating}/5`;

    rating.appendChild(ratingNumber);

    // Comment
    const comment = document.createElement("p");
    comment.className = "my-review-comment";
    comment.textContent = review.comment || "";

    // Date
    const date = document.createElement("p");
    date.className = "my-review-date";

    const wasUpdated =
        review.updatedAt &&
        review.createdAt &&
        review.updatedAt !== review.createdAt;

    date.textContent = wasUpdated
        ? `Última atualização: ${formatDate(review.updatedAt)}`
        : `Enviada em: ${formatDate(review.createdAt)}`;

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "my-review-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-review-button";
    editButton.textContent = "Editar avaliação";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-review-button";
    deleteButton.textContent = "Excluir avaliação";

    editButton.addEventListener("click", () => {
        showEditForm(card, review);
    });

    deleteButton.addEventListener("click", () => {
        deleteReview(review.id, deleteButton);
    });

    actions.append(editButton, deleteButton);

    // Link to professional profile
    const profileLink = document.createElement("a");

    profileLink.className = "my-review-button";
    profileLink.href =
        `professional-profile.html?id=${encodeURIComponent(review.professionalId)}`;

    profileLink.textContent = "Ver perfil do profissional";

    card.append(
        header,
        rating,
        comment,
        date,
        actions,
        profileLink
    );

    return card;
}


// Display the inline editing form
function showEditForm(card, review) {

    // Prevent opening multiple editing forms
    if (card.querySelector(".my-review-edit-form")) {
        return;
    }

    const form = document.createElement("form");
    form.className = "my-review-edit-form";

    const heading = document.createElement("h3");
    heading.textContent = "Atualizar sua avaliação";

    const label = document.createElement("label");
    label.textContent = "Sua nova nota";

    const starContainer = document.createElement("div");
    starContainer.className = "edit-rating-picker";

    let newRating = Number(review.rating);

    function updateStars() {
        starContainer.querySelectorAll("button").forEach(button => {
            const value = Number(button.dataset.rating);
            const active = value <= newRating;

            button.textContent = active ? "★" : "☆";
            button.classList.toggle("selected", active);
            button.setAttribute(
                "aria-pressed",
                String(value === newRating)
            );
        });
    }

    for (let i = 1; i <= 5; i++) {
        const starButton = document.createElement("button");

        starButton.type = "button";
        starButton.dataset.rating = i;
        starButton.textContent = "☆";
        starButton.setAttribute("aria-label", `${i} estrelas`);

        starButton.addEventListener("click", () => {
            newRating = i;
            updateStars();
        });

        starContainer.appendChild(starButton);
    }

    updateStars();

    const commentLabel = document.createElement("label");
    commentLabel.textContent = "Seu comentário";

    const textarea = document.createElement("textarea");
    textarea.value = review.comment || "";
    textarea.minLength = 10;
    textarea.maxLength = 1000;
    textarea.rows = 5;
    textarea.required = true;

    const message = document.createElement("p");
    message.className = "edit-review-message";
    message.setAttribute("role", "status");

    const buttons = document.createElement("div");
    buttons.className = "edit-review-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "edit-review-save";
    saveButton.textContent = "Salvar alterações";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "edit-review-cancel";
    cancelButton.textContent = "Cancelar";

    cancelButton.addEventListener("click", () => {
        form.remove();
    });

    buttons.append(saveButton, cancelButton);

    form.append(
        heading,
        label,
        starContainer,
        commentLabel,
        textarea,
        message,
        buttons
    );

    card.appendChild(form);

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const newComment = textarea.value.trim();

        if (!newRating) {
            message.textContent = "Escolha uma nota.";
            return;
        }

        if (newComment.length < 10 || newComment.length > 1000) {
            message.textContent =
                "O comentário deve ter entre 10 e 1000 caracteres.";
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Salvando...";

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
                        professionalId: review.professionalId,
                        rating: newRating,
                        comment: newComment
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Não foi possível atualizar a avaliação."
                );
            }

            await loadMyReviews();

        } catch (error) {
            message.textContent = error.message;
            saveButton.disabled = false;
            saveButton.textContent = "Salvar alterações";
        }
    });
}


// Delete a review
async function deleteReview(reviewId, button) {

    const confirmed = window.confirm(
        "Tem certeza de que deseja excluir esta avaliação?"
    );

    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "Excluindo...";

    try {
        const response = await fetch(
            `${BACKEND_URL}/api/reviews/${encodeURIComponent(reviewId)}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Não foi possível excluir a avaliação."
            );
        }

        await loadMyReviews();

    } catch (error) {
        alert(error.message);

        button.disabled = false;
        button.textContent = "Excluir avaliação";
    }
}


// Load customer reviews
async function loadMyReviews() {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    reviewsStatus.hidden = false;
    reviewsStatus.textContent = "Carregando suas avaliações...";

    reviewsError.hidden = true;
    emptyReviews.hidden = true;
    reviewsList.innerHTML = "";

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

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("bairroToken");
            sessionStorage.removeItem("bairroUser");

            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Não foi possível carregar suas avaliações."
            );
        }

        const reviews = data.reviews || [];

        document.getElementById("totalReviews").textContent =
            reviews.length;

        reviewsStatus.hidden = true;

        if (reviews.length === 0) {
            emptyReviews.hidden = false;
            return;
        }

        reviews.forEach(review => {
            reviewsList.appendChild(createReviewCard(review));
        });

    } catch (error) {

        console.error("My reviews error:", error);

        reviewsStatus.hidden = true;
        reviewsError.hidden = false;
        reviewsError.textContent = error.message;
    }
}


// Verify account and start
const savedUser = sessionStorage.getItem("bairroUser");

if (!token || !savedUser) {

    window.location.href = "login.html";

} else {

    try {
        const user = JSON.parse(savedUser);

        if (user.accountType !== "customer") {
            reviewsStatus.hidden = true;
            reviewsError.hidden = false;

            reviewsError.textContent =
                "Esta página está disponível somente para clientes.";

        } else {
            loadMyReviews();
        }

    } catch (error) {

        sessionStorage.removeItem("bairroUser");
        sessionStorage.removeItem("bairroToken");

        window.location.href = "login.html";
    }
}
