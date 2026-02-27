function showTablePreview() {

    const container = document.getElementById("previewContainer");
    const info = document.getElementById("previewInfo");
    const tbody = document.querySelector("#previewTable tbody");
    const total = document.getElementById("previewTotal");

    container.style.display = "block";

    info.innerHTML = `
        <p>Ewidencja wykonywania umowy zlecenia zawartej w dniu: <strong> ${appData.contractDate}</strong></p>
        <p>Miesiąc: ${String(appData.month).padStart(2, "0")} <strong>${appData.year}</strong></p>
        <p>Nazwisko i imię zleceniobiorcy: <strong>${appData.name}</strong></p>
    `;

    tbody.innerHTML = "";

    appData.hours.forEach((h, i) => {
        const row = document.createElement("tr");

        const dayCell = document.createElement("td");
        dayCell.textContent = i + 1;
        dayCell.style.textAlign = "center";

        const hourCell = document.createElement("td");
        hourCell.textContent = h;
        hourCell.style.textAlign = "center";

        row.appendChild(dayCell);
        row.appendChild(hourCell);

        tbody.appendChild(row);
    });

    total.textContent = `Suma godzin: ${appData.total}`;
}