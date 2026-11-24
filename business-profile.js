
const BACKEND_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;

const params = new URLSearchParams(window.location.search);
const businessId = params.get("id");
const customerToken = sessionStorage.getItem("bairroToken");

let selectedProduct = null;
let currentBusinessWhatsapp = null;
let currentBusinessName = "";

const status = document.getElementById("businessProfileStatus");
const errorMessage = document.getElementById("businessProfileError");
const profileContent = document.getElementById("businessProfileContent");
const productsContainer = document.getElementById("publicProductsContainer");

const DEFAULT_BUSINESS_CATEGORIES = {
    food: "Comidas e lanches",
    bakery: "Bolos e padarias",
    clothing: "Roupas e moda",
    joias: "Joias e acessórios",
    beauty: "Beleza e cosméticos",
    electronics: "Eletrônicos",
    other: "Outros negócios"
};


function normalizeCategory(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


function getBusinessCategory(value) {
    const normalized = normalizeCategory(value);

    return DEFAULT_BUSINESS_CATEGORIES[normalized] ||
        value ||
        "Pequeno negócio";
}


// Format prices in Brazilian currency
function formatPrice(price) {
    return Number(price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// Display all business products
function displayBusinessProducts(products, whatsappLink, businessName) {

    productsContainer.innerHTML = "";

    if (!products || products.length === 0) {

        productsContainer.innerHTML = `
            <div class="business-empty">
                <h3>Nenhum produto cadastrado ainda</h3>
                <p>Volte em breve para conhecer os produtos deste negócio.</p>
            </div>
        `;

        return;
    }

    products.forEach(product => {

        const card = document.createElement("article");
        card.className = "public-product-card";

        // Product image
        const imageArea = document.createElement("div");
        imageArea.className = "public-product-image";

        if (product.imageUrl) {

            const image = document.createElement("img");

            image.src = `${BACKEND_URL}${product.imageUrl}`;
            image.alt = product.name || "Produto";

            image.onerror = function () {
                this.style.display = "none";

                const placeholder = document.createElement("div");
                placeholder.className = "product-image-placeholder";
                placeholder.textContent = "Foto não disponível";

                imageArea.appendChild(placeholder);
            };

            imageArea.appendChild(image);

        } else {

            const placeholder = document.createElement("div");
            placeholder.className = "product-image-placeholder";
            placeholder.textContent = "Foto não disponível";

            imageArea.appendChild(placeholder);
        }

        // Product information
        const info = document.createElement("div");
        info.className = "public-product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "Produto";

        const category = document.createElement("p");
        category.className = "public-product-category";
        category.textContent = product.category || "";

        const price = document.createElement("p");
        price.className = "public-product-price";
        price.textContent = formatPrice(product.price);

        const description = document.createElement("p");
        description.className = "public-product-description";
        description.textContent =
            product.description || "Consulte o vendedor para mais informações.";

        info.append(name, category, price, description);

        // Contact the business about this product
        if (whatsappLink) {

            const contactButton = document.createElement("a");

            contactButton.className = "product-contact-button";

            contactButton.href =
                whatsappLink +
                "?text=" +
                encodeURIComponent(
                    `Olá! Encontrei o produto "${product.name}" no perfil de ${businessName} no BairroServices. Gostaria de mais informações.`
                );

            contactButton.target = "_blank";
            contactButton.rel = "noopener noreferrer";
            contactButton.textContent = "Consultar pelo WhatsApp";

            info.appendChild(contactButton);
        }

// Product order enquiry button
const orderButton = document.createElement("button");

orderButton.type = "button";
orderButton.className = "product-order-button";
orderButton.textContent = "Solicitar produto";

orderButton.addEventListener("click", () => {
    openProductEnquiry(product);
});

info.appendChild(orderButton);

        card.append(imageArea, info);

        productsContainer.appendChild(card);
    });
}


// Open the product enquiry form
function openProductEnquiry(product) {

    let user = null;

    try {
        user = JSON.parse(
            sessionStorage.getItem("bairroUser") || "null"
        );
    } catch (error) {
        user = null;
    }

    if (!customerToken || !user) {
        alert("Entre na sua conta de cliente para solicitar um produto.");
        window.location.href = "login.html";
        return;
    }

    if (user.accountType !== "customer") {
        alert("Somente clientes podem solicitar produtos.");
        return;
    }

    selectedProduct = product;

    const section = document.getElementById("orderEnquirySection");

    document.getElementById("selectedProductInfo").textContent =
        `${product.name} — ${Number(product.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`;

    document.getElementById("orderQuantity").value = 1;
    document.getElementById("orderMessage").value = "";

    document.getElementById("orderMessageStatus").textContent = "";

    document.getElementById("orderWhatsappLink").hidden = true;

    document.getElementById("sendOrderButton").disabled = false;
    document.getElementById("sendOrderButton").textContent =
        "Enviar solicitação";

    section.hidden = false;

    section.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// Cancel the product enquiry
document.getElementById("cancelOrderButton").addEventListener(
    "click",
    function () {

        document.getElementById("orderEnquirySection").hidden = true;

        document.getElementById("orderEnquiryForm").reset();

        document.getElementById("orderMessageStatus").textContent = "";

        document.getElementById("orderWhatsappLink").hidden = true;

        selectedProduct = null;
    }
);


// Submit product enquiry to the backend
document.getElementById("orderEnquiryForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        if (!selectedProduct) {
            alert("Selecione um produto primeiro.");
            return;
        }

        const quantity = Number(
            document.getElementById("orderQuantity").value
        );

        const message = document
            .getElementById("orderMessage")
            .value.trim();

        const status = document.getElementById("orderMessageStatus");
        const button = document.getElementById("sendOrderButton");

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            status.textContent = "Escolha uma quantidade entre 1 e 99.";
            return;
        }

        button.disabled = true;
        button.textContent = "Enviando...";

        status.textContent = "";

        try {

            const response = await fetch(
                `${BACKEND_URL}/api/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${customerToken}`
                    },
                    body: JSON.stringify({
                        productId: selectedProduct.id,
                        quantity,
                        message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Não foi possível enviar sua solicitação."
                );
            }

            status.textContent =
                "Sua solicitação foi enviada e salva com sucesso!";

            status.style.color = "#26734d";

            // Offer to continue the conversation through WhatsApp
            const whatsappLink =
                document.getElementById("orderWhatsappLink");

            if (currentBusinessWhatsapp) {

                const whatsappMessage =
                    `Olá ${currentBusinessName}! Enviei uma solicitação pelo BairroServices.\n\n` +
                    `Produto: ${selectedProduct.name}\n` +
                    `Quantidade: ${quantity}\n` +
                    `Valor estimado: ${(Number(selectedProduct.price) * quantity).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    })}\n\n` +
                    `Minha mensagem: ${message || "Gostaria de mais informações sobre o produto."}`;

                whatsappLink.href =
                    currentBusinessWhatsapp +
                    "?text=" +
                    encodeURIComponent(whatsappMessage);

                whatsappLink.hidden = false;

            }

            button.textContent = "Solicitação enviada";

        } catch (error) {

            console.error("Order enquiry error:", error);

            status.textContent = error.message;
            status.style.color = "#b83232";

            button.disabled = false;
            button.textContent = "Enviar solicitação";
        }
    }
);

// Load selected business and products
async function loadBusinessProfile() {

    try {

        if (!businessId) {
            throw new Error("Identificação do negócio não encontrada.");
        }

        const response = await fetch(
            `${BACKEND_URL}/api/businesses/${encodeURIComponent(businessId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Não foi possível carregar este negócio."
            );
        }

        const business = data.business;
        const products = data.products || [];
        // Save business contact details for product enquiries
currentBusinessWhatsapp = business.whatsappLink || null;
currentBusinessName = business.businessName || "o negócio";

        if (!business) {
            throw new Error("Negócio não encontrado.");
        }

        // Display the business logo
const businessLogo = document.getElementById("publicBusinessLogo");

if (business.logoUrl) {
    businessLogo.src = `${BACKEND_URL}${business.logoUrl}`;
    businessLogo.hidden = false;

    businessLogo.onerror = function () {
        this.onerror = null;
        this.hidden = true;
    };
} else {
    businessLogo.hidden = true;
}

        // Business information
        document.getElementById("publicBusinessName").textContent =
            business.businessName || "Pequeno negócio";

        document.getElementById("publicBusinessCategory").textContent =
            getBusinessCategory(business.businessCategory);

        document.getElementById("publicBusinessNeighborhood").textContent =
            business.neighborhood
                ? `📍 ${business.neighborhood}`
                : "Localização não informada";

        document.getElementById("publicBusinessDescription").textContent =
            business.businessDescription ||
            "Conheça os produtos deste pequeno negócio.";

        document.getElementById("publicProductCount").textContent =
            data.totalProducts === 1
                ? "1 produto disponível"
                : `${data.totalProducts || 0} produtos disponíveis`;

        // Business cover image
        const cover = document.getElementById("businessCover");
        const placeholder = document.getElementById("businessCoverPlaceholder");

        if (business.coverImageUrl) {

            cover.src = `${BACKEND_URL}${business.coverImageUrl}`;

            cover.onload = function () {
                cover.hidden = false;
                placeholder.hidden = true;
            };

            cover.onerror = function () {
                cover.hidden = true;
                placeholder.hidden = false;
            };

        } else {

            cover.hidden = true;
            placeholder.hidden = false;
        }

        // Business WhatsApp contact
        const whatsappButton = document.getElementById("businessWhatsapp");

        if (business.whatsappLink) {

            whatsappButton.href =
                business.whatsappLink +
                "?text=" +
                encodeURIComponent(
                    `Olá ${business.businessName}, encontrei seu negócio no BairroServices e gostaria de saber mais sobre seus produtos.`
                );

            whatsappButton.hidden = false;

        } else {

            whatsappButton.hidden = true;
        }

        // Display products
        displayBusinessProducts(
            products,
            business.whatsappLink,
            business.businessName
        );

        document.title =
            `${business.businessName} | BairroServices`;

        status.hidden = true;
        profileContent.hidden = false;

    } catch (error) {

        console.error("Business profile error:", error);

        status.hidden = true;
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
    }
}


loadBusinessProfile();
