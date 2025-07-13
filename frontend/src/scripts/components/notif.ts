export function showCustomAlert(message : string) {
    const container = document.getElementById('custom-alert-container');
  
    const alert = document.createElement('div');
    alert.className = 'custom-alert';
    alert.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
      <div class="progress-bar"></div>
    `;
  
    container.appendChild(alert);
  
    // Auto-remove after 5 seconds
    const timeout = setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
      }
    }, 5000);
  
    // If user closes early, cancel timer
    alert.querySelector('button').addEventListener('click', () => {
      clearTimeout(timeout);
    });
  }