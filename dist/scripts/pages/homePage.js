export function renderHomePage() {
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
          <img src="/assets/profile/profile_1.png" alt="Profile" class="profile-icon" />
        </a>

        <a href="/settings" data-link class="settings-link">
          <img src="/assets/setting/setting_1.png" alt="Settings" class="settings-icon" />
        </a>

        <a href="/chat" data-link class="chat-link">
          <img src="/assets/chat/chat_1.png" alt="Chat" class="chat-icon" />
        </a>

        <div class="carousel-wrapper">
          <a href="#" class="previous-link">
            <img src="/assets/buttons/previous.png" alt="previous" class="previous-icon" />
          </a>

          <div class="carousel-container">
            <div class="carousel-track">
              <a href="/game" data-link><img src="/assets/game/1.png" alt="offline" /></a>
              <a href="/matchMaking" data-link><img src="/assets/game/2.png" alt="online" /></a>
              <a href="/matchMaking" data-link><img src="/assets/game/3.png" alt="teamUp" /></a>
              <a href="/matchMaking" data-link><img src="/assets/game/4.png" alt="aiBot" /></a>
              <a href="/tournament" data-link><img src="/assets/game/5.png" alt="tournament" /></a>
            </div>
          </div>

          <a href="#" class="next-link">
            <img src="/assets/buttons/next.png" alt="next" class="next-icon" />
          </a>
        </div>
      </div>
    </div>
  `;
    // Carousel Logic
    const track = document.querySelector(".carousel-track");
    const nextBtn = document.querySelector(".next-link");
    const prevBtn = document.querySelector(".previous-link");
    let index = 0;
    const totalSlides = 5;
    const visibleSlides = 3;
    const cardWidth = 660; // 600px + 60px gap
    function updateCarousel() {
        const offset = cardWidth * index;
        track.style.transform = `translateX(-${offset}px)`;
    }
    nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (index < totalSlides - visibleSlides) {
            index++;
            updateCarousel();
        }
    });
    prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (index > 0) {
            index--;
            updateCarousel();
        }
    });
    updateCarousel();
}
