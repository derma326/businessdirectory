document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("customForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value
        };

        try {
            const response = await fetch("/apps/custom-form/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    });
});
