const robotoFontBase64 = "AAEAAAAKAIAAAwAwT1MvMlnI2fwAA..."; // Base64 font data

let excelData = {};

function loadExcel() {
  const input = document.getElementById("fileInput");
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Read personal info
    excelData.name = (rows[1][3] || "") + " " + (rows[1][4] || ""); // D2/E2

    // Convert Excel date (serial number) to JS date string
    const rawDate = rows[4][3]; // D5
    if (typeof rawDate === "number") {
      const jsDate = XLSX.SSF.parse_date_code(rawDate);
      excelData.contractDate = `${jsDate.y}-${String(jsDate.m).padStart(2, "0")}-${String(jsDate.d).padStart(2, "0")}`;
    } else {
      excelData.contractDate = rawDate || "";
    }

    excelData.year = rows[7][3] || ""; // D8
    excelData.month = rows[7][4] || ""; // E8 (text in Polish)

    excelData.hours = rows.slice(1, 32).map((row) => row[1] || "");
    excelData.total = rows[32][1] || 0; // B33 (sum)

    fillForm();
  };

  reader.readAsArrayBuffer(file);
}


function fillForm() {
  document.getElementById("formContainer").style.display = "block";
  document.getElementById("name").value = excelData.name;
  document.getElementById("contractDate").value = excelData.contractDate; // update
  document.getElementById("year").value = excelData.year;
  document.getElementById("month").value = excelData.month; // update

  const tbody = document.querySelector("#hoursTable tbody");
  tbody.innerHTML = "";

  excelData.hours.forEach((hours, index) => {
    const row = document.createElement("tr");
    const style = hours
      ? "background-color: #f5f5f5;" // grey if hours are filled
      : "background-color: #fce4e4;"; // red/pink if empty

    row.setAttribute("style", style);
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><input type="number" value="${hours || ""}" style="text-align:center;" data-day="${index + 1}" /></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("totalHours").innerText = `Suma godzin: ${excelData.total}`;
}


function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add custom font
  doc.addFileToVFS("Roboto-Regular.ttf", robotoFontBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto");
  doc.setFontSize(10); // smaller font

  const name = document.getElementById("name").value;
  const contractDate = document.getElementById("contractDate").value;
  const [year, month, day] = contractDate.split("-");
  const yearVal = document.getElementById("year").value;
  const monthText = document.getElementById("month").value;

  doc.text("Ewidencja godzin wykonywania umowy zlecenia", 14, 20);
  doc.text(`Nazwisko i imię: ${name}`, 14, 30);
  doc.text(`Miesiąc rozliczenia: ${monthText} ${yearVal}`, 14, 40);
  doc.text(`Data podpisania umowy: ${day}-${month}-${year}`, 14, 50);

  let startY = 60;
  doc.setFontSize(9); // even smaller for table
  doc.text("Dzień   Godziny", 14, startY);

  const inputs = document.querySelectorAll("#hoursTable input");
  inputs.forEach((input, i) => {
    const day = parseInt(input.dataset.day, 10);
    const hours = parseFloat(input.value || 0);
    doc.text(`${day}`, 14, startY + 10 + i * 8);
    doc.text(hours ? `${hours}` : "-", 40, startY + 10 + i * 8);
  });

  const totalText = document.getElementById("totalHours").innerText;
  doc.text(totalText, 14, startY + 270);

  doc.save(`ewidencja_${name}_${monthText}_${yearVal}.pdf`);
}
