
const token = sessionStorage.getItem("bairroToken");
const savedUser = sessionStorage.getItem("bairroUser");

if (!token || !savedUser) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(savedUser);

    if (user.accountType !== "customer") {
        window.location.href = "login.html";
    } else {
        document.getElementById("customerName").textContent =
            user.fullname || "Cliente";

        document.getElementById("customerEmail").textContent =
            "Email: " + (user.email || "");

        document.getElementById("customerNeighborhood").textContent =
            "Bairro: " + (user.neighborhood || "");
    }
}

function logout() {
    sessionStorage.removeItem("bairroToken");
    sessionStorage.removeItem("bairroUser");

    window.location.href = "login.html";
}
