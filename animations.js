// ================= ENHANCED ANIMATIONS & EFFECTS ================= 

// Animation State
const AnimationState = {
  particles: [],
  mousePosition: { x: 0, y: 0 },
  isReducedMotion: false,
  animationFrameId: null
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeAnimations();
  setupIntersectionObserver();
  checkReducedMotion();
});

// ================= INITIALIZATION ================= 
function initializeAnimations() {
  setupMouseTracking();
  initializeParticleSystem();
  setupScrollAnimations();
  setupHoverEffects();
  setupPageTransitions();
}

function checkReducedMotion() {
  AnimationState.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (AnimationState.isReducedMotion) {
    // Disable heavy animations for accessibility
    document.body.classList.add('reduced-motion');
  }
}

// ================= MOUSE TRACKING ================= 
function setupMouseTracking() {
  let mouseTimeout;
  
  document.addEventListener('mousemove', (e) => {
    AnimationState.mousePosition.x = e.clientX;
    AnimationState.mousePosition.y = e.clientY;
    
    // Update cursor glow
    updateCursorGlow(e.clientX, e.clientY);
    
    // Clear existing timeout
    clearTimeout(mouseTimeout);
    
    // Hide cursor glow after inactivity
    mouseTimeout = setTimeout(() => {
      hideCursorGlow();
    }, 2000);
  });
  
  document.addEventListener('mouseleave', () => {
    hideCursorGlow();
  });
}

function updateCursorGlow(x, y) {
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !AnimationState.isReducedMotion) {
    cursorGlow.style.left = x + 'px';
    cursorGlow.style.top = y + 'px';
    cursorGlow.style.opacity = '1';
  }
}

function hideCursorGlow() {
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow) {
    cursorGlow.style.opacity = '0';
  }
}

// ================= PARTICLE SYSTEM ================= 
function initializeParticleSystem() {
  if (AnimationState.isReducedMotion) return;
  
  const container = document.getElementById('particles');
  if (!container) return;
  
  // Create initial particles
  for (let i = 0; i < 30; i++) {
    createParticle(container);
  }
  
  // Continuously create new particles
  setInterval(() => {
    if (AnimationState.particles.length < 50) {
      createParticle(container);
    }
  }, 2000);
  
  // Start particle animation loop
  animateParticles();
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Random properties
  const size = Math.random() * 3 + 1;
  const startX = Math.random() * window.innerWidth;
  const speed = Math.random() * 2 + 1;
  const opacity = Math.random() * 0.5 + 0.3;
  
  particle.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: var(--primary);
    border-radius: 50%;
    left: ${startX}px;
    bottom: -10px;
    opacity: ${opacity};
    pointer-events: none;
    z-index: 1;
  `;
  
  // Store particle data
  const particleData = {
    element: particle,
    x: startX,
    y: window.innerHeight + 10,
    speed: speed,
    opacity: opacity,
    life: 0,
    maxLife: Math.random() * 100 + 50
  };
  
  AnimationState.particles.push(particleData);
  container.appendChild(particle);
}

function animateParticles() {
  if (AnimationState.isReducedMotion) return;
  
  AnimationState.particles.forEach((particle, index) => {
    // Update position
    particle.y -= particle.speed;
    particle.x += Math.sin(particle.life * 0.01) * 0.5;
    particle.life++;
    
    // Update opacity based on life
    const lifeRatio = particle.life / particle.maxLife;
    const currentOpacity = particle.opacity * (1 - lifeRatio);
    
    // Update DOM element
    particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
    particle.element.style.opacity = currentOpacity;
    
    // Remove dead particles
    if (particle.life >= particle.maxLife || particle.y < -10) {
      particle.element.remove();
      AnimationState.particles.splice(index, 1);
    }
  });
  
  AnimationState.animationFrameId = requestAnimationFrame(animateParticles);
}

// ================= SCROLL ANIMATIONS ================= 
function setupScrollAnimations() {
  // Parallax effect for floating shapes
  window.addEventListener('scroll', throttle(handleScroll, 16));
}

function handleScroll() {
  if (AnimationState.isReducedMotion) return;
  
  const scrollY = window.pageYOffset;
  const shapes = document.querySelectorAll('.shape');
  
  shapes.forEach((shape, index) => {
    const speed = 0.5 + (index * 0.1);
    const yPos = scrollY * speed;
    shape.style.transform = `translateY(${yPos}px)`;
  });
}

// ================= INTERSECTION OBSERVER ================= 
function setupIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Trigger specific animations based on element type
        if (entry.target.classList.contains('stat-card')) {
          animateStatCard(entry.target);
        } else if (entry.target.classList.contains('activity-item')) {
          animateActivityItem(entry.target);
        }
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate on scroll
  const animatedElements = document.querySelectorAll('.stat-card, .activity-item, .upload-area, .records-section, .access-section, .audit-section');
  animatedElements.forEach(el => observer.observe(el));
}

function animateStatCard(card) {
  if (AnimationState.isReducedMotion) return;
  
  const number = card.querySelector('.stat-number');
  if (number) {
    const finalValue = parseInt(number.textContent);
    animateNumber(number, 0, finalValue, 1000);
  }
}

function animateActivityItem(item) {
  if (AnimationState.isReducedMotion) return;
  
  item.style.animation = 'slideInLeft 0.6s ease-out';
}

// ================= NUMBER ANIMATION ================= 
function animateNumber(element, start, end, duration) {
  if (AnimationState.isReducedMotion) {
    element.textContent = end;
    return;
  }
  
  const startTime = performance.now();
  const range = end - start;
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (range * easeOut));
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// ================= HOVER EFFECTS ================= 
function setupHoverEffects() {
  // Enhanced hover effects for interactive elements
  setupCardHoverEffects();
  setupButtonHoverEffects();
  setupNavHoverEffects();
}

function setupCardHoverEffects() {
  const cards = document.querySelectorAll('.stat-card, .activity-item, .upload-area');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      const glow = card.querySelector('.stat-glow');
      if (glow) {
        glow.style.opacity = '0.2';
      }
      
      // Add subtle scale effect
      card.style.transform = 'translateY(-4px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      const glow = card.querySelector('.stat-glow');
      if (glow) {
        glow.style.opacity = '0';
      }
      
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
}

function setupButtonHoverEffects() {
  const buttons = document.querySelectorAll('.primary-btn, .action-btn, .upload-btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      // Create ripple effect
      createRippleEffect(e.target, e);
    });
  });
}

function createRippleEffect(element, event) {
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 1;
  `;
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function setupNavHoverEffects() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      const indicator = item.querySelector('.nav-indicator');
      if (indicator && !item.classList.contains('active')) {
        indicator.style.transform = 'translateY(-50%) scaleY(0.5)';
        indicator.style.opacity = '0.5';
      }
    });
    
    item.addEventListener('mouseleave', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      const indicator = item.querySelector('.nav-indicator');
      if (indicator && !item.classList.contains('active')) {
        indicator.style.transform = 'translateY(-50%) scaleY(0)';
        indicator.style.opacity = '0';
      }
    });
  });
}

// ================= PAGE TRANSITIONS ================= 
function setupPageTransitions() {
  // Smooth transitions between sections
  const originalShowSection = window.showSection;
  
  window.showSection = function(sectionName) {
    if (AnimationState.isReducedMotion) {
      originalShowSection(sectionName);
      return;
    }
    
    // Fade out current section
    const currentSection = document.querySelector('.content-section.active');
    if (currentSection) {
      currentSection.style.animation = 'fadeOut 0.2s ease-out';
      
      setTimeout(() => {
        originalShowSection(sectionName);
        
        // Fade in new section
        const newSection = document.querySelector('.content-section.active');
        if (newSection) {
          newSection.style.animation = 'fadeIn 0.3s ease-out';
        }
      }, 200);
    } else {
      originalShowSection(sectionName);
    }
  };
}

// ================= LOADING ANIMATIONS ================= 
function createLoadingAnimation(container) {
  if (AnimationState.isReducedMotion) return;
  
  const loader = document.createElement('div');
  loader.className = 'custom-loader';
  loader.innerHTML = `
    <div class="loader-ring"></div>
    <div class="loader-ring"></div>
    <div class="loader-ring"></div>
  `;
  
  container.appendChild(loader);
  return loader;
}

// ================= NOTIFICATION ANIMATIONS ================= 
function animateNotification(notification) {
  if (AnimationState.isReducedMotion) {
    notification.style.opacity = '1';
    return;
  }
  
  // Slide in from right
  notification.style.transform = 'translateX(100%)';
  notification.style.opacity = '0';
  
  requestAnimationFrame(() => {
    notification.style.transition = 'all 0.3s ease-out';
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  });
}

// ================= FORM ANIMATIONS ================= 
function setupFormAnimations() {
  const inputs = document.querySelectorAll('.form-input');
  
  inputs.forEach(input => {
    input.addEventListener('focus', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      const inputGroup = e.target.closest('.input-group');
      if (inputGroup) {
        inputGroup.classList.add('focused');
      }
    });
    
    input.addEventListener('blur', (e) => {
      if (AnimationState.isReducedMotion) return;
      
      const inputGroup = e.target.closest('.input-group');
      if (inputGroup) {
        inputGroup.classList.remove('focused');
      }
    });
  });
}

// ================= CHATBOT ANIMATIONS ================= 
function animateChatbotToggle() {
  const toggle = document.getElementById('chatbotToggle');
  if (!toggle || AnimationState.isReducedMotion) return;
  
  toggle.style.animation = 'bounce 0.6s ease-out';
  
  setTimeout(() => {
    toggle.style.animation = '';
  }, 600);
}

function animateMessageEntry(messageElement) {
  if (AnimationState.isReducedMotion) {
    messageElement.style.opacity = '1';
    return;
  }
  
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    messageElement.style.transition = 'all 0.3s ease-out';
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  });
}

// ================= UTILITY FUNCTIONS ================= 
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ================= CSS ANIMATIONS ================= 
const animationCSS = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0,-8px,0); }
  70% { transform: translate3d(0,-4px,0); }
  90% { transform: translate3d(0,-2px,0); }
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(45, 212, 191, 0.3); }
  50% { box-shadow: 0 0 30px rgba(45, 212, 191, 0.6); }
}

.animate-in {
  animation: fadeIn 0.6s ease-out;
}

.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.custom-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.loader-ring {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  animation: loaderPulse 1.2s ease-in-out infinite;
}

.loader-ring:nth-child(2) {
  animation-delay: 0.2s;
}

.loader-ring:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loaderPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-group.focused .input-icon {
  color: var(--primary);
  transform: translateY(-50%) scale(1.1);
}

.input-group.focused .input-highlight {
  transform: scaleX(1);
}
`;

// Inject animation CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = animationCSS;
document.head.appendChild(animationStyle);

// ================= CLEANUP ================= 
window.addEventListener('beforeunload', () => {
  if (AnimationState.animationFrameId) {
    cancelAnimationFrame(AnimationState.animationFrameId);
  }
});

// Export functions for global access
window.animateNotification = animateNotification;
window.animateChatbotToggle = animateChatbotToggle;
window.animateMessageEntry = animateMessageEntry;
window.createLoadingAnimation = createLoadingAnimation;