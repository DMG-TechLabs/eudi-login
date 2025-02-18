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
        
        Object.entries(config.required).forEach(([key, value]) => {
            if (value == true) {
                let div = document.createElement("div");
                div.className = "document-box";
                div.innerHTML = `<i class="${fieldNames[key].icon}"></i> ${fieldNames[key].label}`;
                documents.appendChild(div);
            }
        });

        if (config.visibility == 1) {
            let anonymousButton = document.getElementById("continue");
            let checkBox = document.createElement("input");
            let label = document.createElement("label");
            checkBox.id = "anonymous-checkbox";
            checkBox.type = "checkbox";
    
            label.htmlFor = "anonymous-checkbox";
            label.innerHTML = '<h4>I prefer to continue anonymously</h4>';
            
            config.visibility = 0;
            console.log("Is public");
    
            anonymous.appendChild(checkBox);
            anonymous.appendChild(label);
    
            checkBox.addEventListener("change", function () {
                if (checkBox.checked) {
                    config.visibility = 2;
                    anonymousButton.innerHTML = `<i class="fa solid fa-user-secret"></i>Continue anonymously`;
                    anonymousButton.style.display = "flex";
                    anonymousButton.style.width = "max-content";
                    anonymousButton.style.alignItems = "center";
                    anonymousButton.style.gap = "5px";
                    console.log("Is anonymous");
                } else {
                    config.visibility = 0;
                    anonymousButton.textContent = "Continue";
                    console.log("Is public");
                }
            });
        } else if (config.visibility == 2) {
            let anonymousButton = document.getElementById("continue");
            anonymousButton.innerHTML = `<i class="fa solid fa-user-secret"></i>Continue anonymously`;
            anonymousButton.style.display = "flex";
            anonymousButton.style.width = "max-content";
            anonymousButton.style.alignItems = "center";
            anonymousButton.style.gap = "5px";
        }
    }
}

window.showDivs = showDivs;
