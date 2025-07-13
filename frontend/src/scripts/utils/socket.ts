import { showCustomAlert } from "./../components/notif.js";
import { renderConversations } from "./chat.js";
export let socket = null;
export function handleChatMessage(data) {
    const { from, message, timestamp } = data;
    showCustomAlert("New message received from " + from);
    // check if he is in chatPage by route /chat
    if (window.location.pathname !== "/chat") {
        // change the chat icon image to indicate a new message
        let chatImage = document.getElementById("chat-image");
        if (chatImage) {
            chatImage.setAttribute("src", "/assets/chat/chat_3.png");
            chatImage.setAttribute("style", "width: 107px; height: auto;");
        }
    }
    else {
        const chatContainer = document.getElementById("chat-container");
        if (!chatContainer) { // if we're not in the chatPage
            renderConversations();
        }
        else {
            // directly display the message in the chat container
            console.log("Displaying message in chat container");
            const msgWrapper = document.createElement("div");
            msgWrapper.style.display = "flex";
            msgWrapper.style.justifyContent = "flex-start"; // since it's a message from the user
            msgWrapper.style.marginBottom = "10px";
            const msgBubble = document.createElement("div");
            msgBubble.style.maxWidth = "70%";
            // grey background
            msgBubble.style.background = "rgba(68, 68, 68, 0.5)";
            msgBubble.style.color = "white";
            msgBubble.style.padding = "10px";
            msgBubble.style.borderRadius = "10px";
            msgBubble.style.wordWrap = "break-word";
            msgBubble.innerHTML = `
                        ${data.message}
                        <div style="font-size: 0.7rem; color: lightgray; margin-top: 5px;">${data.timestamp}</div>
                    `;
            msgWrapper.appendChild(msgBubble);
            chatContainer.appendChild(msgWrapper);
        }
        let convBox = document.getElementById(`conv-${from}`);
        if (convBox) {
            // add a green dot to the conversation box to indicate a new message
            convBox.innerHTML += `
        <div class="new-message-indicator"></div>
      `;
            convBox.addEventListener("click", () => {
                // Remove the new message indicator when the conversation is clicked
                const newMessageIndicator = convBox.querySelector(".new-message-indicator");
                if (newMessageIndicator) {
                    newMessageIndicator.remove();
                }
                // Change the chat icon back to normal
                let chatImage = document.getElementById("chat-image");
                if (chatImage) {
                    chatImage.setAttribute("src", "/assets/chat/chat_2.png");
                    chatImage.setAttribute("style", "width: 100px; height: auto;");
                }
            });
        }
    }
}
export function handleNotification(data) {
    const { from, message } = data;
    showCustomAlert("New notification from " + from + ": " + message);
    const chatContainer = document.getElementById("chat-container");
    if (!chatContainer) {
        // NOT in chatPage - change chat icon
        let chatImage = document.getElementById("chat-image");
        if (chatImage) {
            chatImage.setAttribute("src", "/assets/chat/chat_3.png");
            chatImage.setAttribute("style", "width: 107px; height: auto;");
        }
    }
    else {
        // IN chatPage - add to notification popup
        let notificationIcon = document.getElementById("notification-icon");
        if (notificationIcon) {
            notificationIcon.setAttribute("src", "/assets/chat/notif_on.png");
        }
        let notificationContainer = document.getElementById("notification-popup");
        if (notificationContainer) {
            // Create new notification element
            const newNotificationDiv = document.createElement('div');
            newNotificationDiv.className = 'notification-item';
            newNotificationDiv.innerHTML = `
                <div class="notif-message">
                    ${message} from ${from}.
                </div>
                <div class="notif-buttons">
                    <button class="accept-btn" title="Accept">
                        <img src="/assets/icons/accept.png" alt="Accept" />
                    </button>
                    <button class="decline-btn" title="Decline">
                        <img src="/assets/icons/decline.png" alt="Decline" />
                    </button>
                </div>
            `;
            // Add event listeners ONLY to this new notification
            const acceptButton = newNotificationDiv.querySelector('.accept-btn');
            const declineButton = newNotificationDiv.querySelector('.decline-btn');
            const removeNotification = () => {
                newNotificationDiv.style.display = 'none';
            };
            const handleAcceptNotification = async () => {
                try {
                    const response = await fetch("/api/accept_friend", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ username: from }),
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to accept notification from ${from}`);
                    }
                    showCustomAlert(`Accepted friend request from ${from}`);
                }
                catch (error) {
                    console.error("Error accepting notification:", error);
                    showCustomAlert(`Error accepting friend request from ${from}`);
                }
                removeNotification();
            };
            const handleDeclineNotification = async () => {
                try {
                    const response = await fetch("/api/delete", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ username: from }),
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to decline notification from ${from}`);
                    }
                    showCustomAlert(`Declined friend request from ${from}`);
                }
                catch (error) {
                    console.error("Error declining notification:", error);
                    showCustomAlert(`Error declining friend request from ${from}`);
                }
                removeNotification();
            };
            acceptButton?.addEventListener('click', handleAcceptNotification);
            declineButton?.addEventListener('click', handleDeclineNotification);
            // Append the new notification to the container
            notificationContainer.appendChild(newNotificationDiv);
        }
    }
}
async function getUsername() {
    try {
        const response = await fetch("/api/setting/data", {
            method: "GET",
            credentials: "include", // Include cookies in the request
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch user data`);
        }
        const data = await response.json();
        return data.username; // Return username or "guest" if not found
    }
    catch (error) {
        console.error("Error fetching username:", error);
        return "undefined"; // Fallback to "guest" if there's an error
    }
}
export async function connectWebSocket() {
    const username = await getUsername();
	let wsUrl;
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
		wsUrl = 'wss://localhost/ws/chat'; // Use 'ws' for local development
	else
    	wsUrl = 'wss://10.12.3.4/ws/chat'; // Changed from 'wss' for local testing
    socket = new WebSocket(wsUrl);
    // Event: connection opened sccessfully
    socket.onopen = () => {
        console.log("✅ WebSocket connected with token");
        console.log("Username:", username);
        socket.send(JSON.stringify({ "type": "auth", "username": username }));
        console.log("auth message sent");
    };
    // Event: receive messages from the server
    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("Received data:", data);
            switch (data.type) {
                case "message":
                    handleChatMessage(data);
                    break;
                case "notification":
                    handleNotification(data);
                    break;
                default:
                    console.warn("⚠️ Unknown message type:", data.type);
                    console.log("Received data:", data);
                    break;

            }
        }
        catch (err) {
            console.error("❌ Failed to parse message:", event.data);
        }
    };
    // Event: connection closed
    socket.addEventListener('close', () => {
        console.log("❌ WebSocket disconnected");
        socket = null; // Clear the socket reference
    });
    return socket;
}
/**
 * Get the current WebSocket instance
 */
export function getSocket() {
    return socket;
}
