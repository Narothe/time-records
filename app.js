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
  const tableBody = [
    [
      "Dzień",
      "Liczba godzin",
      "Podpis zleceniobiorcy",
      "Uwagi",
      "Podpis zleceniodawcy"
    ]
  ];

  data.hours.forEach((h, i) => {
    tableBody.push([
      i + 1,
      h || "",
      "",
      "",
      ""
    ]);
  });

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { fontSize: 11 },

    content: [
      { text: "Ewidencja godzin wykonywania umowy zlecenia", style: "header" },
      { text: `Nazwisko i imię: ${data.name}`, style: "info" },
	  { text: `Miesiąc rozliczenia: ${twoDigits(data.month)}.${data.year}`, style: "info" },
	  { text: `Data podpisania umowy: ${data.contractDate}`, style: "info" },

      { text: " " },

      {
        table: {
          headerRows: 1,
          widths: [30, 60, "*", "*", "*"],
          body: tableBody
        },
        layout: {
		  hLineWidth: function () { return 0.7; },
		  vLineWidth: function () { return 0.7; },
		  hLineColor: function () { return '#000'; },
		  vLineColor: function () { return '#000'; },
		  paddingLeft: function () { return 4; },
		  paddingRight: function () { return 4; },
		  paddingTop: function () { return 3; },
		  paddingBottom: function () { return 3; }
		}

      },

      { text: " " },
      {
	    text: `Liczba godzin ogółem: ${data.total}`,
	    bold: true,
	    fontSize: 10,
	    margin: [0, 8, 0, 0]
	  }

    ],

    styles: {
	  header: {
		fontSize: 11,
		bold: true,
		margin: [0, 0, 0, 8]
	  },
	  info: {
		fontSize: 10,
		margin: [0, 2, 0, 4]
	  }
	}

  };

  pdfMake.createPdf(docDefinition).download(
    `ewidencja_${data.name.replace(/\s+/g, "_")}.pdf`
  );
}
