export function showDivs(config) {
    const container = document.getElementById("documents");
    if (container) {
        container.innerHTML = "";

        const fieldNames = {
            AgeOver18: "Age Over 18",
            HealthID: "Health ID",
            IBAN: "Bank Account (IBAN)",
            Loyalty: "Loyalty Card",
            mDL: "Mobile Driver's License",
            MSISDN: "Phone Number",
            PhotoId: "Photo ID",
            PID: "Personal ID",
            PowerOfRepresentation: "Power of Representation",
            PseudonymDeferred: "Pseudonym Deferred",
            Reservation: "Reservation",
            TaxNumber: "Tax Number"
        };

        Object.entries(config).forEach(([key, value]) => {
            if (value == true) {
                let div = document.createElement("div");
                div.className = "document-box";
                div.textContent = `${fieldNames[key]}`;
                div.style.display = "block";
                container.appendChild(div);
            }
        });
    }
}

window.showDivs = showDivs;
