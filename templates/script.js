document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-text");
    const chatHistory = document.querySelector(".chat-history");

    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === "") return;

        // Opret besked-element
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "sent"); // "sent" = brugerens besked
        messageElement.innerText = messageText;

        // Tilføj beskeden øverst i chat-historikken
        chatHistory.insertBefore(messageElement, chatHistory.firstChild);

        // Scroll ned til den nyeste besked
        chatHistory.scrollTop = chatHistory.scrollHeight; // Sørg for, at vi altid scroller ned
    }
});
