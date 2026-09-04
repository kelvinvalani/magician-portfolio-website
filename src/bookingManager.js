import { soundFX } from './audioEffects.js';

export class BookingManager {
  constructor() {
    this.storageKey = 'aurelius_magic_inquiries_v1';
    this.inquiries = this.loadInquiries();
    this.initForm();
    this.initAdminDrawer();
    this.updateInquiryCounter();
  }

  loadInquiries() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.getDefaultSeedInquiries();
    } catch (e) {
      return this.getDefaultSeedInquiries();
    }
  }

  saveInquiries() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.inquiries));
      this.updateInquiryCounter();
    } catch (e) {}
  }

  getDefaultSeedInquiries() {
    return [
      {
        id: 'ARC-4921',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        name: 'Victoria Hawthorne',
        phone: '+1 (415) 882-9901',
        email: 'victoria.h@apexholdings.com',
        date: '2026-11-14',
        location: 'The Palace Hotel, San Francisco',
        guestCount: '150 - 200',
        occasion: 'Corporate Gala / Awards Dinner',
        showPackage: 'Grand Stage & Illusion Spectacle',
        notes: 'Looking for a 45-minute stage illusion show followed by 30 minutes of close-up magic during dessert.',
        status: 'Pending Callback'
      }
    ];
  }

  initForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    // Set min date to today
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form);
    });

    // Package preset buttons click handler
    document.querySelectorAll('.package-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pkgName = btn.dataset.package;
        const select = document.getElementById('showPackage');
        if (select && pkgName) {
          select.value = pkgName;
        }
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  handleFormSubmit(form) {
    const formData = new FormData(form);

    const name = formData.get('fullName')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const date = formData.get('eventDate')?.toString();
    const location = formData.get('location')?.toString().trim();
    const guestCount = formData.get('guestCount')?.toString();
    const occasion = formData.get('occasion')?.toString();
    const showPackage = formData.get('showPackage')?.toString();
    const notes = formData.get('notes')?.toString().trim();

    if (!name || !phone || !email || !date || !location || !guestCount || !occasion) {
      alert('Please fill in all essential event details so Aurelius can prepare your consultation.');
      return;
    }

    // Generate mystic booking code
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const id = `ARC-${randNum}`;

    const newInquiry = {
      id,
      createdAt: new Date().toISOString(),
      name,
      phone,
      email,
      date,
      location,
      guestCount,
      occasion,
      showPackage: showPackage || 'Custom Consultation',
      notes: notes || 'No additional notes provided',
      status: 'Pending Callback'
    };

    this.inquiries.unshift(newInquiry);
    this.saveInquiries();

    soundFX.playChime(523.25);
    soundFX.playSparkle();

    // Show Confirmation Modal
    this.showConfirmationModal(newInquiry);
    form.reset();
  }

  showConfirmationModal(inquiry) {
    const modal = document.getElementById('confirmationModal');
    if (!modal) return;

    document.getElementById('confirmId').textContent = inquiry.id;
    document.getElementById('confirmName').textContent = inquiry.name;
    document.getElementById('confirmPhone').textContent = inquiry.phone;
    document.getElementById('confirmDate').textContent = inquiry.date;
    document.getElementById('confirmLocation').textContent = inquiry.location;
    document.getElementById('confirmOccasion').textContent = inquiry.occasion;
    document.getElementById('confirmGuests').textContent = inquiry.guestCount;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Close button handler
    const closeBtn = document.getElementById('closeConfirmModalBtn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      };
    }
  }

  initAdminDrawer() {
    const drawer = document.getElementById('adminDrawer');
    const toggleBtn = document.getElementById('adminDrawerToggle');
    const closeBtn = document.getElementById('adminDrawerClose');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        this.renderAdminInquiries();
        drawer.classList.toggle('active');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    }
  }

  updateInquiryCounter() {
    const counterBadge = document.getElementById('adminInquiryCount');
    if (counterBadge) {
      counterBadge.textContent = this.inquiries.length.toString();
    }
  }

  renderAdminInquiries() {
    const list = document.getElementById('adminInquiryList');
    if (!list) return;

    if (this.inquiries.length === 0) {
      list.innerHTML = `
        <div class="empty-inquiries">
          <p>No booking inquiries yet.</p>
          <small>Fill out the booking form to simulate a client booking request.</small>
        </div>
      `;
      return;
    }

    list.innerHTML = this.inquiries.map((inq, idx) => `
      <div class="inquiry-card">
        <div class="inquiry-header">
          <span class="inquiry-id">${inq.id}</span>
          <span class="inquiry-status ${inq.status === 'Contacted' ? 'status-done' : 'status-pending'}">${inq.status}</span>
        </div>
        <div class="inquiry-title">${inq.name}</div>
        <div class="inquiry-details">
          <div><strong>📞 Phone:</strong> <a href="tel:${inq.phone}" class="lead-link">${inq.phone}</a></div>
          <div><strong>✉️ Email:</strong> <a href="mailto:${inq.email}" class="lead-link">${inq.email}</a></div>
          <div><strong>📅 Date:</strong> ${inq.date}</div>
          <div><strong>📍 Location:</strong> ${inq.location}</div>
          <div><strong>🎉 Occasion:</strong> ${inq.occasion} (${inq.guestCount} guests)</div>
          <div><strong>🎭 Show:</strong> ${inq.showPackage}</div>
          ${inq.notes ? `<div class="inquiry-notes"><strong>Note:</strong> "${inq.notes}"</div>` : ''}
        </div>
        <div class="inquiry-actions">
          <button class="lead-btn call-lead-btn" onclick="window.location.href='tel:${inq.phone}'">
            Call Client Back
          </button>
          <button class="lead-btn status-toggle-btn" data-index="${idx}">
            ${inq.status === 'Contacted' ? 'Mark as Pending' : 'Mark as Contacted'}
          </button>
          <button class="lead-btn delete-lead-btn" data-index="${idx}">Delete</button>
        </div>
      </div>
    `).join('');

    // Attach actions
    list.querySelectorAll('.status-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.dataset.index, 10);
        this.inquiries[index].status = this.inquiries[index].status === 'Contacted' ? 'Pending Callback' : 'Contacted';
        this.saveInquiries();
        this.renderAdminInquiries();
      });
    });

    list.querySelectorAll('.delete-lead-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.dataset.index, 10);
        this.inquiries.splice(index, 1);
        this.saveInquiries();
        this.renderAdminInquiries();
      });
    });
  }
}
