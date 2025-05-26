
const opponent={
    opponentProfile: "assets/profile/default.jpg",
    opponentUsername: "Unknown",
    opponentSlogan: "alien404", 
  }

export function renderMatchMakingPage() {
    const user = localStorage.getItem("user");
  
    let profilePictureSrc = "assets/profile/default.jpg";
    let username = "Unknown";
    let slogan = "alien404";
  
    if (user) {
      const userData = JSON.parse(user);
      profilePictureSrc = userData.profilePicture || profilePictureSrc;
      username = userData.username || username;
      slogan = userData.slogan || slogan;
    }
  
    const app = document.getElementById("main-page");
    if (!app) return;
  
    app.innerHTML = `
      <div class="game-background">
        <div class="matchMaking">
          <img src="assets/vs.png" alt="Matchmaking Background" class="vs-image"/>
  
          <div class="first-player">
            <img src="${profilePictureSrc}" />
          </div>
  
          <div class="second-player">
            <img id="opponent-avatar" src="assets/profiles/alien_1.jpg" />
          </div>
        </div>
      </div>
    `;
  
    const avatarElement = document.getElementById("opponent-avatar");
    if (!avatarElement) return;
    
    // 🌀 Add glow/flicker while cycling
    avatarElement.classList.add("spin-animation");
    
    const defaultAvatars = Array.from({ length: 11 }, (_, i) => `assets/profiles/alien_${i}.jpg`);
    
    let interval = setInterval(() => {
      const random = Math.floor(Math.random() * defaultAvatars.length);
      avatarElement.setAttribute("src", defaultAvatars[random]);
    }, 100);
    
    // ✅ After 2.5s: stop cycling, reveal real opponent
    setTimeout(() => {
      clearInterval(interval);
      const opponentPic = opponent.opponentProfile; // replace with actual
      avatarElement.setAttribute("src", opponentPic);
    
      // 🧼 Remove cycling glow, add final reveal
      avatarElement.classList.remove("spin-animation");
      avatarElement.classList.add("reveal-animation");
    }, 2500); 
  }
