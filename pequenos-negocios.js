
const BACKEND_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;

const container = document.getElementById("businessContainer");
const searchInput = document.getElementById("businessSearch");
const categoryFilter = document.getElementById("businessCategoryFilter");

let businesses = [];

const DEFAULT_BUSINESS_CATEGORIES = {
    food: "Comidas e lanches",
    bakery: "Bolos e padarias",
    clothing: "Roupas e moda",
    joias: "Joias e acessórios",
    beauty: "Beleza e cosméticos",
    electronics: "Eletrônicos",
    other: "Outros negócios"
};


// Normalize category names for reliable matching
function normalizeCategory(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


// Display a friendly category name
function getBusinessCategory(value) {
    const normalized = normalizeCategory(value);

    return DEFAULT_BUSINESS_CATEGORIES[normalized] ||
        value ||
        "Pequeno negócio";
}


// Load public businesses from the backend
async function loadBusinesses() {

    try {
        container.innerHTML = "<p>Carregando pequenos negócios...</p>";

        const response = await fetch(
            `${BACKEND_URL}/api/businesses`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Não foi possível carregar os negócios."
            );
        }

        businesses = data.businesses || [];

        displayBusinesses(businesses);

    } catch (error) {

        console.error("Business directory error:", error);

        container.innerHTML = `
            <p>
                Não foi possível carregar os pequenos negócios.
                Verifique se o servidor está funcionando.
            </p>
        `;

        document.getElementById("businessTotal").textContent =
            "Não foi possível carregar os negócios.";
    }
}


// Display business cards
function displayBusinesses(list) {

    container.innerHTML = "";

    document.getElementById("businessTotal").textContent =
        list.length === 1
            ? "1 negócio encontrado"
            : `${list.length} negócios encontrados`;

    if (list.length === 0) {

        container.innerHTML = `
            <div class="business-empty">
                <h3>Nenhum negócio encontrado</h3>
                <p>
                    Tente pesquisar outro nome, bairro ou categoria.
                </p>
            </div>
        `;

        return;
    }

    list.forEach(business => {

        const card = document.createElement("article");
        card.className = "business-card";

        // Business cover image or fallback
        const imageArea = document.createElement("div");
        imageArea.className = "business-card-image";

        if (business.coverImageUrl) {

            const image = document.createElement("img");

            image.src = `${BACKEND_URL}${business.coverImageUrl}`;
            image.alt = `Produtos de ${business.businessName}`;

            image.onerror = function () {
                this.style.display = "none";

                const placeholder = document.createElement("div");
                placeholder.className = "business-image-placeholder";
                placeholder.textContent = "Foto não disponível";

                imageArea.appendChild(placeholder);
            };

            imageArea.appendChild(image);

        } else {

            const placeholder = document.createElement("div");
            placeholder.className = "business-image-placeholder";
            placeholder.textContent = "Produtos em breve";

            imageArea.appendChild(placeholder);
        }

        // Business information
        const info = document.createElement("div");
        info.className = "business-card-info";

        const name = document.createElement("h3");
        name.textContent = business.businessName || "Pequeno negócio";

const businessLogo = document.createElement("img");

businessLogo.className = "business-card-logo";
businessLogo.alt = `Logo de ${business.businessName}`;

if (business.logoUrl) {
    businessLogo.src = `${BACKEND_URL}${business.logoUrl}`;

    businessLogo.onerror = function () {
        this.remove();
    };
} else {
    businessLogo.hidden = true;
}


        const category = document.createElement("p");
        category.className = "business-category";
        category.textContent =
            getBusinessCategory(business.businessCategory);

        const neighborhood = document.createElement("p");
        neighborhood.className = "business-neighborhood";
        neighborhood.textContent =
            `📍 ${business.neighborhood || "Localização não informada"}`;

        const description = document.createElement("p");
        description.className = "business-description";
        description.textContent =
            business.businessDescription || "Conheça nossos produtos.";

        const productCount = document.createElement("p");
        productCount.className = "business-product-count";

        const count = Number(business.productCount) || 0;

        productCount.textContent = count === 1
            ? "1 produto disponível"
            : `${count} produtos disponíveis`;

        const profileLink = document.createElement("a");

        profileLink.className = "business-profile-button";
        profileLink.href =
            `business-profile.html?id=${encodeURIComponent(business.id)}`;

        profileLink.textContent = "Ver negócio";

        info.append(
            name,
            category,
            neighborhood,
            description,
            productCount,
            profileLink
        );

        card.append(imageArea, info);

        container.appendChild(card);
    });
}


// Search by business name, neighborhood, description or category
function searchBusinesses() {

    const search = searchInput.value.trim().toLowerCase();
    const selectedCategory = normalizeCategory(categoryFilter.value);

    const results = businesses.filter(business => {

        const searchableText = [
            business.businessName,
            business.neighborhood,
            business.businessDescription,
            getBusinessCategory(business.businessCategory)
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(search);

        const matchesCategory =
            !selectedCategory ||
            normalizeCategory(business.businessCategory) === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayBusinesses(results);
}


// Search when filters change
searchInput.addEventListener("input", searchBusinesses);
categoryFilter.addEventListener("change", searchBusinesses);


// Load directory when page opens
loadBusinesses();
