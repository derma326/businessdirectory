document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch("/apps/custom-form/data");
        const data = await response.json();

        let output = "";
        data.forEach(entry => {
            output += `<p><strong>Name:</strong> ${entry.name} <br> <strong>Email:</strong> ${entry.email}</p>`;
        });

        document.getElementById("displayData").innerHTML = output;
    } catch (error) {
        document.getElementById("displayData").innerHTML = "Error loading data.";
    }
});
