const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");

let data = {};

fileInput.addEventListener("change", handleFile);
generateBtn.addEventListener("click", generatePDF);

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = evt => {
        const workbook = XLSX.read(evt.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        data.name = `${rows[1][3] || ""} ${rows[1][4] || ""}`;
        data.contractDate = parseExcelDate(rows[4][3]);
        data.year = rows[7][3];
        data.month = rows[7][4];
        data.hours = rows.slice(1, 32).map(r => r[1] || "");
        data.total = rows[32][1] || 0;

        generateBtn.disabled = false;
    };

    reader.readAsArrayBuffer(file);
}

function parseExcelDate(v) {
    if (typeof v === "number") {
        const d = XLSX.SSF.parse_date_code(v);
        return `${twoDigits(d.d)}-${twoDigits(d.m)}-${d.y}`;
    }
    return v || "";
}

function twoDigits(value) {
    return String(value).padStart(2, "0");
}

function generatePDF() {

    const rowMargin = [0, 3, 0, 3];   // 🔴 TU REGULUJESZ WYSOKOŚĆ WIERSZA
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

    data.hours.forEach((h, i) => {
        tableBody.push([
            { text: i + 1, alignment: "center", margin: rowMargin },
            { text: h || "", alignment: "center", margin: rowMargin },
            { text: "", alignment: "center", margin: rowMargin },
            { text: "", alignment: "center", margin: rowMargin },
            { text: "", alignment: "center", margin: rowMargin }
        ]);
    });

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
        { text: data.total, bold: true, fontSize: 11, alignment: "center", margin: lastRowMargin },
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

            // 🔴 DATA PODPISANIA (pogrubiona wartość)
            {
                alignment: "center",
                margin: [0, 0, 0, 15],
                text: [
                    { text: data.contractDate, bold: true },
                    { text: " r." }
                ]
            },

            // 🔴 MIESIĄC I ROK (pogrubione wartości)
            {
                margin: [0, 0, 0, 4],
                text: [
                    { text: "Miesiąc: " },
                    { text: `${twoDigits(data.month)} ${data.year}`, bold: true }
                ]
            },

            // 🔴 NAZWISKO (pogrubione)
            {
                margin: [0, 0, 0, 10],
                text: [
                    { text: "Nazwisko i imię zleceniobiorcy: " },
                    { text: data.name, bold: true }
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
                        text: "Projekt dostępny na GitHub: https://github.com/TWOJ_LOGIN/TWOJE_REPO",
                        alignment: "center",
                        fontSize: 8,
                        link: "https://github.com/TWOJ_LOGIN/TWOJE_REPO",
                        color: "grey"
                    }
                ]
            };
        },
    };

    pdfMake.createPdf(docDefinition).download(
        `ewidencja_${data.name.replace(/\s+/g, "_")}.pdf`
    );
}