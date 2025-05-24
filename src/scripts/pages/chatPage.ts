import { setupChatSearch, renderConversations, showLastConversationByDefault, setupNotificationIcon} from "../utils/chat.js";
import { handleChatMessage } from "../utils/socket.js";

export function renderChatPage() {
    const app = document.getElementById("main-page");
    if (!app) return;

    app.innerHTML = `
    <div class="home-background">
          <a href="/home" data-link class="logo-link">
            	<img src="/assets/logo.png" alt="logo" class="logo-icon" />
          </a>
  
          <a href="/profile" data-link class="profile-link">
            	<img src="/assets/profile/profile_1.png" alt="Profile" class="profile-icon" />
          </a>
  
          <a href="/settings" data-link class="settings-link">
            	<img src="/assets/setting/setting_1.png" alt="Settings" class="settings-icon" />
          </a>
  
          <a href="/chat" data-link class="chat-link">
            	<img id="chat-image" src="/assets/chat/chat_2.png" alt="Chat" class="chat-icon" />
          </a>
  
          <div class="window">
            	<div class="exit">
                    <a href="/home" data-link>
                    	<img src="/assets/buttons/exit.png" alt="exit"/>
                    </a>
              	</div>

				<div class="chat-container">
                              <div class="messages-container">
                                    <div class="messages-container-header">
                                          <p class="Space_Font_chat">Messages</p><br>
                                    </div>
                      
                                    <div class="search-bar">
                                          <input type="text" id="user-search-input" placeholder="Search user..." class="user-search-input" />
                                    </div>
                                    
                                    <div class="notification">
                                          <img id="notification-icon" src="./../assets/chat/notif_on.png" alt="Notification Icon" class="notification-icon" />
                                    
                                          <div id="notification-popup" class="notification-popup">
                                                <div class="notification-item">
                                                      <div class="notif-message">
                                                            You have a new friend request.
                                                      </div>
                                                      <div class="notif-buttons">
                                                            <button class="accept-btn" title="Accept">
                                                                  <img src="./../assets/icons/accept.png" alt="Accept" />
                                                            </button>
                                                            <button class="decline-btn" title="Decline">
                                                                  <img src="./../assets/icons/decline.png" alt="Decline" />
                                                            </button>
                                                      </div>
                                                </div>
                                                <div class="notification-item">
                                                      <div class="notif-message">
                                                            Game invite from Alice.
                                                      </div>
                                                      <div class="notif-buttons">
                                                            <button class="accept-btn" title="Accept">
                                                                  <img src="./../assets/icons/accept.png" alt="Accept" />
                                                            </button>
                                                            <button class="decline-btn" title="Decline">
                                                                  <img src="./../assets/icons/decline.png" alt="Decline" />
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>

                                    </div>

                                    <div class="search-results" id="search-results">
                                    
                                    </div>
                                    
                                    <div class="user-detail-box" id="user-detail-box"> </div>

                                    <div class="conversation-list" id="conversation-list">

                                    </div>
                                    
                              </div>
                      
                              <div class="conversation-container-header" id="conversation-container-header">
                                    
                              </div>
                              <div class="conversation-container">
                                    <div class="input-message-container">
                                          <input type="text" id="message-input" placeholder="Type your message here..." class="message-input" />
                                    </div>

                                    <div class="chat-container" id="chat-container">

                                    </div>
                              </div>
				</div>
            
            


          </div>
    </div>
  `;
  
      setupChatSearch();
      setupNotificationIcon();
      renderConversations();
      showLastConversationByDefault();



  }