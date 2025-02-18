export function showDivs(config) {
    const documents = document.getElementById("documents");
    const anonymous = document.getElementById("anonymous");
    if (documents && anonymous) {
        documents.innerHTML = "";
        anonymous.innerHTML = "";

        const fieldNames = {
            AgeOver18: {
                label: "Age Over 18",
                icon: "fa-solid fa-user-check"
            },
            HealthID: {
                label: "Health ID",
                icon: "fa-solid fa-heart-pulse"
            },
            IBAN: {
                label: "IBAN",
                icon: "fa-solid fa-university"
            },
            Loyalty: {
                label: "Loyalty",
                icon: "fa-solid fa-gift"
            },
            mDL: {
                label: "Mobile Driver's License",
                icon: "fa-solid fa-id-card"
            },
            MSISDN: {
                label: "Phone Number",
                icon: "fa-solid fa-phone"
            },
            PhotoId: {
                label: "Photo ID",
                icon: "fa-solid fa-id-badge"
            },
            PID: {
                label: "PID",
                icon: "fa-solid fa-address-card"
            },
            PowerOfRepresentation: {
                label: "Power of Representation",
                icon: "fa-solid fa-user-tie"
            },
            PseudonymDeferred: {
                label: "Pseudonym Deferred",
                icon: "fa-solid fa-user-secret"
            },
            Reservation: {
                label: "Reservation",
                icon: "fa-solid fa-calendar-check"
            },
            TaxNumber: {
                label: "Tax Number",
                icon: "fa-solid fa-file-invoice"
            }
        };
        
        console.log(config.visibility);
        if (config.visibility == 1) {
            let checkBox = document.createElement("input");
            let label = document.createElement("label");
            checkBox.id = "anonymous-checkbox";
            checkBox.type = "checkbox";

            label.htmlFor = "anonymous-checkbox";
            label.textContent = "Prefer to continue anonymously";
            
            anonymous.appendChild(checkBox);
            anonymous.appendChild(label);
        }

        Object.entries(config.required).forEach(([key, value]) => {
            console.log(value);
            if (value == true) {
                let div = document.createElement("div");
                div.className = "document-box";
                div.innerHTML = `<i class="${fieldNames[key].icon}"></i> ${fieldNames[key].label}`;
                documents.appendChild(div);
            }
        });
    }
}

window.showDivs = showDivs;
