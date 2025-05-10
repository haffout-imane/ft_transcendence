export function renderProfilePage() {
    const app = document.getElementById("main-page");
    if (!app)
        return;
    app.innerHTML = `
    <div class="home-background">
      <div class="ui-container">
        <a href="/home" data-link class="logo-link">
          <img src="/assets/logo.png" alt="logo" class="logo-icon" />
        </a>
  
        <a href="/profile" data-link class="profile-link">
          <img src="/assets/profile/profile_2.png" alt="Profile" class="profile-icon" />
        </a>

        <a href="/settings" data-link class="settings-link">
          <img src="/assets/setting/setting_1.png" alt="Settings" class="settings-icon" />
        </a>

        <a href="/chat" data-link class="chat-link">
          <img src="/assets/chat/chat_1.png" alt="Chat" class="chat-icon" />
        </a>

        <div class="window">

        </div>
      </div>
    `;
    console.log('Profile page rendered successfully.');
}
