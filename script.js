document.addEventListener("DOMContentLoaded", function () {
    const chatInputs = document.querySelectorAll(".chat-input input");
    const chatHistories = document.querySelectorAll(".chat-history");

    chatInputs.forEach((input, index) => {
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage(input, index);
            }
        });
    });

    function sendMessage(input, senderIndex) {
        const messageText = input.value.trim();
        if (messageText === "") return;

        // Opret besked-element
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "sent");
        messageElement.innerText = messageText;

        // Tilføj beskeden til senderens chat-historik
        chatHistories[senderIndex].insertBefore(messageElement, chatHistories[senderIndex].firstChild);

        // Skift til den anden chatbox (modtager)
        const receiverIndex = senderIndex === 0 ? 1 : 0;

        // Opret en kopi af beskeden til modtageren
        const receivedMessageElement = document.createElement("div");
        receivedMessageElement.classList.add("message", "received");
        receivedMessageElement.innerText = messageText;

        // Tilføj beskeden til modtagerens chat-historik
        chatHistories[receiverIndex].insertBefore(receivedMessageElement, chatHistories[receiverIndex].firstChild);

        // Scroll til den nyeste besked
        chatHistories[senderIndex].scrollTop = chatHistories[senderIndex].scrollHeight;
        chatHistories[receiverIndex].scrollTop = chatHistories[receiverIndex].scrollHeight;

        // Ryd input-feltet
        input.value = "";
    }
});
