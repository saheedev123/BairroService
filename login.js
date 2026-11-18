
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");

    loginButton.disabled = true;
    loginButton.textContent = "Entrando...";
    loginMessage.textContent = "";

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const responseText = await response.text();

let data;

try {
    data = JSON.parse(responseText);
} catch (error) {
    console.error("Backend response:", responseText);

    throw new Error(
        "The backend returned an invalid response. Check the browser console."
    );
}

        if (!response.ok) {
            throw new Error(data.message || "Falha ao entrar.");
        }

        // Save authentication token
        sessionStorage.setItem("bairroToken", data.token);

        // Save user information for the dashboard
        sessionStorage.setItem(
            "bairroUser",
            JSON.stringify(data.user)
        );

        loginMessage.style.color = "green";
        loginMessage.textContent = "Login realizado com sucesso!";

        // Redirect according to account type
        if (data.user.accountType === "professional") {
            window.location.href = "professional-dashboard.html";
        } else if (data.user.accountType === "business") {
            window.location.href = "smallbusiness-dashboard.html";
        } else {
            throw new Error("Tipo de conta inválido.");
        }

    } catch (error) {
        loginMessage.style.color = "red";

        if (error instanceof TypeError) {
            loginMessage.textContent =
                "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
        } else {
            loginMessage.textContent = error.message;
        }

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
    }
});
