
const container = document.getElementById("encanadoresContainer");

let encanadores = [];

// Load registered plumbers from the backend
async function loadEncanadores() {
    try {
        container.innerHTML = "<p>Carregando encanadores...</p>";

        const response = await fetch(
            "http://localhost:3000/api/professionals"
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar os profissionais.");
        }

        const data = await response.json();

        encanadores = (data.professionals || []).filter(person =>
            person.profession.toLowerCase() === "plumber"
        );

        displayEncanadores(encanadores);

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <p>Não foi possível carregar os encanadores.
            Verifique se o servidor está funcionando.</p>
        `;
    }
}


// Display plumber cards
function displayEncanadores(list) {
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `
            <p>Nenhum encanador encontrado nesta região.</p>
        `;
        return;
    }

    list.forEach(person => {
        const card = document.createElement("div");
        card.className = "professional-card";

        const name = document.createElement("h3");
        name.textContent = person.fullname;

        const location = document.createElement("p");
        location.textContent = "📍 " + person.neighborhood;

        const experience = document.createElement("p");
        experience.textContent = "Experiência: " + person.experience;

        const description = document.createElement("p");
        description.textContent = person.serviceDescription;

        card.append(name, location, experience, description);

        if (person.whatsappLink) {
            const whatsapp = document.createElement("a");

            whatsapp.className = "whatsapp-button";
            whatsapp.href = person.whatsappLink +
                "?text=" +
                encodeURIComponent(
                    `Olá ${person.fullname}, encontrei seu perfil no BairroServices e gostaria de saber mais sobre seus serviços.`
                );

            whatsapp.target = "_blank";
            whatsapp.rel = "noopener noreferrer";
            whatsapp.textContent = "Contactar pelo WhatsApp";

            card.appendChild(whatsapp);
        }

        container.appendChild(card);
    });
}


// Search by name, neighbourhood or service
function searchEncanadores() {
    const search = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const results = encanadores.filter(person =>
        person.fullname.toLowerCase().includes(search) ||
        person.neighborhood.toLowerCase().includes(search) ||
        person.serviceDescription.toLowerCase().includes(search)
    );

    displayEncanadores(results);
}


// Load plumbers when page opens
loadEncanadores();
