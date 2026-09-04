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
    this.initScrollChoreography();
    this.initVideoBackground();
    this.initInquiryForm();
  }

  initThreeHero() {
    const canvasContainer = document.getElementById('threeHeroCanvas');
    if (canvasContainer) {
      this.threeScene = new MagicHeroScene(canvasContainer);
    }
  }

  initScrollChoreography() {
    if (!this.threeScene) return;

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      this.threeScene.setScrollProgress(progress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial calculation
    onScroll();
  }

  initVideoBackground() {
    const video = document.getElementById('bgVideo');
    const toggleBtn = document.getElementById('videoToggleBtn');
    const toggleIcon = document.getElementById('videoToggleIcon');

    if (!video || !toggleBtn) return;

    video.play().catch(() => {
      // Browser autoplay policy fallback
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

    // Tomorrow as minimum date
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
        alert('Please complete the required fields to submit your enquiry.');
        return;
      }

      // Save inquiry to localStorage
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

      // Render stationery confirmation
      if (successCard && successMsg) {
        successMsg.innerHTML = `Thank you, <strong>${escapeHtml(name)}</strong>. Your enquiry for a <strong>${escapeHtml(eventType)}</strong> on <strong>${escapeHtml(date)}</strong> has been sealed. Kelvin will reply directly to <em>${escapeHtml(contact)}</em>.`;
        form.style.display = 'none';
        successCard.style.display = 'block';

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

window.addEventListener('DOMContentLoaded', () => {
  new KelvinApp();
});
