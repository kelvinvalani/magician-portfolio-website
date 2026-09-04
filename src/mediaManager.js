// Media & Video Reel Manager with interactive video modal and lightbox
import { soundFX } from './audioEffects.js';

export class MediaManager {
  constructor() {
    this.initVideoModal();
    this.initGalleryLightbox();
  }

  initVideoModal() {
    const modal = document.getElementById('videoModal');
    const openBtns = document.querySelectorAll('.open-video-btn');
    const closeBtn = document.getElementById('closeVideoModalBtn');
    const videoContainer = document.getElementById('videoPlayerFrame');

    if (!modal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        soundFX.playSparkle();
        this.openVideo(modal, videoContainer);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeVideo(modal, videoContainer);
      });
      closeBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.closeVideo(modal, videoContainer);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeVideo(modal, videoContainer);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeVideo(modal, videoContainer);
      }
    });
  }

  openVideo(modal, container) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Simulated cinematic highlight reel using HTML5 video canvas animation or responsive preview
    container.innerHTML = `
      <div class="reel-player-wrapper">
        <div class="reel-mock-player">
          <div class="reel-visual-ambient"></div>
          <img src="/images/magician-hero.jpg" alt="Aurelius Live Performance" class="reel-poster-img" />
          <div class="reel-overlay-content">
            <div class="reel-badge">2026 OFFICIAL SHOWREEL</div>
            <h3>Aurelius: Live at The Bellagio & West End</h3>
            <p>Featuring Grand Illusions, Live Mind Reading, and VIP Celebrity Receptions</p>
            <div class="reel-playback-bar">
              <div class="reel-progress"></div>
            </div>
            <div class="reel-meta-info">
              <span>▶ 02:45 Highlights</span>
              <span>4K Theatrical Mix</span>
              <span>Stereo Sound</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Start progress animation
    const progress = container.querySelector('.reel-progress');
    if (progress) {
      progress.style.transition = 'width 12s linear';
      setTimeout(() => {
        progress.style.width = '100%';
      }, 100);
    }
  }

  closeVideo(modal, container) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    container.innerHTML = '';
  }

  initGalleryLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const galleryItems = document.querySelectorAll('.gallery-thumb');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('closeLightboxBtn');

    if (!lightbox || !lightboxImg) return;

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('src');
        if (src) {
          lightboxImg.src = src;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
          soundFX.playSparkle();
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}
