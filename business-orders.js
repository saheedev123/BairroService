
const BACKEND_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;

const token = sessionStorage.getItem("bairroToken");
const savedUser = sessionStorage.getItem("bairroUser");
console.log("Token exists:", !!token);
console.log("Saved user:", savedUser ? JSON.parse(savedUser) : null);

const ordersContainer = document.getElementById("ordersContainer");
const loading = document.getElementById("ordersLoading");
const errorMessage = document.getElementById("ordersError");
const totalOrders = document.getElementById("totalOrders");

// Check business owner login
if (!token || !savedUser) {
    alert("Faça login para acessar suas solicitações.");
    window.location.href = "login.html";
} else {
    try {
        const user = JSON.parse(savedUser);

        if (user.accountType !== "business") {
            alert("Esta página é exclusiva para pequenos negócios.");
            window.location.href = "login.html";
        } else {
            loadBusinessOrders();
        }

    } catch (error) {
        console.error("User information error:", error);
        window.location.href = "login.html";
    }
}

// Format prices in Brazilian currency
function formatPrice(price) {
    return Number(price || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Format dates
function formatDate(date) {
    return new Date(date).toLocaleString("pt-BR");
}

// Display orders
function displayOrders(orders) {
    ordersContainer.innerHTML = "";
    totalOrders.textContent = orders.length;

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty">
                <h2>Nenhuma solicitação recebida ainda.</h2>
                <p>Quando um cliente solicitar um produto, ele aparecerá aqui.</p>
            </div>
        `;
        return;
    }

    orders.forEach(order => {
        const card = document.createElement("article");
        card.className = "order-card";

        const heading = document.createElement("h2");
        heading.textContent = order.productName || "Produto";

        const details = document.createElement("div");

        const fields = [
            ["Cliente", order.customerName],
            ["Telefone", order.customerPhone],
            ["Bairro", order.customerNeighborhood],
            ["Quantidade", order.quantity],
            ["Preço unitário", formatPrice(order.productPrice)],
            ["Total estimado", formatPrice(order.totalPrice)],
            ["Mensagem", order.message || "Nenhuma mensagem"],
            ["Recebido em", formatDate(order.createdAt)]
        ];

        fields.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = `${label}: ${value ?? "-"}`;
            details.appendChild(paragraph);
        });

        
const status = document.createElement("span");
status.className = "order-status";
status.textContent = `Status: ${order.status || "Pendente"}`;

const statusSelect = document.createElement("select");

const availableStatuses = [
    "Pendente",
    "Aceito",
    "Concluído",
    "Cancelado"
];

availableStatuses.forEach(optionValue => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;

    if ((order.status || "Pendente") === optionValue) {
        option.selected = true;
    }

    statusSelect.appendChild(option);
});

const updateButton = document.createElement("button");
updateButton.textContent = "Atualizar status";
updateButton.type = "button";

updateButton.addEventListener("click", async () => {
    updateButton.disabled = true;
    updateButton.textContent = "Atualizando...";

    try {
        const response = await fetch(
            `${BACKEND_URL}/api/business/orders/${encodeURIComponent(order.id)}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: statusSelect.value
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Não foi possível atualizar.");
        }

        status.textContent = `Status: ${data.order.status}`;
        alert("Status atualizado com sucesso!");

    } catch (error) {
        console.error("Status update error:", error);
        alert(error.message);
    } finally {
        updateButton.disabled = false;
        updateButton.textContent = "Atualizar status";
    }
});

const whatsappButton = document.createElement("a");

whatsappButton.textContent = "Contactar pelo WhatsApp";
whatsappButton.target = "_blank";
whatsappButton.rel = "noopener noreferrer";

const phone = String(order.customerPhone || "").replace(/\D/g, "");

if (phone) {
    whatsappButton.href =
        `https://wa.me/${phone}?text=${encodeURIComponent(
            `Olá ${order.customerName || ""}! Recebi sua solicitação pelo BairroServices referente ao produto ${order.productName || ""}. Gostaria de conversar com você.`
        )}`;

    whatsappButton.style.display = "inline-block";
    whatsappButton.style.background = "#25D366";
    whatsappButton.style.color = "#ffffff";
    whatsappButton.style.padding = "11px 16px";
    whatsappButton.style.borderRadius = "7px";
    whatsappButton.style.textDecoration = "none";
    whatsappButton.style.marginTop = "12px";
} else {
    whatsappButton.textContent = "Telefone não disponível";
    whatsappButton.style.color = "#777";
}

card.append(
    heading,
    details,
    status,
    statusSelect,
    updateButton,
    whatsappButton
);

ordersContainer.appendChild(card);
    });
}

// Retrieve business orders from backend
async function loadBusinessOrders() {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/business/my-orders`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Não foi possível carregar as solicitações."
            );
        }

        displayOrders(data.orders || []);

    } catch (error) {
        console.error("Business orders error:", error);
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;

    } finally {
        loading.hidden = true;
    }
}
