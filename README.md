# 📄 Time Records – PDF Generator

A simple web application that generates a professional PDF time record document based on a predefined Excel (.xlsx) template.

The entire application runs **fully in the browser** – no backend, no server, no data storage.

---

## 🌐 Live Version

The application is available online at:

👉 **https://narothe.github.io/time-records/**

---

## ✨ Features

- Import Excel (.xlsx) file
- Automatic preview of extracted data
- Working hours calculation in `h:mm` format
- One-page A4 PDF generation
- Downloadable Excel template
- Success and error notifications
- Fully client-side processing

---

## 📥 How to Use

### 1️⃣ Download the Excel Template

Click:
> **https://narothe.github.io/time-records/assets/wzor_ewidencji.xlsx**

Fill in the file according to the predefined structure.

---

### 2️⃣ Fill in the Excel File

The file must contain:

- Employee full name
- Contract signing date
- Settlement year
- Settlement month
- Daily working hours in `h:mm` format (e.g., `8:30`)
- The total is calculated automatically by the application

⚠ Time format must be:
- `h:mm` (e.g., `8:30`, `0:45`, `10:00`)


---

### 3️⃣ Upload the File

Click:
> “Wybierz plik”

After successful import:

- A data preview will appear
- The "Generate PDF" button will be enabled
- A success message will be displayed

---

### 4️⃣ Generate the PDF

Click:
> “Generuj PDF”

A formatted A4 PDF document will be downloaded automatically.

---

## 🔐 Data Privacy

- The Excel file is **not uploaded** anywhere
- All data is processed locally in the browser
- No data is stored
- The project is hosted via GitHub Pages (static site)

---

## 🛠 Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs)
- [pdfmake](https://pdfmake.github.io/docs/)

---

## ⚠ Requirements

- Modern browser (Chrome, Edge, Firefox)
- JavaScript enabled
- Excel file in `.xlsx` format

---

## 🧾 Limitations

- Only the first worksheet is processed
- The Excel file must match the template structure
- Logical validation of time values is limited (e.g., 25:99 is not validated)

---

## 🚀 Run Locally

You can run the project locally:

1. Clone the repository:


`git clone https://github.com/Narothe/time-records.git`


2. Open:


index.html


No Node.js, server, or build tools required.

---

## 🌍 Deployment

The project is deployed via GitHub Pages from the `main` branch.

---

## 📌 Author

[@Narothe](https://github.com/Narothe)

Created as a lightweight tool for generating standardized time record documents from Excel files.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

### Third-Party Libraries

This project uses:

- [pdfMake](https://github.com/bpampuch/pdfmake) (MIT License)
- [SheetJS](https://github.com/SheetJS/sheetjs) (Apache License 2.0)

All third-party libraries remain under their respective licenses.