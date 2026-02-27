// pdfGenerator.js
// Reads an Excel (.xlsx) file, extracts relevant fields from
// a predefined layout, converts Excel time values to h:mm, calculates totals,
// shows a preview (via showTablePreview) and generates a formatted PDF using
// pdfMake.

const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");
const statusMessage = document.getElementById("statusMessage");

// global application data extracted from the Excel file
window.appData = {};

fileInput.addEventListener("change", handleFile);
generateBtn.addEventListener("click", generatePDF);

// handleFile: read the selected .xlsx file, parse the first sheet and
// populate `appData` with name, contract date, month, year, daily hours and total
function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
        showStatus("Nieprawidłowy plik. Wybierz plik .xlsx", "error");
        return;
    }

    const reader = new FileReader();

    reader.onload = evt => {
        try {
            const workbook = XLSX.read(evt.target.result, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            appData.name = `${rows[1][4] || ""} ${rows[1][3] || ""}`;
            appData.contractDate = parseExcelDate(rows[4][3]);
            appData.year = rows[8][3];
            appData.month = rows[8][4];
            appData.hours = rows.slice(1, 32).map(r => formatExcelTime(r[1]));
            appData.total = sumTimes(appData.hours);

            generateBtn.disabled = false;

            showTablePreview();
            showStatus("Plik został wczytany.", "success");

        } catch (error) {
            showStatus("Błąd podczas wczytywania pliku.", "error");
            console.error(error);
        }
    };

    reader.readAsArrayBuffer(file);
}

// parseExcelDate: convert Excel numeric date codes to DD-MM-YYYY string
function parseExcelDate(v) {
    if (typeof v === "number") {
        const d = XLSX.SSF.parse_date_code(v);
        return `${twoDigits(d.d)}-${twoDigits(d.m)}-${d.y}`;
    }
    return v || "";
}

// twoDigits: helper for zero-padding numbers to 2 digits
function twoDigits(value) {
    return String(value).padStart(2, "0");
}

// formatExcelTime: Excel may store time as a fraction of a day (number) or as text.
// Convert numeric times to "H:MM" string, leave text as-is.
function formatExcelTime(value) {
    if (!value) return "";

    // if Excel saves it as a number (fraction of a day)
    if (typeof value === "number") {
        const totalMinutes = Math.round(value * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}:${String(minutes).padStart(2, "0")}`;
    }

    // if it is already text, e.g., “8:30”
    return value;
}

// sumTimes: accumulate an array of time strings in H:MM format and return the
// total as an H:MM string
function sumTimes(timeArray) {
    let totalMinutes = 0;

    timeArray.forEach(time => {
        if (!time) return;

        const parts = time.split(":");
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;

        totalMinutes += h * 60 + m;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${String(minutes).padStart(2, "0")}`;
}

// generatePDF: build a pdfMake document definition using data from appData and
// trigger a download of the generated PDF. The table layout matches the
// official form used for time records.
function generatePDF() {

    const rowMargin = [0, 3, 0, 3];
    const lastRowMargin = [0, 6, 0, 6];

    const tableBody = [
        [
            {
                text: "Dzień\nmiesiąca",
                bold: true,
                alignment: "center",
                fontSize: 7,
                margin: rowMargin
            },
            {
                text: "Liczba godzin wykonywania umowy zlecenia",
                bold: true,
                alignment: "center",
                fontSize: 7,
                margin: rowMargin
            },
            {
                text: "Podpis\nZleceniobiorcy",
                bold: true,
                alignment: "center",
                fontSize: 7,
                margin: rowMargin
            },
            {
                text: "Uwagi",
                bold: true,
                alignment: "center",
                fontSize: 7,
                margin: rowMargin
            },
            {
                text: "Podpis Zleceniodawcy lub osoby przez niego upoważnionej",
                bold: true,
                alignment: "center",
                fontSize: 7,
                margin: rowMargin
            }
        ]
    ];

    // add a row per day with hours and empty signature/notes cells
    appData.hours.forEach((h, i) => {
        tableBody.push([
            { text: i + 1, alignment: "center", margin: rowMargin },
            { text: h || "", alignment: "center", margin: rowMargin },
            { text: "", alignment: "center", margin: rowMargin },
            { text: "", alignment: "center", margin: rowMargin },
            { text: "", alignment: "center", margin: rowMargin }
        ]);
    });

    // final summary row with total hours
    tableBody.push([
        {
            text:
                "Liczba \n" +
                "godzin \n" +
                "wykonywania \n" +
                "umowy \n" +
                "zlecenia \n" +
                "ogółem:",
            fontSize: 7,
            alignment: "center",
            margin: lastRowMargin
        },
        { text: appData.total, bold: true, fontSize: 11, alignment: "center", margin: lastRowMargin },
        { text: "", alignment: "center", margin: lastRowMargin },
        { text: "", alignment: "center", margin: lastRowMargin },
        { text: "", alignment: "center", margin: lastRowMargin }
    ]);

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 40, 40, 40],

        defaultStyle: {
            fontSize: 10
        },

        content: [

            {
                text: "Załącznik nr 1",
                alignment: "center",
                fontSize: 8,
                margin: [0, 0, 0, 10]
            },

            {
                text: "Ewidencja wykonywania umowy zlecenia zawartej w dniu",
                alignment: "center",
                fontSize: 13,
                margin: [0, 0, 0, 3]
            },

            // DATE OF SIGNATURE
            {
                alignment: "center",
                margin: [0, 0, 0, 15],
                text: [
                    { text: appData.contractDate, bold: true },
                    { text: " r." }
                ]
            },

            // MONTH AND YEAR
            {
                margin: [0, 0, 0, 4],
                text: [
                    { text: "Miesiąc: " },
                    { text: `${twoDigits(appData.month)} ${appData.year}`, bold: true }
                ]
            },

            // LAST NAME
            {
                margin: [0, 0, 0, 10],
                text: [
                    { text: "Nazwisko i imię zleceniobiorcy: " },
                    { text: appData.name, bold: true }
                ]
            },

            {
                table: {
                    headerRows: 1,
                    widths: [45, 60, "*", 170, "*"],
                    body: tableBody
                },
                layout: {
                    hLineWidth: () => 0.6,
                    vLineWidth: () => 0.6,
                    hLineColor: () => "#000",
                    vLineColor: () => "#000",
                    paddingLeft: () => 3,
                    paddingRight: () => 3,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                },
                fontSize: 9
            }

        ],

        footer: function(currentPage, pageCount) {
            return {
                margin: [40, 0, 40, 0],
                columns: [
                    {
                        text: "Projekt dostępny na GitHub: https://github.com/Narothe/time-records",
                        alignment: "center",
                        fontSize: 8,
                        link: "https://github.com/Narothe/time-records",
                        color: "grey"
                    }
                ]
            };
        },
    };

    // trigger PDF download using pdfMake
    pdfMake.createPdf(docDefinition).download(
        `ewidencja_${appData.name.replace(/\s+/g, "_")}.pdf`
    );
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = "status " + type;
    statusMessage.style.display = "block";
}