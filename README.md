# ✦ AURELIUS | Master Illusionist & Mentalism Experience

An immersive, 3D-infused marketing and client booking web application designed specifically for a professional magician and mentalist.

Featuring a cinematic **Three.js** interactive 3D stage with levitating playing cards, arcane stardust particle fields, sound effects synthesizer, curated show package showcases, video highlight reel player, and a dedicated **booking inquiry system** where prospective clients submit date, venue, guest count, occasion, and contact details for ring-back confirmation.

---

## ✨ Features

- **Interactive 3D Stage (Three.js)**:
  - Custom 3D deck of gold-embossed playing cards levitating in an ethereal particle field.
  - Interactive mouse/gyro parallax camera controls with dynamic golden spotlight tracking.
  - "Pick a Mystery Card" and "Shuffle 3D Deck" interactive mini-illusions that respond with 3D flip animations and audio chimes.
- **Tailored Booking & Inquiry System**:
  - Structured booking form capturing:
    - Event Date (with calendar selector and minimum date constraint)
    - Location / Venue (City & venue name)
    - Event Occasion (Corporate Gala, Luxury Wedding, Milestone Birthday, VIP Soirée, etc.)
    - Estimated Guest Count / Audience Size
    - Selected Show Experience
    - Contact Name, Phone Number (highlighted for callback confirmation), and Email
    - Special Notes / Vision
  - Instant Arcane Seal Confirmation Modal with unique reference code (`ARC-XXXX`).
  - **Inquiries Vault / Magician Leads Drawer**: Integrated offline/local lead ledger allowing the magician to view, manage, and call back leads directly with one tap.
- **Show Offerings & Packages**:
  - *Close-Up & Sleight of Hand* (Cocktails, VIP Receptions)
  - *The Mentalism & Mind Reading Experience* (Banquets, Corporate Salons)
  - *Grand Stage & Illusion Spectacle* (Theatrical Headliner)
  - *The Bespoke VIP Experience* (Custom brand reveals)
- **Media & Video Showreel**:
  - Theatrical video modal player with cinematic playback preview.
  - Photo gallery lightbox for close-up and stage shots.
- **Audio Experience**:
  - Built-in Web Audio API synthesizer for delicate, ethereal sound effects (chimes, card swooshes, sparkles) with an on-screen mute/unmute toggle.
- **Mobile-First & Responsive**:
  - Floating mobile bottom action bar with quick "Call Now" and "Book Show" triggers.
  - Fluid typography and responsive layout tested across desktop and mobile screen sizes.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm`

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/kelvinvalani/magician-website.git
cd magician-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## ⚙️ Personalization & Configuration

All magician details, contact numbers, email, social links, and show packages are centralized in [`src/config.js`](src/config.js):

```javascript
export const magicianConfig = {
  name: "AURELIUS", // Your stage name
  phone: "+1 (555) 832-6244", // Your callback phone
  email: "bookings@aureliusmagic.com",
  socials: {
    instagram: "https://instagram.com/yourhandle",
    tiktok: "https://tiktok.com/@yourhandle",
    youtube: "https://youtube.com/@yourhandle",
    facebook: "https://facebook.com/yourhandle"
  },
  // ... show packages, FAQs, and testimonials
};
```

To add your own performance videos or photos, simply drop them into the `public/images/` directory.

---

## 🛠 Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES Modules)
- **Styling**: Vanilla CSS (Modern CSS variables, Glassmorphism, Google Fonts `Cinzel` & `Outfit`)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Audio**: Web Audio API (Native browser synthesis)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 📄 License

MIT License © 2026 Aurelius Magic & Illusions.
