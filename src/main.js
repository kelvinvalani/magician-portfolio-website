import './style.css';
import { magicianConfig } from './config.js';
import { MagicHeroScene } from './threeScene.js';

class KelvinApp {
  constructor() {
    this.threeScene = null;
    this.init();
  }

  init() {
    this.initThreeHero();
    this.initVideoBackground();
    this.initInquiryForm();
    this.initCardInteractions();
  }

  initThreeHero() {
    const canvasContainer = document.getElementById('threeHeroCanvas');
    if (canvasContainer) {
      this.threeScene = new MagicHeroScene(canvasContainer);
    }

    const shuffleBtn = document.getElementById('shuffleDeckBtn');
    if (shuffleBtn && this.threeScene) {
      shuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.threeScene.shuffleDeck();
      });
    }
  }

  initCardInteractions() {
    const hintText = document.getElementById('canvasHintText');
    const messages = {
      '♣': 'Ace of Clubs — Master of Sleight of Hand',
      '♦': 'Ace of Diamonds — Rare, Brilliant Wonders',
      '♠': 'Ace of Spades — Psychological Mystery',
      '♥': 'Ace of Hearts — Enchanting Your Moments'
    };

    window.addEventListener('kelvin-card-click', (e) => {
      const { suit, isFlipped } = e.detail;
      if (hintText) {
        if (isFlipped) {
          hintText.textContent = messages[suit] || '✦ Card Inspected • Enchant your moments';
        } else {
          hintText.textContent = 'Move cursor to tilt • Click any card to flip';
        }
      }
    });

    window.addEventListener('kelvin-card-shuffled', () => {
      if (hintText) {
        hintText.textContent = '✦ Cards Shuffled • Move cursor to re-align';
        setTimeout(() => {
          if (hintText) hintText.textContent = 'Move cursor to tilt • Click any card to flip';
        }, 3200);
      }
    });
  }

  initVideoBackground() {
    const video = document.getElementById('bgVideo');
    const toggleBtn = document.getElementById('videoToggleBtn');
    const toggleIcon = document.getElementById('videoToggleIcon');

    if (!video || !toggleBtn) return;

    // Handle browser autoplay policy
    video.play().catch(() => {
      // Autoplay with audio blocked or slow connection; silent fallback
    });

    toggleBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        if (toggleIcon) toggleIcon.textContent = '⏸';
      } else {
        video.pause();
        if (toggleIcon) toggleIcon.textContent = '▶';
      }
    });
  }

  initInquiryForm() {
    const form = document.getElementById('inquiryForm');
    const successCard = document.getElementById('inquirySuccess');
    const successMsg = document.getElementById('successMsg');

    if (!form) return;

    // Pre-fill tomorrow as minimum date
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName')?.value.trim();
      const contact = document.getElementById('clientContact')?.value.trim();
      const phone = document.getElementById('clientPhone')?.value.trim();
      const date = document.getElementById('eventDate')?.value;
      const eventType = document.getElementById('eventType')?.value;
      const notes = document.getElementById('notes')?.value.trim();

      if (!name || !contact || !date || !eventType) {
        alert('Please fill in the required fields to submit your enquiry.');
        return;
      }

      // Save inquiry locally for Kelvin's records
      const inquiry = {
        id: 'KB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        timestamp: new Date().toISOString(),
        name,
        contact,
        phone,
        date,
        eventType,
        notes
      };

      try {
        const stored = JSON.parse(localStorage.getItem('kelvin_inquiries') || '[]');
        stored.unshift(inquiry);
        localStorage.setItem('kelvin_inquiries', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // Display clean success state
      if (successCard && successMsg) {
        successMsg.innerHTML = `Thank you, <strong>${escapeHtml(name)}</strong>! Your enquiry for a <strong>${escapeHtml(eventType)}</strong> on <strong>${escapeHtml(date)}</strong> has been received. Kelvin will reply to <em>${escapeHtml(contact)}</em> shortly.`;
        form.style.display = 'none';
        successCard.style.display = 'block';

        // Smooth scroll to success message
        successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
  new KelvinApp();
});
