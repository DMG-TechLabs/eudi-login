export function showDivs(config) {
    const container = document.getElementById("documents");
    if (container) {
        container.innerHTML = "";

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
        

        Object.entries(config).forEach(([key, value]) => {
            if (value == true) {
                let div = document.createElement("div");
                div.className = "document-box";
                div.innerHTML = `<i class="${fieldNames[key].icon}"></i> ${fieldNames[key].label}`;
                container.appendChild(div);
            }
        });
    }
}

window.showDivs = showDivs;
