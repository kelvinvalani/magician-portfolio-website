import './style.css';
import { magicianConfig } from './config.js';
import { MagicHeroScene } from './threeScene.js';
import { BookingManager } from './bookingManager.js';
import { MediaManager } from './mediaManager.js';
import { soundFX } from './audioEffects.js';

// Application Controller
class MagicianApp {
  constructor() {
    this.threeScene = null;
    this.bookingManager = null;
    this.mediaManager = null;
    this.init();
  }

  init() {
    this.renderDynamicContent();
    this.initThreeHero();
    this.bookingManager = new BookingManager();
    this.mediaManager = new MediaManager();
    this.initSoundToggle();
    this.initNavigation();
    this.initInteractiveCardControls();
    this.initFaqAccordion();
    this.initMobileNav();
  }

  renderDynamicContent() {
    // Populate Packages
    const packagesContainer = document.getElementById('packagesContainer');
    if (packagesContainer) {
      packagesContainer.innerHTML = magicianConfig.packages.map(pkg => `
        <article class="package-card" id="pkg-${pkg.id}">
          <div class="package-img-holder">
            <img src="${pkg.image}" alt="${pkg.title}" loading="lazy" />
            <span class="package-badge">${pkg.badge}</span>
          </div>
          <div class="package-body">
            <h3 class="serif-font">${pkg.title}</h3>
            <div class="package-subtitle">${pkg.subtitle}</div>
            <div class="package-meta">
              <span>⏱ ${pkg.duration}</span>
              <span>👥 ${pkg.idealFor}</span>
            </div>
            <p class="package-desc">${pkg.description}</p>
            <ul class="package-features">
              ${pkg.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="btn btn-gold package-select-btn" data-package="${pkg.title}">
              Inquire This Package
            </button>
          </div>
        </article>
      `).join('');
    }

    // Populate Testimonials
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    if (testimonialsContainer) {
      testimonialsContainer.innerHTML = magicianConfig.testimonials.map(t => `
        <div class="testimonial-card">
          <div class="stars">★★★★★</div>
          <p class="testimonial-quote">"${t.quote}"</p>
          <div class="testimonial-author">
            <strong>${t.author}</strong>
            <span>${t.role} — ${t.event}</span>
          </div>
        </div>
      `).join('');
    }

    // Populate FAQs
    const faqsContainer = document.getElementById('faqsContainer');
    if (faqsContainer) {
      faqsContainer.innerHTML = magicianConfig.faqs.map((faq, idx) => `
        <div class="faq-item ${idx === 0 ? 'active' : ''}">
          <button class="faq-question">
            <span>${faq.q}</span>
            <span class="faq-toggle-icon">+</span>
          </button>
          <div class="faq-answer">
            <p>${faq.a}</p>
          </div>
        </div>
      `).join('');
    }
  }

  initThreeHero() {
    const canvasContainer = document.getElementById('heroCanvasContainer');
    if (canvasContainer) {
      this.threeScene = new MagicHeroScene(canvasContainer);
    }

    // Listen for 3D card clicks
    window.addEventListener('magic-card-selected', (e) => {
      const { name, isFlipped } = e.detail;
      const statusPill = document.getElementById('oracleStatusText');
      if (statusPill) {
        if (isFlipped) {
          statusPill.innerHTML = `Revealed: <strong>${name}</strong> ✦ Experience Wonder`;
        } else {
          statusPill.textContent = 'Touch or click any card in the 3D space to reveal';
        }
      }
    });
  }

  initInteractiveCardControls() {
    const shuffleBtn = document.getElementById('shuffleCardsBtn');
    const revealBtn = document.getElementById('revealCardBtn');

    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        if (this.threeScene) {
          this.threeScene.shuffleDeck();
        }
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener('click', () => {
        if (this.threeScene) {
          this.threeScene.revealRandomCard();
        }
      });
    }
  }

  initSoundToggle() {
    const btn = document.getElementById('soundToggleBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isMuted = soundFX.toggleMute();
      btn.classList.toggle('active', !isMuted);
      btn.setAttribute('aria-label', isMuted ? 'Unmute magical sound effects' : 'Mute sound effects');
      const icon = btn.querySelector('.sound-icon');
      if (icon) {
        icon.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  initNavigation() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    }, { passive: true });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            soundFX.playSparkle();
            target.scrollIntoView({ behavior: 'smooth' });
            // Close mobile menu if open
            const navLinks = document.getElementById('navLinks');
            if (navLinks) navLinks.style.display = '';
          }
        }
      });
    });
  }

  initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playSparkle();
        const item = btn.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  initMobileNav() {
    const toggle = document.getElementById('mobileNavToggle');
    const navLinks = document.getElementById('navLinks');
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        const isOpen = navLinks.style.display === 'flex';
        navLinks.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
          navLinks.style.flexDirection = 'column';
          navLinks.style.position = 'absolute';
          navLinks.style.top = '100%';
          navLinks.style.left = '0';
          navLinks.style.width = '100%';
          navLinks.style.background = 'rgba(7, 7, 12, 0.98)';
          navLinks.style.padding = '24px';
          navLinks.style.borderBottom = '1px solid var(--border-gold)';
        }
      });
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new MagicianApp();
});
