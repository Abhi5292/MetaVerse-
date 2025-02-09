import { playSound } from './lib/audio';

const statusElement = document.getElementById('status');
const claimButton = document.getElementById('claimButton');
const card = document.querySelector('.container');
const progressBar = document.querySelector('.level-progress');
const pointsDisplay = document.querySelector('.points');
const character = document.querySelector('.character');

// Add pulsing glow effect to the card
function pulseCard() {
  let intensity = 0;
  let increasing = true;

  setInterval(() => {
    if (increasing) {
      intensity += 0.05;
      if (intensity >= 1) {
        increasing = false;
      }
    } else {
      intensity -= 0.05;
      if (intensity <= 0) {
        increasing = true;
      }
    }

    card.style.boxShadow = `
      0 0 ${20 + intensity * 10}px rgba(0, 255, 0, ${0.2 + intensity * 0.1}),
      inset 0 0 ${20 + intensity * 10}px rgba(0, 255, 0, ${0.1 + intensity * 0.1})
    `;
  }, 50);
}

// Enhanced glitch effect
function addGlitchEffect(element) {
  let glitchTimeout;
  const originalText = element.textContent;
  const glitchCharacters = '!@#$%^&*()_+-=[]{}|;:,.<>?1234567890';

  function getRandomChar() {
    return glitchCharacters[Math.floor(Math.random() * glitchCharacters.length)];
  }

  function glitchText() {
    const textArray = originalText.split('');
    const numGlitches = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numGlitches; i++) {
      const pos = Math.floor(Math.random() * textArray.length);
      textArray[pos] = getRandomChar();
    }

    element.textContent = textArray.join('');
    element.style.textShadow = `0 0 ${5 + Math.random() * 10}px #00FF00`;

    glitchTimeout = setTimeout(() => {
      element.textContent = originalText;
      element.style.textShadow = '';

      if (Math.random() < 0.4) {
        setTimeout(glitchText, Math.random() * 2000);
      }
    }, 50 + Math.random() * 100);
  }

  return {
    start: () => {
      glitchText();
    },
    stop: () => {
      clearTimeout(glitchTimeout);
      element.textContent = originalText;
      element.style.textShadow = '';
    }
  };
}

// Initialize particle system
function createParticle() {
  const particle = document.createElement('div');
  particle.className = 'particle';
  const size = Math.random() * 4 + 2;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // Random position around the character
  const angle = Math.random() * Math.PI * 2;
  const radius = 80;
  const x = Math.cos(angle) * radius + 100;
  const y = Math.sin(angle) * radius + 100;

  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  document.querySelector('.particles').appendChild(particle);

  // Animate the particle
  particle.animate([
    { transform: 'translate(0, 0)', opacity: 0 },
    { opacity: 0.5, offset: 0.5 },
    { transform: 'translate(0, -100px)', opacity: 0 }
  ], {
    duration: 1000 + Math.random() * 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }).onfinish = () => particle.remove();
}

// Create particles periodically
setInterval(createParticle, 100);

// Add glow pulse effect to character
function pulseCharacterGlow() {
  let intensity = 0;
  let increasing = true;

  setInterval(() => {
    if (increasing) {
      intensity += 0.02;
      if (intensity >= 1) increasing = false;
    } else {
      intensity -= 0.02;
      if (intensity <= 0) increasing = true;
    }

    const blur = 5 + intensity * 3;
    const glow = document.querySelector('#glow feGaussianBlur');
    if (glow) glow.setAttribute('stdDeviation', blur.toString());
  }, 50);
}

// Animate progress bar
function updateProgress(current, max) {
  const progress = (current / max) * 100;
  progressBar.style.width = `${progress}%`;
}

async function fetchBonusStatus() {
  try {
    const response = await fetch('/api/bonus/status');
    const data = await response.json();

    if (data.lastClaim) {
      statusElement.textContent = `Last claimed: ${new Date(data.lastClaim).toLocaleString()}`;
    } else {
        statusElement.textContent = 'No previous claims';
    }

    claimButton.disabled = !data.canClaim;
    claimButton.textContent = data.canClaim ? 'CLAIM DAILY BONUS' : 'ALREADY CLAIMED TODAY';

    if (data.canClaim) {
      const glitchEffect = addGlitchEffect(claimButton);
      claimButton.addEventListener('mouseover', () => glitchEffect.start());
      claimButton.addEventListener('mouseout', () => glitchEffect.stop());
    }
  } catch (error) {
    statusElement.textContent = 'Error checking bonus status';
    console.error('Error:', error);
  }
}

async function claimBonus() {
  try {
    claimButton.disabled = true;
    claimButton.innerHTML = '<div class="loading"></div>';

    const response = await fetch('/api/bonus/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to claim bonus');
    }

    // Enhanced success animation
    statusElement.style.color = '#00FF00';
    statusElement.style.textShadow = '0 0 20px #00FF00';
    card.style.transform = 'scale(1.05)';
    card.style.transition = 'transform 0.3s ease-out';

    statusElement.textContent = data.message;

    setTimeout(() => {
      statusElement.style.color = '';
      statusElement.style.textShadow = '';
      card.style.transform = '';
    }, 2000);

    await fetchBonusStatus();
  } catch (error) {
    statusElement.textContent = error.message;
    claimButton.disabled = false;
    claimButton.textContent = 'CLAIM DAILY BONUS';
  }
}

// Initialize effects
pulseCard();
pulseCharacterGlow();
updateProgress(1, 7); // Level 1 of 7

// Add hover effects to navigation tabs (from edited snippet)
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('mouseenter', () => {
    playSound('hover');
    tab.style.textShadow = '0 0 10px #00f7ff';
    tab.style.transform = 'scale(1.1)';
  });

  tab.addEventListener('click', (e) => {
    e.preventDefault();
    playSound('raindrop');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });

  tab.addEventListener('mouseleave', () => {
    tab.style.textShadow = '';
    tab.style.transform = '';
  });
});


// Points counter animation (from edited snippet)
function animatePoints(target, duration = 1000) {
  const start = parseInt(pointsDisplay.textContent.replace(/,/g, ''));
  const step = Math.ceil((target - start) / (duration / 16));
  let current = start;

  function updateCounter() {
    current += step;
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      current = target;
    }
    pointsDisplay.textContent = current.toLocaleString();

    if (current !== target) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

// Handle flash image (from edited snippet with optional chaining)
const flashImage = document.querySelector('.flash-image');
flashImage?.addEventListener('animationend', () => {
  flashImage.remove();
});

// Initialize points
animatePoints(5048, 2000);


// Add click event listener
claimButton.addEventListener('click', claimBonus);

// Initial status check
fetchBonusStatus();

// Refresh status every minute
setInterval(fetchBonusStatus, 60000);