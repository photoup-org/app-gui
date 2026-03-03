"use server";

export type ViesResponse =
    | { success: true; name: string; address: string; postalCode: string; city: string }
    | { success: false; error: string };

export async function validateVatAction(vatInput: string, formCountryCode: string): Promise<ViesResponse> {
    try {
        if (!vatInput) {
            return { success: false, error: "Missing VAT number." };
        }

        // Clean VAT format: remove spaces and non-alphanumeric chars
        const cleanVat = vatInput.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

        if (cleanVat.length < 3) {
            return { success: false, error: "Invalid VAT format." };
        }

        let countryCode = "PT";
        let vatNumber = cleanVat;

        const firstTwo = cleanVat.substring(0, 2);
        if (/^[A-Z]{2}$/.test(firstTwo)) {
            // Starts with letters
            countryCode = firstTwo;
            vatNumber = cleanVat.substring(2);
        } else {
            // Only numbers, use form country code
            countryCode = formCountryCode ? formCountryCode.toUpperCase() : "PT";
            vatNumber = cleanVat;
        }

        // VIES REST API endpoint
        const viesUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`;

        const response = await fetch(viesUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            // Ensure we don't cache this request as VAT status can change
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(`VIES API returned status ${response.status} - ${response.statusText}`);
            return { success: false, error: "Validation service is currently unavailable. Please enter your details manually." };
        }

        const viesData = await response.json();
        console.log(viesData);

        if (viesData.isValid) {
            let rawAddress = viesData.address || "";
            let parsedStreet = rawAddress;
            let parsedPostalCode = "";
            let parsedCity = "";

            // Match PT Postal Code format (XXXX-XXX)
            const pcRegex = /\b\d{4}-\d{3}\b/;
            const match = rawAddress.match(pcRegex);

            if (match) {
                parsedPostalCode = match[0];
                // Split the string at the postal code
                const parts = rawAddress.split(parsedPostalCode);

                // Everything before is the street (clean up newlines and commas)
                parsedStreet = parts[0].replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim();
                if (parsedStreet.endsWith(',')) parsedStreet = parsedStreet.slice(0, -1);

                // Everything after is usually the city
                parsedCity = parts[1].replace(/\n/g, '').trim();
            } else {
                // Fallback: If no postal code is found, dump everything into the street field cleanly
                parsedStreet = rawAddress.replace(/\n/g, ', ').replace(/\s{2,}/g, " ").trim();
            }

            return {
                success: true,
                name: viesData.name?.trim() || "",
                address: parsedStreet,
                postalCode: parsedPostalCode,
                city: parsedCity
            };
        } else {
            return { success: false, error: "Invalid VAT number." };
        }
    } catch (error) {
        console.error("Error validating VAT against VIES:", error);
        return { success: false, error: "Unable to reach validation service. Please enter details manually." };
    }
}
