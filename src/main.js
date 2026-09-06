import './style.css';
import { magicianConfig } from './config.js';
import { MagicHeroScene } from './threeScene.js';

class KelvinApp {
  constructor() {
    this.threeScene = null;
    this.currentActIndex = 0;
    this.isTheaterOpen = false;
    this.init();
  }

  init() {
    this.initThreeHero();
    this.initScrollChoreography();
    this.initReelsFolio();
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

  initReelsFolio() {
    const acts = magicianConfig.actsReels;
    if (!acts || !acts.length) return;

    const reelCards = document.querySelectorAll('.reel-card');
    const theaterModal = document.getElementById('salonTheaterModal');
    const theaterBackdrop = document.getElementById('theaterBackdrop');
    const theaterCloseBtn = document.getElementById('theaterCloseBtn');
    const theaterVideo = document.getElementById('theaterVideo');
    const theaterPlayBtn = document.getElementById('theaterPlayBtn');
    const theaterPlayIcon = document.getElementById('theaterPlayIcon');
    const theaterSoundBtn = document.getElementById('theaterSoundBtn');
    const theaterSoundIcon = document.getElementById('theaterSoundIcon');
    const theaterSoundLabel = document.getElementById('theaterSoundLabel');
    const theaterTimestamp = document.getElementById('theaterTimestamp');
    const scrubberTrack = document.getElementById('theaterScrubberTrack');
    const scrubberFill = document.getElementById('theaterScrubberFill');
    const actBadge = document.getElementById('theaterActBadge');
    const actGenre = document.getElementById('theaterGenre');
    const actTitle = document.getElementById('theaterActTitle');
    const actVenue = document.getElementById('theaterVenue');
    const actDesc = document.getElementById('theaterDesc');
    const inquireBtn = document.getElementById('theaterInquireBtn');
    const actTabs = document.querySelectorAll('.theater-tab');

    // 1. High-Performance Hover Preview (Loads video only when hovered)
    reelCards.forEach((card, index) => {
      const previewVideo = card.querySelector('.reel-preview-video');

      card.addEventListener('mouseenter', () => {
        if (previewVideo) {
          if (!previewVideo.src && previewVideo.dataset.src) {
            previewVideo.src = previewVideo.dataset.src;
          }
          previewVideo.classList.add('is-playing');
          previewVideo.play().catch(() => {});
        }
      });

      card.addEventListener('mouseleave', () => {
        if (previewVideo) {
          previewVideo.pause();
          previewVideo.classList.remove('is-playing');
        }
      });

      // Click to open salon theater
      card.addEventListener('click', () => {
        this.openSalonTheater(index);
      });

      // Keyboard accessibility (Enter or Space to open)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openSalonTheater(index);
        }
      });
    });

    // 2. Three.js 3D Card Click Synergy
    window.addEventListener('kelvin-card-click', (e) => {
      const cardId = e.detail?.id;
      if (typeof cardId === 'number' && cardId >= 0 && cardId < acts.length) {
        const targetCard = reelCards[cardId];
        if (targetCard) {
          targetCard.classList.add('highlighted');
          setTimeout(() => targetCard.classList.remove('highlighted'), 2400);
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => {
          this.openSalonTheater(cardId);
        }, 350);
      }
    });

    // 3. Open Theater Function
    this.openSalonTheater = (index) => {
      if (index < 0 || index >= acts.length) return;
      this.currentActIndex = index;
      const act = acts[index];

      // Update active tab
      actTabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
      });

      // Update metadata
      if (actBadge) actBadge.textContent = `${act.suit} ${act.actNumber}`;
      if (actGenre) actGenre.textContent = act.genre;
      if (actTitle) actTitle.textContent = act.title;
      if (actVenue) actVenue.textContent = act.venue;
      if (actDesc) actDesc.textContent = act.description;

      // Load & play theater video with sound
      if (theaterVideo) {
        if (theaterVideo.src !== window.location.origin + act.videoSrc && !theaterVideo.src.endsWith(act.videoSrc)) {
          theaterVideo.src = act.videoSrc;
        }
        theaterVideo.poster = act.poster;
        theaterVideo.currentTime = 0;
        theaterVideo.muted = false; // Enable audio in focused theater
        theaterVideo.play().then(() => {
          if (theaterPlayIcon) theaterPlayIcon.textContent = '⏸';
        }).catch(() => {
          // If browser requires muted on first gesture
          theaterVideo.muted = true;
          theaterVideo.play().catch(() => {});
          this.updateSoundButton(theaterVideo.muted);
        });
        this.updateSoundButton(theaterVideo.muted);
      }

      // Show modal
      if (theaterModal) {
        theaterModal.classList.add('active');
        theaterModal.setAttribute('aria-hidden', 'false');
      }
      document.body.style.overflow = 'hidden';
      this.isTheaterOpen = true;
    };

    // 4. Close Theater Function
    this.closeSalonTheater = () => {
      if (!this.isTheaterOpen) return;
      if (theaterVideo) {
        theaterVideo.pause();
      }
      if (theaterModal) {
        theaterModal.classList.remove('active');
        theaterModal.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
      this.isTheaterOpen = false;
    };

    // 5. Sound Button update helper
    this.updateSoundButton = (isMuted) => {
      if (theaterSoundIcon) theaterSoundIcon.textContent = isMuted ? '🔇' : '🔊';
      if (theaterSoundLabel) theaterSoundLabel.textContent = isMuted ? 'Muted' : 'Sound On';
    };

    // 6. Controls binding
    if (theaterCloseBtn) {
      theaterCloseBtn.addEventListener('click', () => this.closeSalonTheater());
    }

    if (theaterBackdrop) {
      theaterBackdrop.addEventListener('click', () => this.closeSalonTheater());
    }

    if (theaterPlayBtn && theaterVideo) {
      theaterPlayBtn.addEventListener('click', () => {
        if (theaterVideo.paused) {
          theaterVideo.play();
          if (theaterPlayIcon) theaterPlayIcon.textContent = '⏸';
        } else {
          theaterVideo.pause();
          if (theaterPlayIcon) theaterPlayIcon.textContent = '▶';
        }
      });
    }

    if (theaterSoundBtn && theaterVideo) {
      theaterSoundBtn.addEventListener('click', () => {
        theaterVideo.muted = !theaterVideo.muted;
        this.updateSoundButton(theaterVideo.muted);
      });
    }

    // Time update & Scrubber
    if (theaterVideo) {
      theaterVideo.addEventListener('timeupdate', () => {
        const cur = theaterVideo.currentTime;
        const dur = theaterVideo.duration || 14;
        const pct = (cur / dur) * 100;
        if (scrubberFill) scrubberFill.style.width = `${pct}%`;

        if (theaterTimestamp) {
          const curM = Math.floor(cur / 60);
          const curS = Math.floor(cur % 60).toString().padStart(2, '0');
          const durM = Math.floor(dur / 60);
          const durS = Math.floor(dur % 60).toString().padStart(2, '0');
          theaterTimestamp.textContent = `${curM}:${curS} / ${durM}:${durS}`;
        }
      });

      theaterVideo.addEventListener('ended', () => {
        // Smooth loop or next
        theaterVideo.currentTime = 0;
        theaterVideo.play().catch(() => {});
      });
    }

    if (scrubberTrack && theaterVideo) {
      scrubberTrack.addEventListener('click', (e) => {
        const rect = scrubberTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        if (theaterVideo.duration) {
          theaterVideo.currentTime = ratio * theaterVideo.duration;
        }
      });
    }

    // Tabs switching
    actTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.dataset.actIndex, 10);
        if (!isNaN(idx)) {
          this.openSalonTheater(idx);
        }
      });
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.isTheaterOpen) return;

      if (e.key === 'Escape') {
        this.closeSalonTheater();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (theaterPlayBtn) theaterPlayBtn.click();
      } else if (e.key === 'm' || e.key === 'M') {
        if (theaterSoundBtn) theaterSoundBtn.click();
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (this.currentActIndex + 1) % acts.length;
        this.openSalonTheater(nextIdx);
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (this.currentActIndex - 1 + acts.length) % acts.length;
        this.openSalonTheater(prevIdx);
      }
    });

    // "Inquire For This Act" CTA button
    if (inquireBtn) {
      inquireBtn.addEventListener('click', () => {
        const currentAct = acts[this.currentActIndex];
        this.closeSalonTheater();

        // Pre-fill occasion
        const eventTypeSelect = document.getElementById('eventType');
        if (eventTypeSelect && currentAct.occasionPreset) {
          eventTypeSelect.value = currentAct.occasionPreset;
        }

        // Add note hint
        const notesInput = document.getElementById('notes');
        if (notesInput && !notesInput.value) {
          notesInput.value = `Enquiring specifically for ${currentAct.actNumber}: ${currentAct.title}.`;
        }

        // Smooth scroll to inquiry form
        const inquirySection = document.getElementById('inquiry');
        if (inquirySection) {
          inquirySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            document.getElementById('clientName')?.focus();
          }, 600);
        }
      });
    }
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
