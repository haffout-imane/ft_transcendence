import { showCustomAlert } from "../components/notif.js";
import { renderChatPage } from "../pages/chatPage.js";
import { socket } from "./socket.js";

// Global function to close all overlays/popups
function closeAllOverlays() {
	// Close notification popup
	const notificationPopup = document.getElementById("notification-popup") as HTMLDivElement;
	if (notificationPopup) {
		notificationPopup.style.display = "none";
	}

	// Close search results
	const searchResults = document.getElementById("search-results");
	if (searchResults) {
		searchResults.style.display = "none";
	}

	// Close user detail box
	const userDetailBox = document.getElementById("user-detail-box") as HTMLDivElement;
	if (userDetailBox) {
		userDetailBox.style.display = "none";
	}
}

type User = {
    username: string;
    profilepicture: string;
	slogan : string;
	friends : boolean;
	blocked : boolean;
};

async function getUsers(){
	let users: User[];
	try {
		const response = await fetch("/api/users", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch users data`);
		}

		users = await response.json();
	}
	catch (error) {
		console.error("Error fetching users data:", error);
		return []; // Return an empty array in case of error
	}	
	return users;
}

type Message = {
	from: string;
	text: string;
	timestamp: string;
};

type msgToSend = {
	type: "chat";
	to: string;
	message: string;
};

type friends = {
	username: string;
	profilepicture: string;
	lastMessage: string;
	timestamp: string;
	isOnline: boolean;
	messages: Message[];
};

function showUserDetail(user: User) {
	// Close all other overlays first
	closeAllOverlays();

	const userDetailBox = document.getElementById("user-detail-box") as HTMLDivElement;
	if (!userDetailBox) return;

	userDetailBox.innerHTML = `
		<div class="user-detail">
			<button class="close-button" id="close-user-detail">✖</button>
			<div class="user-profile">
				<div class="user-pdp">
					<img src="${user.profilepicture}" alt="${user.username}" class="user-profile-image" />
				</div>
				<div class="usr-info">
					<h2 class="user-name">${user.username}</h2>
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

	if (user.friends === true) {
		const friendImg = document.getElementById("friend-img") as HTMLImageElement;
		friendImg.src = "./../assets/icons/remove_user.png";
		friendImg.alt = "Remove Friend";
	}
	else {
		const friendImg = document.getElementById("friend-img") as HTMLImageElement;
		friendImg.src = "./../assets/icons/add_user.png";
		friendImg.alt = "Send Friend Request";
	}
	if (user.blocked === true) {
		const blockImg = document.getElementById("block-img") as HTMLImageElement;
		blockImg.src = "./../assets/icons/unblock_user.png";
		blockImg.alt = "Block User";
	}
	else {
		const blockImg = document.getElementById("block-img") as HTMLImageElement;
		blockImg.src = "./../assets/icons/block_user.png";
		blockImg.alt = "Unblock User";
	}

	if (friendRequestButton) {
		friendRequestButton.addEventListener("click", async () => {
			const friendImg = document.getElementById("friend-img") as HTMLImageElement;
			if(user.friends === true) {
				try {
					const response = await fetch("/api/removeFriend", {
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username: user.username }),
					});
					if (!response.ok) {
						throw new Error(`Failed to remove friend`);
					}
					user.friends = false; // Update user status to not friends
					showCustomAlert("Friend removed successfully.");
				}
				catch (error) {
					console.error("Error removing friend:", error);
					showCustomAlert("Failed to remove friend.");
				}
			}
			else 
			{
				// Send friend request
				socket.send(JSON.stringify({
					type: "notification",
					to: user.username,
				}));
				showCustomAlert(`Friend request sent to ${user.username}`);
			}
		});
	}

	if (blockUserButton) {
		blockUserButton.addEventListener("click", async () => {
			const blockImg = document.getElementById("block-img") as HTMLImageElement;
			const blockImgFileName = blockImg.src.split("/").pop();

		
			if (user.blocked === false) {
				blockImg.src = "./../assets/icons/unblock_user.png";
				try {
					const response = await fetch("/api/block", {
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username: user.username }),
					});
					if (!response.ok) {
						throw new Error(`Failed to block user`);
					}
					user.friends = false; // Update user status to blocked
					showCustomAlert("User blocked successfully.");
					renderChatPage();
				}
				catch (error) {
					console.error("Error blocking user:", error);
					showCustomAlert("Failed to block user.");
				}
			}
			else {
				blockImg.src = "./../assets/icons/block_user.png";
				try {
					const response = await fetch("/api/unblock", {
						method: "PUT",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username: user.username }),
					});
					if (!response.ok) {
						throw new Error(`Failed to unblock user`);
					}
					user.friends = false; // Update user status to unblocked
					showCustomAlert("User unblocked successfully.");
					renderChatPage();
				}
				catch (error) {
					console.error("Error unblocking user:", error);
					showCustomAlert("Failed to unblock user.");
				}
			}

			// if (blockImgFileName === "block_user.png") {
			// 	blockImg.src = "./../assets/icons/unblock_user.png";
			// 	blockImg.alt = "Unblock User";
			// } else {
			// 	blockImg.src = "./../assets/icons/block_user.png";
			// 	blockImg.alt = "Block User";
			// }
		});
	}

	if (gameRequestButton) {
		gameRequestButton.addEventListener("click", () => {
			alert(`Game request sent to ${user.username}`);
		});
	}
}

export function setupChatSearch() {
	const input = document.getElementById("user-search-input") as HTMLInputElement;
	const results = document.getElementById("search-results");

	if (!input || !results) return;

	async function renderResults(users: User[]) {
		results.innerHTML = "";
		
		if (users.length === 0) {
			results.innerHTML = `<div class="no-results">No users found.</div>`;
			return;
		}

		users.forEach(user => {
			const div = document.createElement("div");
			div.className = "user-entry";
			div.innerHTML = `
				<div style="display: flex; align-items: center; padding: 5px;">
					<img src="${user.profilepicture}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;" />
					<span>${user.username}</span>
				</div>
			`;
			div.addEventListener("click", () => {
				results.style.display = "none"; // Hide results
				showUserDetail(user);
			});
			
			results.appendChild(div);
		});
	}

	// Close other overlays when focusing on search input
	input.addEventListener("focus", () => {
		// Close notification popup and user detail box, but keep search results if they exist
		const notificationPopup = document.getElementById("notification-popup") as HTMLDivElement;
		if (notificationPopup) {
			notificationPopup.style.display = "none";
		}

		const userDetailBox = document.getElementById("user-detail-box") as HTMLDivElement;
		if (userDetailBox) {
			userDetailBox.style.display = "none";
		}
	});

	input.addEventListener("input", async () => {
		const value = input.value.trim().toLowerCase();

		if (value === "") {
			results.style.display = "none";
			return;
		}

		// Close other overlays when showing search results
		const notificationPopup = document.getElementById("notification-popup") as HTMLDivElement;
		if (notificationPopup) {
			notificationPopup.style.display = "none";
		}

		const userDetailBox = document.getElementById("user-detail-box") as HTMLDivElement;
		if (userDetailBox) {
			userDetailBox.style.display = "none";
		}

		let users = await getUsers();
		users = users.filter(user =>
			user.username.toLowerCase().includes(value)
		);

		renderResults(users);
		results.style.display = "block";
	});

	// Hide results initially
	results.style.display = "none";
}

function renderNameHeader(friend: friends) {
	const header = document.getElementById("conversation-container-header");
	if (header) {
		header.innerHTML = `
			<div class="head">
				<img src="${friend.profilepicture}" alt="${friend.username}" />
				<span>${friend.username}</span>
			</div>`;
	}
}

async function renderChat(conv: friends) {
	const chatContainer = document.getElementById("chat-container");
	if (!chatContainer) return;

	let messages : Message[] = conv.messages || [];

	
	
	try {
		const response = await fetch(`/api/messages?username=${conv.username}`, {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch messages for ${conv.username}`);
		}

		const data = await response.json();
		messages = data.messages;
	}
	catch (error) {
		console.error("Error fetching messages:", error);
		return; // Exit if there's an error
	}

	chatContainer.innerHTML = ""; // Clear old messages

	if (!messages || messages.length === 0) {
		return;
	}

	messages.forEach((msg) => {
		if (!msg || !msg.from || !msg.text) {
			return; // Skip invalid messages
		}
		const msgWrapper = document.createElement("div");
		msgWrapper.style.display = "flex";
		msgWrapper.style.justifyContent = msg.from === conv.username ? "flex-start" : "flex-end";
		msgWrapper.style.marginBottom = "10px";

		const msgBubble = document.createElement("div");
		msgBubble.style.maxWidth = "70%";
		msgBubble.style.background = msg.from === conv.username ? "rgba(68, 68, 68, 0.5)" : "rgba(0, 178, 30, 0.7)";
		msgBubble.style.color = "white";
		msgBubble.style.padding = "10px";
		msgBubble.style.borderRadius = "10px";
		msgBubble.style.wordWrap = "break-word";
		const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		msgBubble.innerHTML = `
			${msg.text}
			<div style="font-size: 0.7rem; color: lightgray; margin-top: 5px;">${timestamp}</div>
		`;

		msgWrapper.appendChild(msgBubble);
		chatContainer.appendChild(msgWrapper);
	});
}


export async function renderConversations() {
	const list = document.getElementById("conversation-list");
	if (!list) return;
	list.innerHTML = "";

	let activeConversation: friends | null = null;

	let myFriends: friends[] = [];

	try {
		const response = await fetch("/api/friends", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch friends data`);
		}

		myFriends = await response.json();


	}
	catch (error) {
		console.error("Error fetching friends data:", error);
		return; // Exit if there's an error
	}

	if (myFriends.length === 0) {
		return;
	}

	
	myFriends.forEach((friend) => {
		const item = document.createElement("div");
		item.className = "conversation-item";
		
		const isOnline = friend.isOnline;
		
		const lastMessage = friend.lastMessage || "No messages yet";
		const timestamp = friend.timestamp || "";

		item.innerHTML = `
			<div style="display: flex; align-items: center; gap: 10px; padding: 10px; position: relative;">
				<div style="position: relative; display: inline-block;">
					<img src="${friend.profilepicture}" alt="${friend.username}" style="width: 40px; height: 40px; border-radius: 50%;" />
					<div style="
						position: absolute;
						top: -2px;
						right: -2px;
						width: 10px;
						height: 10px;
						border-radius: 50%;
						background-color: ${isOnline ? '#4CAF50' : '#9E9E9E'};
						border: 2px solid white;
						box-shadow: 0 1px 3px rgba(0,0,0,0.3);
					"></div>
				</div>
				<div style="flex: 1;" id="conv-${friend.username}">
					<div style="font-weight: bold;">${friend.username}</div>
					<div style="color: rgb(68, 68, 68);">${lastMessage}</div>
				</div>
				<div style="font-size: 0.8rem; color: rgb(68, 68, 68);">${timestamp}</div>
			</div>
		`;

		item.addEventListener("click", () => {
			// Close all overlays when selecting a conversation
			closeAllOverlays();

			let def = document.getElementById("default-conv");
			if (def) {
				def.style.display = "none";
			}

			activeConversation = friend;
			let input = document.getElementById("message-input") as HTMLInputElement;
			if (input) {
				input.style.display = "flex";
			}

			let convHeader = document.getElementById("conversation-container-header");
			if (convHeader) {
				convHeader.style.display = "flex";
			}

			let convBody = document.getElementById("conversation-container");
			if (convBody) {
				convBody.style.display = "flex";
			}

			renderNameHeader(friend);
			renderChat(friend);
		});

		list.appendChild(item);
	});


	const messageInput = document.getElementById("message-input") as HTMLInputElement;

if (messageInput) {
    messageInput.addEventListener("keydown", async function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            const text = messageInput.value.trim();
            if (text !== "" && activeConversation) {
                
                let username: string;
                // get my username
                try {
                    const response = await fetch("/api/setting/data", {
                        method: "GET",
                        credentials: "include", // Include cookies in the request
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch profile data`);
                    }

                    const data = await response.json();
                    username = data.username;

                } catch (error) {
                    console.error("Error fetching profile data:", error);
                    showCustomAlert("Failed to fetch your username.");
                    return; // Exit if there's an error
                }
                
                // Send message via socket
                socket.send(JSON.stringify({
                    "type": "message", 
                    "to": activeConversation.username, 
                    "message": text
                }));
                
                // Add message to activeConversation messages array
                if (!activeConversation.messages) {
                    activeConversation.messages = [];
                }

                const newMessage: Message = {
                    from: username,
                    text: text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                activeConversation.messages.push(newMessage);

                // Add the message directly to the chat container DOM
                const chatContainer = document.getElementById("chat-container");
                if (chatContainer) {
                    const msgWrapper = document.createElement("div");
                    msgWrapper.style.display = "flex";
                    msgWrapper.style.justifyContent = "flex-end"; // Your messages should be on the left
                    msgWrapper.style.marginBottom = "10px";

                    const msgBubble = document.createElement("div");
                    msgBubble.style.maxWidth = "70%";
                    msgBubble.style.background = "rgba(0, 178, 30, 0.7)";
                    msgBubble.style.color = "white";
                    msgBubble.style.padding = "10px";
                    msgBubble.style.borderRadius = "10px";
                    msgBubble.style.wordWrap = "break-word";

                    msgBubble.innerHTML = `
                        ${text}
                        <div style="font-size: 0.7rem; color: lightgray; margin-top: 5px;">${newMessage.timestamp}</div>
                    `;

                    msgWrapper.appendChild(msgBubble);
                    chatContainer.appendChild(msgWrapper);

                    // Scroll to bottom to show the new message
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

                // Clear the input
                messageInput.value = "";
                
                console.log("Message sent:", text);
            }
        }
    });
	}
}


type Notification = {
	from: string;
	type: string;
};

async function getNotifications(): Promise<Notification[]> {
	
	let username: string;
	// get my username
	try {
		const response = await fetch("/api/setting/data", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch profile data`);
		}

		const data = await response.json();

		username = data.username;

	}
	catch (error) {
		console.error("Error fetching profile data:", error);
		showCustomAlert("Failed to fetch your username.");
		return []; // Return empty array in case of error
	}
	
	try {
		const response = await fetch(`/api/notifications?username=${username}`, {
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch notifications`);
		}

		const data = await response.json();
		console.log("Fetched notifications data:", data);
		
		// Extract the notifications array from the response
		const notifications: Notification[] = data.notifications || [];
		console.log("Extracted notifications array:", notifications);
		return notifications;
	}
	catch (error) {
		console.error("Error fetching notifications:", error);
		return [];
	}
}

async function renderNotifications() {
    const popup = document.getElementById("notification-popup") as HTMLDivElement;
    if (!popup) return;

    // Get existing real-time notifications (added by WebSocket)
    const existingRealTimeNotifs = popup.querySelectorAll('.notification-item');
    
    // Get persisted notifications from API
    const apiNotifications = await getNotifications();

	console.log("apiNotifications.length:", apiNotifications.length);
	
    // Only clear and rebuild if we have API notifications
    // This preserves real-time notifications that haven't been persisted yet
    if (apiNotifications && apiNotifications.length > 0) {
        // Clear existing content
        popup.innerHTML = "";
        
        // Add API notifications first
        apiNotifications.forEach(notif => {
            const notifDiv = document.createElement("div");
            notifDiv.className = "notification-item";
            notifDiv.innerHTML = `
                <div class="notif-message">
                    ${notif.type} from ${notif.from}.
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
            
            // Add event listeners for API notifications
            const acceptButton = notifDiv.querySelector('.accept-btn') as HTMLElement;
            const declineButton = notifDiv.querySelector('.decline-btn') as HTMLElement;

            const removeNotification = () => {
                notifDiv.style.display = 'none';
            };

            const handleAcceptNotification = async () => {
                try {
                    const response = await fetch("/api/accept_friend", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ username: notif.from }),
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to accept notification from ${notif.from}`);
                    }
                    showCustomAlert(`Accepted friend request from ${notif.from}`);
                } catch (error) {
                    console.error("Error accepting notification:", error);
                    showCustomAlert(`Error accepting friend request from ${notif.from}`);
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
                        body: JSON.stringify({ username: notif.from }),
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to decline notification from ${notif.from}`);
                    }
                    showCustomAlert(`Declined friend request from ${notif.from}`);
                } catch (error) {
                    console.error("Error declining notification:", error);
                    showCustomAlert(`Error declining friend request from ${notif.from}`);
                }
                removeNotification();
            };

            acceptButton?.addEventListener('click', handleAcceptNotification);
            declineButton?.addEventListener('click', handleDeclineNotification);
            
            popup.appendChild(notifDiv);
        });
    } else if (existingRealTimeNotifs.length === 0 || apiNotifications.length === 0) {
        // Only show "no notifications" if there are no real-time notifications either
        popup.innerHTML = `<div class="no-notifications">No notifications</div>`;
    }
}

export function setupNotificationIcon() {
    const icon = document.getElementById("notification-icon") as HTMLImageElement;
    const popup = document.getElementById("notification-popup") as HTMLDivElement;
    if (!icon || !popup) return;

    // Load persisted notifications when setting up (when entering chatPage)
    renderNotifications();

    icon.addEventListener("click", async () => {
        // Close other overlays first
        const searchResults = document.getElementById("search-results");
        if (searchResults) {
            searchResults.style.display = "none";
        }

        const userDetailBox = document.getElementById("user-detail-box") as HTMLDivElement;
        if (userDetailBox) {
            userDetailBox.style.display = "none";
        }

        // Toggle notification popup
        const isCurrentlyVisible = popup.style.display === "block";
        
        if (!isCurrentlyVisible) {
            // Don't re-render if popup already has content (preserves real-time notifications)
            if (popup.innerHTML.trim() === "") {
                await renderNotifications();
            }
            popup.style.display = "block";
        } else {
            popup.style.display = "none";
        }
    });
}

// Optional: Add click outside to close all overlays
document.addEventListener("click", (event) => {
	const target = event.target as HTMLElement;
	
	// Check if click is outside all overlay elements
	const isClickInsideNotification = target.closest("#notification-popup") || target.closest("#notification-icon");
	const isClickInsideSearch = target.closest("#search-results") || target.closest("#user-search-input");
	const isClickInsideUserDetail = target.closest("#user-detail-box");
	
	if (!isClickInsideNotification && !isClickInsideSearch && !isClickInsideUserDetail) {
		closeAllOverlays();
	}
});