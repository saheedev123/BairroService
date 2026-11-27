
const BACKEND_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;

const token = sessionStorage.getItem("bairroToken");

const ordersContainer = document.getElementById("ordersContainer");
const loading = document.getElementById("ordersLoading");
const errorMessage = document.getElementById("ordersError");
const totalOrders = document.getElementById("totalOrders");


function formatPrice(price) {
    return Number(price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function formatDate(date) {
    return new Date(date).toLocaleString("pt-BR");
}


function displayOrders(orders) {

    ordersContainer.innerHTML = "";

    totalOrders.textContent = orders.length;

    if (!orders.length) {
        ordersContainer.innerHTML = `
            <div class="orders-empty">
                <h3>Você ainda não fez nenhuma solicitação.</h3>
                <p>Explore os pequenos negócios e encontre produtos!</p>
                <a href="pequenos-negocios.html">
                    Explorar negócios
                </a>
            </div>
        `;
        return;
    }

    orders.forEach(order => {

        const card = document.createElement("article");
        card.className = "order-card";

        const heading = document.createElement("h3");
        heading.textContent = order.productName || "Produto";

        const details = document.createElement("div");
        details.className = "order-details";

        const business = document.createElement("p");
        business.textContent = `Negócio: ${order.businessName}`;

        const quantity = document.createElement("p");
        quantity.textContent = `Quantidade: ${order.quantity}`;

        const price = document.createElement("p");
        price.textContent = `Preço unitário: ${formatPrice(order.productPrice)}`;

        const total = document.createElement("p");
        total.textContent = `Total estimado: ${formatPrice(order.totalPrice)}`;

        const message = document.createElement("p");
        message.textContent = `Sua mensagem: ${order.message || "Nenhuma mensagem"}`;

        
const status = document.createElement("span");
status.className = "order-status";

const currentStatus = order.status || "Pendente";

status.textContent = `Status: ${currentStatus}`;

if (currentStatus === "Aceito") {
    status.style.color = "#26734d";
} else if (currentStatus === "Concluído") {
    status.style.color = "#16803c";
} else if (currentStatus === "Cancelado") {
    status.style.color = "#dc2626";
} else {
    status.style.color = "#b7791f";
}

        const date = document.createElement("p");
        date.className = "order-date";
        date.textContent = `Enviado em: ${formatDate(order.createdAt)}`;

        details.append(
            business,
            quantity,
            price,
            total,
            message
        );

        card.append(
            heading,
            details,
            status,
            date
        );

        ordersContainer.appendChild(card);
    });
}


async function loadOrders() {

    if (!token) {
        alert("Faça login para visualizar suas solicitações.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `${BACKEND_URL}/api/my-orders`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Não foi possível carregar suas solicitações."
            );
        }

        displayOrders(data.orders || []);

    } catch (error) {

        console.error("My orders error:", error);

        errorMessage.textContent = error.message;
        errorMessage.hidden = false;

    } finally {

        loading.hidden = true;
    }
}


loadOrders();
