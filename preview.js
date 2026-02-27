// preview.js
// Handles rendering a simple HTML preview of the data extracted
// from the Excel file (appData). Shows contract info, a table of daily hours,
// and the total hours.

function showTablePreview() {

    const container = document.getElementById("previewContainer");
    const info = document.getElementById("previewInfo");
    const tbody = document.querySelector("#previewTable tbody");
    const total = document.getElementById("previewTotal");

    // make preview section visible
    container.style.display = "block";

    // fill basic contract / worker information
    info.innerHTML = `
        <p>Ewidencja wykonywania umowy zlecenia zawartej w dniu: <strong> ${appData.contractDate}</strong></p>
        <p>Miesiąc: ${String(appData.month).padStart(2, "0")} <strong>${appData.year}</strong></p>
        <p>Nazwisko i imię zleceniobiorcy: <strong>${appData.name}</strong></p>
    `;

    // clear any previous rows
    tbody.innerHTML = "";

    // populate table: each row = day + hours for that day
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

    // show total hours below the table
    total.textContent = `Suma godzin: ${appData.total}`;
}