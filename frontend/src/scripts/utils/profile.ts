import { stats } from "../pages/profilePage";

export function renderGraphs(statistics: stats) {


  const canvas = document.getElementById('winLossCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    const lineWidth = 20;

    const total = statistics.numWins + statistics.numLosses;
    const winRatio = statistics.numWins / total;
    const lossRatio = statistics.numLosses / total;

    const winAngle = 2 * Math.PI * winRatio;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Animate Win Arc
    let currentWinAngle = -Math.PI / 2;
    const targetWinAngle = -Math.PI / 2 + winAngle;

    const animateWin = () => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, currentWinAngle);
      ctx.strokeStyle = 'green'; // Solid green
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      if (currentWinAngle < targetWinAngle) {
        currentWinAngle += 0.05;
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
      ctx.arc(centerX, centerY, radius, targetWinAngle, currentLossAngle);
      ctx.strokeStyle = 'red'; // Solid red
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      if (currentLossAngle < targetLossAngle) {
        currentLossAngle += 0.05;
        if (currentLossAngle > targetLossAngle) {
          currentLossAngle = targetLossAngle; // Clamp to target
        }
        requestAnimationFrame(animateLoss);
      }
    };

    animateWin();
  }

  const scoredCanvas = document.getElementById('scoredConcededCanvas') as HTMLCanvasElement;
  const scoredCtx = scoredCanvas.getContext('2d');

  if (scoredCtx) {
    const centerX = scoredCanvas.width / 2;
    const centerY = scoredCanvas.height / 2;
    const radius = 80;
    const lineWidth = 20;
  
    const total = statistics.Scored + statistics.conceeded;
    const scoredRatio = statistics.Scored / total;
    const concededRatio = statistics.conceeded / total;
  
    const scoredAngle = 2 * Math.PI * scoredRatio;
  
    // Background circle
    scoredCtx.beginPath();
    scoredCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    scoredCtx.strokeStyle = '#e0e0e0';
    scoredCtx.lineWidth = lineWidth;
    scoredCtx.stroke();
  
    // Animate scored Arc
    let currentScoredAngle = -Math.PI / 2;
    const targetScoredAngle = -Math.PI / 2 + scoredAngle;
  
    const animateScored = () => {
      scoredCtx.beginPath();
      scoredCtx.arc(centerX, centerY, radius, -Math.PI / 2, currentScoredAngle);
      scoredCtx.strokeStyle = 'green';
      scoredCtx.lineWidth = lineWidth;
      scoredCtx.stroke();
  
      if (currentScoredAngle < targetScoredAngle) {
        currentScoredAngle += 0.05;
        requestAnimationFrame(animateScored);
      } else {
        animateConceded();
      }
    };
  
    // Animate conceded Arc
    let currentConcededAngle = targetScoredAngle;
    const targetConcededAngle = -Math.PI / 2 + 2 * Math.PI;
  
    const animateConceded = () => {
      scoredCtx.beginPath();
      scoredCtx.arc(centerX, centerY, radius, targetScoredAngle, currentConcededAngle);
      scoredCtx.strokeStyle = 'red';
      scoredCtx.lineWidth = lineWidth;
      scoredCtx.stroke();
  
      if (currentConcededAngle < targetConcededAngle) {
        currentConcededAngle += 0.05;
        if (currentConcededAngle > targetConcededAngle) {
          currentConcededAngle = targetConcededAngle;
        }
        requestAnimationFrame(animateConceded);
      }
    };
  
    animateScored();
  }
  
}