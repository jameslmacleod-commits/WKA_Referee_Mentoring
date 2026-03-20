// =========================================
// CATEGORIES SETUP
// =========================================
const categories = [
    "Communication",
    "Vision",
    "Positioning",
    "Technical Decisions",
    "Control of Contact",
    "Game Management",
    "Advantage"
];

const container = document.getElementById("categories");

// Render category blocks
categories.forEach(cat => {
    container.innerHTML += `
        <div class='category-box'>
            <label class='cat-title'>${cat}</label>

            <div class='checkbox-row'>
                <div>
                    <strong>1st Half</strong><br>
                    <input type='checkbox' id='${cat}-1st' class='autosave'>
                </div>
                <div>
                    <strong>2nd Half</strong><br>
                    <input type='checkbox' id='${cat}-2nd' class='autosave'>
                </div>
            </div>

            <label>Notes – 1st Half</label>
            <textarea id='${cat}-notes1' class='autosave'></textarea>

            <label>Notes – 2nd Half</label>
            <textarea id='${cat}-notes2' class='autosave'></textarea>
        </div>
    `;
});

// Helper functions
function el(id) {
    return document.getElementById(id);
}

function val(id) {
    return el(id)?.value || "";
}

// =========================================
// COLLECT ALL FORM DATA
// =========================================
function collectFormData() {
    const output = {
        name: val("name"),
        club: val("club"),
        phone: val("phone"),
        grade: val("grade"),
        matches: val("matches"),
        leagueDate: val("leagueDate"),
        mentorName: val("mentorName"),
        mentorGrade: val("mentorGrade"),

        categories: {},

        targetStart: val("targetStart"),
        targetSecond: val("targetSecond"),
        improveNext: val("improveNext"),

        signed: val("signed"),
        date: val("date")
    };

    categories.forEach(cat => {
        output.categories[cat] = {
            firstHalf: el(`${cat}-1st`).checked,
            secondHalf: el(`${cat}-2nd`).checked,
            notes1: val(`${cat}-notes1`),
            notes2: val(`${cat}-notes2`)
        };
    });

    return output;
}

// =========================================
// AUTO-SAVE
// =========================================
function autoSave() {
    localStorage.setItem("referee_feedback_autosave", JSON.stringify(collectFormData()));
}

document.addEventListener("input", e => {
    if (e.target.classList.contains("autosave") ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        autoSave();
    }
});

// Load saved data on page load
function loadSavedData() {
    const saved = localStorage.getItem("referee_feedback_autosave");
    if (!saved) return;

    const data = JSON.parse(saved);

    Object.keys(data).forEach(key => {
        if (key === "categories") return;
        if (el(key)) el(key).value = data[key];
    });

    categories.forEach(cat => {
        if (data.categories && data.categories[cat]) {
            el(`${cat}-1st`).checked = data.categories[cat].firstHalf;
            el(`${cat}-2nd`).checked = data.categories[cat].secondHalf;
            el(`${cat}-notes1`).value = data.categories[cat].notes1;
            el(`${cat}-notes2`).value = data.categories[cat].notes2;
        }
    });
}

window.onload = loadSavedData;

// =========================================
// EXPORT JSON
// =========================================
function exportData() {
    const blob = new Blob([JSON.stringify(collectFormData(), null, 2)], {
        type: "application/json"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "referee_feedback.json";
    link.click();
}

// =========================================
// PROFESSIONAL PDF EXPORT (OPTION A)
// =========================================
async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });

    // Page settings
    const margin = 40;
    let y = margin;

    // Horizontal line helper
    function line() {
        pdf.setDrawColor(150);
        pdf.line(margin, y, 555, y);
        y += 15;
    }

    // Two-column fields
    function twoCol(label1, value1, label2, value2) {
        pdf.setFont("Helvetica", "bold");
        pdf.text(label1, margin, y);
        pdf.setFont("Helvetica", "normal");
        pdf.text(value1 || "", margin + 120, y);

        pdf.setFont("Helvetica", "bold");
        pdf.text(label2, margin + 300, y);
        pdf.setFont("Helvetica", "normal");
        pdf.text(value2 || "", margin + 420, y);

        y += 22;
    }

    // Single field
    function field(label, value) {
        pdf.setFont("Helvetica", "bold");
        pdf.text(label, margin, y);
        pdf.setFont("Helvetica", "normal");
        pdf.text(value || "", margin + 150, y);
        y += 22;
    }

    // Paragraph block
    function paragraph(label, text) {
        pdf.setFont("Helvetica", "bold");
        pdf.text(label, margin, y);
        y += 18;

        pdf.setFont("Helvetica", "normal");
        const lines = pdf.splitTextToSize(text || "", 500);
        pdf.text(lines, margin, y);
        y += lines.length * 14 + 12;
    }

    // Add new page if needed
    function ensureSpace(amount = 60) {
        if (y + amount > 780) {
            pdf.addPage();
            y = margin;
        }
    }

    const data = collectFormData();

    // Header
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("WKA Referee Mentoring Feedback", margin, y);
    y += 30;

    pdf.setFontSize(12);

    // Referee info
    pdf.setFont("Helvetica", "bold");
    pdf.text("Referee Information", margin, y);
    y += 18;
    line();

    twoCol("Name:", data.name, "Club:", data.club);
    twoCol("Phone:", data.phone, "Current Grade:", data.grade);
    twoCol("Matches:", data.matches, "League + Date:", data.leagueDate);
    twoCol("Mentor Name:", data.mentorName, "Mentor Grade:", data.mentorGrade);

    ensureSpace();

    // Evaluation categories
    pdf.setFont("Helvetica", "bold");
    pdf.text("Evaluation Categories", margin, y);
    y += 18;
    line();

    pdf.setFont("Helvetica", "bold");
    pdf.text("Category", margin, y);
    pdf.text("1st", margin + 200, y);
    pdf.text("2nd", margin + 260, y);
    pdf.text("Notes", margin + 330, y);
    y += 15;

    pdf.setDrawColor(200);
    pdf.line(margin, y, 555, y);
    y += 10;

    categories.forEach(cat => {
        ensureSpace();

        const c = data.categories[cat];

        pdf.setFont("Helvetica", "bold");
        pdf.text(cat, margin, y);

        pdf.setFont("Helvetica", "normal");
        pdf.text(c.firstHalf ? "✓" : "✗", margin + 200, y);
        pdf.text(c.secondHalf ? "✓" : "✗", margin + 260, y);

        pdf.setFont("Helvetica", "italic");
        pdf.text("(notes below)", margin + 330, y);
        y += 16;

        pdf.setFont("Helvetica", "bold");
        pdf.text("1st Half Notes:", margin + 20, y);
        y += 14;
        pdf.setFont("Helvetica", "normal");
        let lines1 = pdf.splitTextToSize(c.notes1 || "", 480);
        pdf.text(lines1, margin + 20, y);
        y += lines1.length * 14 + 6;

        pdf.setFont("Helvetica", "bold");
        pdf.text("2nd Half Notes:", margin + 20, y);
        y += 14;
        pdf.setFont("Helvetica", "normal");
        let lines2 = pdf.splitTextToSize(c.notes2 || "", 480);
        pdf.text(lines2, margin + 20, y);
        y += lines2.length * 14 + 14;

        pdf.setDrawColor(230);
        pdf.line(margin, y, 555, y);
        y += 12;
    });

    ensureSpace();

    // Targets
    pdf.setFont("Helvetica", "bold");
    pdf.text("Targets", margin, y);
    y += 18;
    line();

    paragraph("Target at Start:", data.targetStart);
    paragraph("Target for Second Half:", data.targetSecond);
    paragraph("Areas to Improve Next Time:", data.improveNext);

    ensureSpace();

    // Finalisation
    pdf.setFont("Helvetica", "bold");
    pdf.text("Finalisation", margin, y);
    y += 18;
    line();

    field("Signed:", data.signed);
    field("Date:", data.date);

    pdf.save("referee_feedback.pdf");
}

// =========================================
// RESET FORM
// =========================================
function resetForm() {
    if (!confirm("Start a new blank form? This will erase your saved data.")) return;

    localStorage.removeItem("referee_feedback_autosave");
    location.reload();
}
