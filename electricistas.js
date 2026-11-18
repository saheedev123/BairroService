
const container = document.getElementById("electricistasContainer");

let electricians = [];

// Load registered electricians from the backend
async function loadElectricistas() {
    try {
        container.innerHTML = "<p>Carregando eletricistas...</p>";

        const response = await fetch(
            "http://localhost:3000/api/professionals"
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar os profissionais.");
        }

        const data = await response.json();

        // Only show registered electricians
        electricians = (data.professionals || []).filter(person =>
            person.profession.toLowerCase() === "electrician"
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


// Display electrician cards
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

        const name = document.createElement("h3");
        name.textContent = person.fullname;

        const location = document.createElement("p");
        location.textContent = "📍 " + person.neighborhood;

        const experience = document.createElement("p");
        experience.textContent = "Experiência: " + person.experience;

        const specialty = document.createElement("p");
        specialty.textContent = person.serviceDescription;

        card.append(name, location, experience, specialty);

        if (person.whatsappLink) {
            const whatsappButton = document.createElement("a");

            whatsappButton.className = "whatsapp-button";
            whatsappButton.href =
                person.whatsappLink +
                "?text=" +
                encodeURIComponent(
                    `Olá ${person.fullname}, encontrei seu perfil no BairroServices e gostaria de saber mais sobre seus serviços.`
                );

            whatsappButton.target = "_blank";
            whatsappButton.rel = "noopener noreferrer";
            whatsappButton.textContent = "Contactar pelo WhatsApp";

            card.appendChild(whatsappButton);
        }

        container.appendChild(card);
    });
}


// Search electricians by name, neighbourhood or service
function searchElectricistas() {

    const search = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const results = electricians.filter(person => {

        return (
            person.fullname.toLowerCase().includes(search) ||
            person.neighborhood.toLowerCase().includes(search) ||
            person.serviceDescription.toLowerCase().includes(search)
        );

    });

    displayElectricians(results);
}


// Load the directory when the page opens
loadElectricistas();
