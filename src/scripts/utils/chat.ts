
import { getSocket } from "./socket.js";

type User = {
    id: number;
    name: string;
    profileImage: string;
  };
  
  const users: User[] = [
    { id: 1, name: "Alice", profileImage: "/assets/profile/default.jpg" },
    { id: 2, name: "Bob", profileImage: "/assets/profile/profile_1.png" },
    { id: 3, name: "Charlie", profileImage: "/assets/profile/profile_2.png" },
	{ id: 4, name: "David", profileImage: "/assets/profile/default.jpg" },
	{ id: 5, name: "Eve", profileImage: "/assets/profile/profile_1.png" },
	{ id: 6, name: "Frank", profileImage: "/assets/profile/profile_2.png" },
	{ id: 7, name: "Grace", profileImage: "/assets/profile/default.jpg" },
	{ id: 8, name: "Heidi", profileImage: "/assets/profile/profile_1.png" },
	{ id: 9, name: "Ivan", profileImage: "/assets/profile/profile_2.png" },
	{ id: 10, name: "Judy", profileImage: "/assets/profile/default.jpg" },
	{ id: 11, name: "Kevin", profileImage: "/assets/profile/profile_1.png" },
	{ id: 12, name: "Laura", profileImage: "/assets/profile/profile_2.png" },
	{ id: 13, name: "Mallory", profileImage: "/assets/profile/default.jpg" },
	{ id: 14, name: "Nina", profileImage: "/assets/profile/profile_1.png" },
	{ id: 15, name: "Oscar", profileImage: "/assets/profile/profile_2.png" },
	{ id: 16, name: "Peggy", profileImage: "/assets/profile/default.jpg" },
  ];


  type Message = {
	from: "me" | "them";
	text: string;
	timestamp: string;
  };
  
  type msgToSend = {
	to: string;
	text: string;
  };

  type Conversation = {
	id: number;
	userName: string;
	userImage: string;
	lastMessage: string;
	timestamp: string;
	messages: Message[];
  };
  

  const conversations: Conversation[] = [
	{
	  id: 1,
	  userName: "Alice",
	  userImage: "/assets/profile/default.jpg",
	  lastMessage: "Hey, how are you?",
	  timestamp: "10:24 AM",
	  messages: [
		{ from: "them", text: "Hey!", timestamp: "10:20 AM" },
		{ from: "me", text: "Hi Alice!", timestamp: "10:21 AM" },
		{ from: "them", text: "How are you?", timestamp: "10:22 AM" },
		{ from: "me", text: "I'm good, thanks!", timestamp: "10:23 AM" },
	  ],
	},
	{
	  id: 2,
	  userName: "Bob",
	  userImage: "/assets/profile/profile_1.png",
	  lastMessage: "Let’s meet later!",
	  timestamp: "Yesterday",
	  messages: [
		{ from: "them", text: "Are you free later?", timestamp: "Yesterday 2:00 PM" },
		{ from: "me", text: "Yes! Let's meet up", timestamp: "Yesterday 2:10 PM" },
	  ],
	},
	{
	  id: 3,
	  userName: "Charlie",
	  userImage: "/assets/profile/profile_2.png",
	  lastMessage: "Game night?",
	  timestamp: "Today",
	  messages: [
		{ from: "them", text: "Are you up for a game?", timestamp: "Today 9:00 AM" },
		{ from: "me", text: "Sure! What game?", timestamp: "Today 9:05 AM" },
	  ],
	},
	{
	  id: 4,
	  userName: "David",
	  userImage: "/assets/profile/default.jpg",
	  lastMessage: "Let's catch up!",
	  timestamp: "Today",
	  messages: [
		{ from: "them", text: "It's been a while!", timestamp: "Today 8:00 AM" },
		{ from: "me", text: "Yes, let's meet!", timestamp: "Today 8:05 AM" },
	  ],
	},
	
  ];

  
function showUserDetail(user: User) {
	const userDetailBox = document.getElementById("user-detail-box") as HTMLDivElement;
	if (!userDetailBox) return;

	userDetailBox.innerHTML = `
		<div class="user-detail">
			<button class="close-button" id="close-user-detail">✖</button>
			<div class="user-profile">
				<div class="user-pdp">
					<img src="${user.profileImage}" alt="${user.name}" class="user-profile-image" />
				</div>
				<div class="usr-info">
					<h2 class="user-name">${user.name}</h2>
					<h2 class="user-slogan">Slogan</h2>
				</div>
				</div>
			<div class="user-actions">
				<button class="action-button friend-request-button" title="Send Friend Request">
					<img src="./../assets/icons/add_user.png" alt="Send Friend Request" id="friend-img"/>
				</button>
				<button class="action-button block-user-button" title="Block User">
					<img src="./../assets/icons/block_user.png" alt="Block User" id="block-img"/>
				</button>
				<button class="action-button game-request-button" title="Send Game Request">
					<img src="./../assets/icons/game_invite.png" alt="Send Game Request" />
				</button>
			</div>
		</div>
	`;

	// Show the user detail box
	userDetailBox.style.display = "block";

	// Add event listener to close button
	const closeButton = document.getElementById("close-user-detail");
	if (closeButton) {
		closeButton.addEventListener("click", () => {
			userDetailBox.style.display = "none"; // Hide the user detail box
		});
	}



	// Add event listeners for action buttons
	const friendRequestButton = userDetailBox.querySelector(".friend-request-button");
	const blockUserButton = userDetailBox.querySelector(".block-user-button");
	const gameRequestButton = userDetailBox.querySelector(".game-request-button");

	if (friendRequestButton) {
		friendRequestButton.addEventListener("click", () => {
			const friendImg = document.getElementById("friend-img") as HTMLImageElement;
			if (friendImg.src.endsWith("add_user.png")) {
				friendImg.src = "./../assets/icons/remove_user.png";
				friendImg.alt = "Remove Friend";
			} else {
				friendImg.src = "./../assets/icons/add_user.png";
				friendImg.alt = "Send Friend Request";
			}
		});
	}

	if (blockUserButton) {
		blockUserButton.addEventListener("click", () => {
			const blockImg = document.getElementById("block-img") as HTMLImageElement;

			// Extract the file name from the src attribute
			const blockImgFileName = blockImg.src.split("/").pop();

			if (blockImgFileName === "block_user.png") {
				blockImg.src = "./../assets/icons/unblock_user.png";
				blockImg.alt = "Unblock User";
			} else {
				blockImg.src = "./../assets/icons/block_user.png";
				blockImg.alt = "Block User";
			}
		});
	}

	if (gameRequestButton) {
		gameRequestButton.addEventListener("click", () => {
			alert(`Game request sent to ${user.name}`);
		});
	}
}

  

  export function setupChatSearch() {
    const input = document.getElementById("user-search-input") as HTMLInputElement;
    const results = document.getElementById("search-results");
  
    if (!input || !results) return;
  
    function renderResults(filtered: User[]) {
      results.innerHTML = "";
  
      if (filtered.length === 0) {
        results.innerHTML = `<div class="no-results">No users found.</div>`;
        return;
      }
  
      filtered.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-entry";
        div.innerHTML = `
          <div style="display: flex; align-items: center; padding: 5px;">
            <img src="${user.profileImage}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;" />
            <span>${user.name}</span>
          </div>
        `;
        div.addEventListener("click", () => {
			results.style.display = "none"; // Hide results
			showUserDetail(user);
		  });
		  
        results.appendChild(div);
      });
    }
  
    input.addEventListener("input", () => {
      const value = input.value.trim().toLowerCase();
  
      if (value === "") {
        results.style.display = "none";
        return;
      }
  
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(value)
      );
  
      renderResults(filtered);
      results.style.display = "block";
    });
  
    // Hide results initially
    results.style.display = "none";
  }
  
  function renderNameHeader(conv: Conversation) {
	const header = document.getElementById("conversation-container-header");
	if (header) {
		header.innerHTML = `
			<div class="head">
				<img src="${conv.userImage}" alt="${conv.userName}" />
				<span>${conv.userName}</span>
			</div>`;
	  }
	}

	function renderChat(conv: Conversation) {
		const chatContainer = document.getElementById("chat-container");
		if (!chatContainer) return;
	  
		chatContainer.innerHTML = ""; // Clear old messages
	  
		conv.messages.forEach((msg) => {
		  const msgWrapper = document.createElement("div");
		  msgWrapper.style.display = "flex";
		  msgWrapper.style.justifyContent = msg.from === "me" ? "flex-end" : "flex-start";
		  msgWrapper.style.marginBottom = "10px";
	  
		  const msgBubble = document.createElement("div");
		  msgBubble.style.maxWidth = "70%";
		  msgBubble.style.background = msg.from === "me" ? "rgba(0, 178, 30, 0.7)" : "rgba(68, 68, 68, 0.5)";
		  msgBubble.style.color = "white";
		  msgBubble.style.padding = "10px";
		  msgBubble.style.borderRadius = "10px";
		  msgBubble.style.wordWrap = "break-word";
	  
		  msgBubble.innerHTML = `
			${msg.text}
			<div style="font-size: 0.7rem; color: lightgray; margin-top: 5px;">${msg.timestamp}</div>
		  `;
	  
		  msgWrapper.appendChild(msgBubble);
		  chatContainer.appendChild(msgWrapper);
		});
	  }
	  
	  

	  export function showLastConversationByDefault() {
		if (conversations.length > 0) {
		  // Assuming the last in array is the most recent
		  const lastConversation = conversations[0]; // or conversations[conversations.length - 1] if sorted oldest -> newest

		  renderNameHeader(lastConversation);
		  renderChat(lastConversation);
		}
	  }
	  


export function renderConversations() {
	const list = document.getElementById("conversation-list");
	if (!list) return;
	list.innerHTML = ""; // Clear old entries

	let activeConversation: Conversation | null = null; // Track the active conversation

	conversations.forEach((conv) => {
		const item = document.createElement("div");
		item.className = "conversation-item";
		item.innerHTML = `
			<div style="display: flex; align-items: center; gap: 10px; padding: 10px;">
				<img src="${conv.userImage}" alt="${conv.userName}" style="width: 40px; height: 40px; border-radius: 50%;" />
				<div style="flex: 1;">
					<div style="font-weight: bold;">${conv.userName}</div>
					<div style="color: rgb(68, 68, 68);">${conv.lastMessage}</div>
				</div>
				<div style="font-size: 0.8rem; color: rgb(68, 68, 68);">${conv.timestamp}</div>
			</div>
		`;

		item.addEventListener("click", () => {
			activeConversation = conv; // Update the active conversation
			renderNameHeader(conv);
			renderChat(conv);
		});

		list.appendChild(item);
	});

	// Add the message input event listener outside the loop
	const messageInput = document.getElementById("message-input") as HTMLInputElement;

	if (messageInput) {
		messageInput.addEventListener("keydown", function (event) {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault(); // prevent newline if it's a textarea
				const text = messageInput.value.trim();
				if (text !== "" && activeConversation) {
					const msgToSend: msgToSend = {
						to: activeConversation.userName, // Use the active conversation's userName
						text: text,
					};
					const socket = getSocket();
					socket.send(JSON.stringify(msgToSend));
					activeConversation.messages.push({
						from: "me",
						text: text,
						timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					});
					renderChat(activeConversation); // Re-render the chat with the new message
					messageInput.value = ""; // Clear input
				}
			}
		});
	}
}



  export function setupNotificationIcon() {
	const icon = document.getElementById("notification-icon") as HTMLImageElement;
	const popup = document.getElementById("notification-popup") as HTMLDivElement;
	if (!icon) return;
  
	let isOn = false;
  

	icon.addEventListener("click", () => {
		isOn = !isOn;
		icon.src = isOn ? "./../assets/chat/notif_off.png" : "./../assets/chat/notif_on.png";
		icon.alt = isOn ? "Notifications On" : "Notifications Off";
	});


	if (icon && popup) {
		icon.addEventListener("click", () => {
			popup.style.display = popup.style.display === "block" ? "none" : "block";
		});

	}

		const notificationItems = document.querySelectorAll('.notification-item');

		notificationItems.forEach(item => {
			const acceptButton = item.querySelector('.accept-btn') as HTMLElement;
			const declineButton = item.querySelector('.decline-btn') as HTMLElement;

			const removeNotification = () => {
				(item as HTMLElement).style.display = 'none'; // Cast item to HTMLElement
			};

			acceptButton?.addEventListener('click', removeNotification);
			declineButton?.addEventListener('click', removeNotification);
		});

}
  