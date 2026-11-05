function searchServices() {
    const neighborhood = document
        .getElementById("neighborhood").value.trim();

    const service = document
        .getElementById("service").value.trim();

    if (!neighborhood || !service) {
        alert("Please enter your neighborhood and the service you need.");
        return;
    }

    window.location.href =
        results.html?neighborhood=${encodeURIComponent(neighborhood)}&service=${encodeURIComponent(service)

    }}