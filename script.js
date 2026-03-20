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

    // Load basic fields
    Object.keys(data).forEach(key => {
        if (key === "categories") return;
        if (el(key)) el(key).value = data[key];
    });

    // Load category fields
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
// EXPORT PDF
// =========================================
async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });

    let y = 40;

    pdf.setFontSize(18);
    pdf.text("WKA Referee Mentoring Feedback", 40, y);
    y += 30;

    pdf.setFontSize(12);
    const data = collectFormData();

    // Helper to add simple text fields
    function addField(label, value) {
        pdf.text(`${label}: ${value || ""}`, 40, y);
        y += 20;
    }

    // Basic info
    addField("Name", data.name);
    addField("Club", data.club);
    addField("Phone", data.phone);
    addField("Current Grade", data.grade);
    addField("Matches", data.matches);
    addField("League + Date", data.leagueDate);
    addField("Mentor Name", data.mentorName);
    addField("Mentor Grade", data.mentorGrade);

    // Categories
    y += 10;
    pdf.setFontSize(14);
    pdf.text("Evaluation Categories", 40, y);
    y += 20;

    pdf.setFontSize(12);

    for (const cat of categories) {
        pdf.setFont(undefined, "bold");
        pdf.text(cat, 40, y);
        y += 15;

        pdf.setFont(undefined, "normal");
        pdf.text(`1st Half: ${data.categories[cat].firstHalf ? "✓" : "✗"}`, 60, y);
        y += 15;
        pdf.text(`2nd Half: ${data.categories[cat].secondHalf ? "✓" : "✗"}`, 60, y);
        y += 20;

        let lines1 = pdf.splitTextToSize(`1st Half Notes: ${data.categories[cat].notes1 || ""}`, 500);
        pdf.text(lines1, 60, y);
        y += lines1.length * 15 + 10;

        let lines2 = pdf.splitTextToSize(`2nd Half Notes: ${data.categories[cat].notes2 || ""}`, 500);
        pdf.text(lines2, 60, y);
        y += lines2.length * 15 + 20;
    }

    // Targets
    y += 10;
    pdf.setFontSize(14);
    pdf.text("Targets", 40, y);
    y += 20;

    pdf.setFontSize(12);
    addField("Target Start", data.targetStart);
    addField("Target Second Half", data.targetSecond);
    addField("Improve Next Time", data.improveNext);

    // Final section
    y += 10;
    pdf.setFontSize(14);
    pdf.text("Finalisation", 40, y);
    y += 20;

    pdf.setFontSize(12);
    addField("Signed", data.signed);
    addField("Date", data.date);

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
``
