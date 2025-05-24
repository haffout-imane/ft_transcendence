export function renderGraphs() {
    const statistics = {
      totalMatches: 20,
      wins: 3,
      losses: 3,
      goelsScored: 50,
      goalsConceded: 30,
    };
  
    const canvas = document.getElementById('winLossCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 60;
      const lineWidth = 15;
  
      // Use only actual wins + losses to determine angles
      const total = statistics.wins + statistics.losses;
      const winRatio = statistics.wins / total;
      const lossRatio = statistics.losses / total;
  
      const winAngle = 2 * Math.PI * winRatio;
      const lossAngle = 2 * Math.PI * lossRatio;
  
      // Background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
  
      const winGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      winGradient.addColorStop(0, '#4caf50');
      winGradient.addColorStop(1, '#81c784');
  
      const lossGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      lossGradient.addColorStop(0, '#f44336');
      lossGradient.addColorStop(1, '#e57373');
  
      // Animate Win Arc
      let currentWinAngle = -Math.PI / 2;
      const targetWinAngle = -Math.PI / 2 + winAngle;
  
      const animateWin = () => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, currentWinAngle);
        ctx.strokeStyle = winGradient;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
  
        if (currentWinAngle < targetWinAngle) {
          currentWinAngle += 0.02;
          requestAnimationFrame(animateWin);
        } else {
          animateLoss();
        }
      };
  
      // Animate Loss Arc
      let currentLossAngle = targetWinAngle;
      const targetLossAngle = -Math.PI / 2 + 2 * Math.PI;
  
      const animateLoss = () => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentLossAngle, currentLossAngle + 0.02);
        ctx.strokeStyle = lossGradient;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
  
        if (currentLossAngle < targetLossAngle) {
          currentLossAngle += 0.02;
          requestAnimationFrame(animateLoss);
        }
      };
  
      animateWin();
  
      // Add Legend Below Canvas
      const legendHTML = `
      <div class="legend">
        <div>
          <div class="legend-square" style="background: linear-gradient(to right, #4caf50, #81c784);"></div>
          <span>Win</span>
        </div>
        <div>
          <div class="legend-square" style="background: linear-gradient(to right, #f44336, #e57373);"></div>
          <span>Lose</span>
        </div>
      </div>
    `;
    
  
      const existingLegend = document.getElementById('winLossLegend');
      if (!existingLegend) {
        const legendWrapper = document.createElement('div');
        legendWrapper.id = 'winLossLegend';
        legendWrapper.innerHTML = legendHTML;
        canvas.parentElement?.appendChild(legendWrapper);
      }
    }
  }