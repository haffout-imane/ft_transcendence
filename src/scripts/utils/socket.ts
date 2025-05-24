import { showCustomAlert } from "./auth.js";
import { renderConversations } from "./chat.js";


let socket: WebSocket | null = null;

/**
 * Initialize WebSocket connection with authentication token
 */

export function handleChatMessage(payload: any) {
  const { from, text, timestamp } = payload;

  
	const chatContainer = document.getElementById("chat-container") as HTMLDivElement;
	if (!chatContainer) {
		showCustomAlert("New message received from " + from);
		// change the chat icon image to indicate a new message
		let chatImage = document.getElementById("chat-image") as HTMLImageElement;
		if (chatImage) {
			chatImage.setAttribute("src", "/assets/chat/chat_3.png");
			chatImage.setAttribute("style", "width: 107px; height: auto;");
		}
	}
	else {
		renderConversations();
	}
	
}


export function connectWebSocket() {
  // Get the token stored in localStorage (assumed to be a string)
  const token = localStorage.getItem("auth_token");

  if (!token) {
    console.error("No auth token found in localStorage");
    return;
  }

  // Create a WebSocket connection including the token as a query param
  socket = new WebSocket(`ws://localhost:8080?token=${token}`);

  

  // Event: connection opened successfully
  socket.onopen = () => {
    console.log("✅ WebSocket connected with token");
  };

  // Event: receive messages from the server
  socket.onmessage = (event) => {
    // try {
      const { type, payload } = JSON.parse(event.data);
  
      switch (type) {
        case "chat":
          handleChatMessage(payload);
          break;
        // case "notification":
        //   handleNotification(payload);
        //   break;
        default:
          console.warn("⚠️ Unknown message type:", type);
      }
    // } catch (err) {
    //   console.error("❌ Failed to parse message:", event.data);
    // }
  };
  

  // Event: connection closed
  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
    socket = null; // Clear the socket reference
  };

  // Event: error
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
}

/**
 * Get the current WebSocket instance
 */
export function getSocket(): WebSocket | null {
  return socket;
}

