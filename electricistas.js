const electricians = [
    {
        name: "Carlos Silva",
        location: "Taboão da Serra",
        specialty: "Electrical installations and repairs",
        rating: "4.9",
        image: "images/electrician1.jpg",
        whatsapp: "5511999999999"
    },
    {
        name: "Roberto Santos",
        location: "Campo Limpo",
        specialty: "Residential electrical repairs",
        rating: "4.8",
        image: "images/electrician2.jpg",
        whatsapp: "5511888888888"
    },
    {
        name: "Marcos Oliveira",
        location: "Morumbi",
        specialty: "Lighting and electrical maintenance",
        rating: "4.7",
        image: "images/electrician3.jpg",
        whatsapp: "5511777777777"
    }
];

const container = document.getElementById(
    "electricianContainer"
);

function displayElectricians(list) {

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML =
            "<p>No electricians found in this area.</p>";
        return;
    }

    list.forEach((person, index) => {

        container.innerHTML += `
            <div class="professional-card">

                <img src="${person.image}"
                     alt="${person.name}">

                <div class="professional-info">

                    <h3>${person.name}</h3>

                    <p>⭐ ${person.rating} / 5</p>

                    <p>📍 ${person.location}</p>

                    <p>${person.specialty}</p>

                    <button onclick="contactElectrician(${index})">
                        Contact on WhatsApp
                    </button>

                </div>

            </div>
        `;
    });
}

function searchElectricians() {

    const search = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const results = electricians.filter(person =>
        person.name.toLowerCase().includes(search) ||
        person.location.toLowerCase().includes(search) ||
        person.specialty.toLowerCase().includes(search)
    );

    displayElectricians(results);
}

function contactElectrician(index) {

    const person = electricians[index];

    const message = encodeURIComponent(
        Hello ${person.name}, I found your profile on BairroServices. I would like to know more about your services.
    );

    window.open(
        https://wa.me/${person.whatsapp}?text=${message},
        "_blank"
    );
}

displayElectricians(electricians);