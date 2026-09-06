import * as THREE from 'three';

// Procedural high-resolution texture generator matching Kelvin's poster
function generateCardTexture(suit, rank, isBack = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  if (isBack) {
    // Elegant warm cream and subtle gold filigree back
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 760);
    bgGrad.addColorStop(0, '#faf6ee');
    bgGrad.addColorStop(1, '#f2ece0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 760);

    // Outer double gold border
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 5;
    ctx.strokeRect(16, 16, 480, 728);

    ctx.strokeStyle = '#dfc285';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, 460, 708);

    // Geometric diamond lattice
    ctx.save();
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.18)';
    ctx.lineWidth = 1.2;
    const step = 42;
    for (let x = -760; x < 1200; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 760, 760);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, 760);
      ctx.lineTo(x + 760, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Center circular emblem
    ctx.save();
    ctx.translate(256, 380);

    ctx.fillStyle = '#fdfbf7';
    ctx.beginPath();
    ctx.arc(0, 0, 88, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.strokeStyle = '#dfc285';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Monogram & text
    ctx.fillStyle = '#22201d';
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Magic By Kelvin', 0, -8);

    ctx.fillStyle = '#b89047';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('ENCHANT', 0, 24);
    ctx.restore();

  } else {
    // Front face: Warm ivory with crisp typography and suit symbols
    const isRed = suit === '♥' || suit === '♦';
    const mainColor = isRed ? '#a62b2b' : '#22201e';

    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, 512, 760);

    // Outer crisp gold edge
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 4.5;
    ctx.strokeRect(8, 8, 496, 744);

    // Inner fine border
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22, 22, 468, 716);

    // Top-left rank & suit
    ctx.fillStyle = mainColor;
    ctx.font = 'bold 52px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(rank, 62, 76);
    ctx.font = '40px serif';
    ctx.fillText(suit, 62, 122);

    // Bottom-right inverted rank & suit
    ctx.save();
    ctx.translate(512 - 62, 760 - 76);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 52px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(rank, 0, 0);
    ctx.font = '40px serif';
    ctx.fillText(suit, 0, 46);
    ctx.restore();

    // Central suit symbol
    ctx.save();
    ctx.translate(256, 380);
    ctx.fillStyle = mainColor;
    ctx.font = '140px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suit, 0, -10);

    // Understated footer label
    ctx.fillStyle = '#8f774e';
    ctx.font = '300 16px "Cormorant Garamond", Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('MAGIC BY KELVIN', 0, 235);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export class MagicHeroScene {
  constructor(container) {
    this.container = container;
    this.cards = [];
    this.particles = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scroll = { current: 0, target: 0, velocity: 0 };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hoveredCard = null;
    this.clock = new THREE.Clock();
    this.lastScrollY = window.scrollY;

    this.init();
    this.setupEvents();
    this.animate();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // 3. Renderer with transparent background
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfffcf5, 2.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(0, 6, 8);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff4dc, 1.2);
    fillLight.position.set(-4, -2, 6);
    this.scene.add(fillLight);

    const goldRimLight = new THREE.PointLight(0xe8c878, 2.0, 16);
    goldRimLight.position.set(4, 2, 5);
    this.scene.add(goldRimLight);

    // 5. Build the 4 iconic cards matching Kelvin's poster
    this.createFannedDeck();

    // 6. Ambient golden stardust
    this.createGoldenParticles();
  }

  createFannedDeck() {
    // Poses for each of the 4 cards:
    // poseFan: Resting fan in Hero
    // poseFloat: Levitation pose mid-scroll
    // poseForm: Ambient background framing pose when viewing the inquiry form
    const cardDefs = [
      {
        suit: '♣',
        rank: 'A',
        name: 'Ace of Clubs',
        // Hero Fan Pose (positioned cleanly below tagline)
        hero: { x: -1.35, y: -0.25, z: -0.15, rotZ: -0.28, rotX: 0.02, rotY: 0 },
        // Mid-Scroll Levitation Arch Pose
        float: { x: -3.2, y: 1.4, z: 0.8, rotZ: -0.4, rotX: 0.2, rotY: 0.35 },
        // Form Framing Pose (flanks the left side of the stationery sheet)
        form: { x: -3.6, y: 0.1, z: -0.4, rotZ: -0.16, rotX: 0.08, rotY: 0.38 }
      },
      {
        suit: '♦',
        rank: 'A',
        name: 'Ace of Diamonds',
        hero: { x: -0.45, y: -0.05, z: 0.0, rotZ: -0.09, rotX: 0.02, rotY: 0 },
        float: { x: -1.2, y: 2.1, z: 1.2, rotZ: -0.14, rotX: -0.15, rotY: -0.2 },
        form: { x: -2.0, y: 2.0, z: -0.9, rotZ: -0.06, rotX: 0.05, rotY: 0.15 }
      },
      {
        suit: '♠',
        rank: 'A',
        name: 'Ace of Spades',
        hero: { x: 0.45, y: -0.05, z: 0.15, rotZ: 0.09, rotX: 0.02, rotY: 0 },
        float: { x: 1.2, y: 2.1, z: 1.1, rotZ: 0.14, rotX: 0.15, rotY: 0.2 },
        form: { x: 2.0, y: 2.0, z: -0.9, rotZ: 0.06, rotX: 0.05, rotY: -0.15 }
      },
      {
        suit: '♥',
        rank: 'A',
        name: 'Ace of Hearts',
        hero: { x: 1.35, y: -0.25, z: 0.3, rotZ: 0.28, rotX: 0.02, rotY: 0 },
        float: { x: 3.2, y: 1.4, z: 0.7, rotZ: 0.4, rotX: -0.2, rotY: -0.35 },
        form: { x: 3.6, y: 0.1, z: -0.4, rotZ: 0.16, rotX: 0.08, rotY: -0.38 }
      }
    ];

    const cardGeom = new THREE.PlaneGeometry(1.65, 2.45, 1, 1);
    const backTexture = generateCardTexture('', '', true);

    this.cardsGroup = new THREE.Group();
    this.scene.add(this.cardsGroup);

    cardDefs.forEach((def, index) => {
      const frontTexture = generateCardTexture(def.suit, def.rank, false);

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTexture,
        roughness: 0.15,
        metalness: 0.02,
        emissive: 0x22201c,
        side: THREE.FrontSide
      });

      const backMat = new THREE.MeshStandardMaterial({
        map: backTexture,
        roughness: 0.15,
        metalness: 0.05,
        emissive: 0x22201c,
        side: THREE.BackSide
      });

      const singleCard = new THREE.Group();
      singleCard.userData = {
        id: index,
        name: def.name,
        suit: def.suit,
        rank: def.rank,
        hero: def.hero,
        float: def.float,
        form: def.form,
        isFlipped: false
      };

      const frontMesh = new THREE.Mesh(cardGeom, frontMat);
      frontMesh.userData.parentCard = singleCard;

      const backMesh = new THREE.Mesh(cardGeom, backMat);
      backMesh.userData.parentCard = singleCard;

      singleCard.add(frontMesh);
      singleCard.add(backMesh);

      singleCard.position.set(def.hero.x, def.hero.y, def.hero.z);
      singleCard.rotation.set(def.hero.rotX, def.hero.rotY, def.hero.rotZ);

      this.cardsGroup.add(singleCard);
      this.cards.push(singleCard);
    });

    this.cardsGroup.position.set(0, -0.1, 0);
  }

  createGoldenParticles() {
    const particleCount = 85;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      scales[i] = Math.random() * 0.7 + 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Circular golden dust texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(235, 205, 130, 0.95)');
    grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.55)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.17,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setScrollProgress(progress) {
    this.scroll.target = Math.max(0, Math.min(1, progress));
  }

  setupEvents() {
    this.onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.onResize);

    // Mouse movement
    this.onMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.mouse.targetX = x;
      this.mouse.targetY = y;
      this.pointer.x = x;
      this.pointer.y = y;

      this.checkHover();
    };
    window.addEventListener('mousemove', this.onMouseMove);

    // Click on cards
    this.onClick = (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.handleCardClick();
    };
    window.addEventListener('click', this.onClick);
  }

  checkHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardsGroup.children, true);

    if (intersects.length > 0) {
      let hitCard = intersects[0].object.userData.parentCard;
      if (hitCard && hitCard !== this.hoveredCard) {
        this.hoveredCard = hitCard;
        document.body.style.cursor = 'pointer';

        const cueEl = document.getElementById('cardInteractionCue');
        if (cueEl) {
          const actTitles = [
            'Act I: Sleight of Hand & Cardistry',
            'Act II: Mind & Silent Perception',
            'Act III: The Impossible Location',
            'Act IV: Bespoke Soirées & Reactions'
          ];
          cueEl.innerHTML = `<span class="cue-suit">${hitCard.userData.suit}</span><span class="cue-message">Click to unveil ${actTitles[hitCard.userData.id]}</span><span class="cue-suit">${hitCard.userData.suit}</span>`;
        }
      }
    } else {
      if (this.hoveredCard) {
        this.hoveredCard = null;
        document.body.style.cursor = 'default';

        const cueEl = document.getElementById('cardInteractionCue');
        if (cueEl) {
          cueEl.innerHTML = `<span class="cue-suit">♠</span><span class="cue-message">Select any card to unveil its performance act</span><span class="cue-suit">♥</span>`;
        }
      }
    }
  }

  handleCardClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardsGroup.children, true);

    if (intersects.length > 0) {
      const card = intersects[0].object.userData.parentCard;
      if (card) {
        card.userData.isFlipped = !card.userData.isFlipped;
        const evt = new CustomEvent('kelvin-card-click', {
          detail: {
            id: card.userData.id,
            name: card.userData.name,
            suit: card.userData.suit,
            isFlipped: card.userData.isFlipped
          }
        });
        window.dispatchEvent(evt);
      }
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth scroll interpolation
    this.scroll.current += (this.scroll.target - this.scroll.current) * 0.08;
    const p = this.scroll.current;

    // Smooth mouse damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera perspective adjustment across scroll
    this.camera.position.x = this.mouse.x * 0.4;
    this.camera.position.y = this.mouse.y * 0.3 - p * 0.6;
    this.camera.position.z = 7.5 + p * 1.0;

    // Choreograph each of the 4 cards based on scrollProgress
    if (this.cardsGroup) {
      this.cards.forEach((card, idx) => {
        const u = card.userData;
        const isHovered = (this.hoveredCard === card);

        // Three-stage choreography:
        // 1. Hero resting fan (p: 0 -> 0.30)
        // 2. Archive levitation arch (p: 0.30 -> 0.68)
        // 3. Stationery inquiry framing (p: 0.68 -> 1.0)
        let targetX, targetY, targetZ;
        let targetRotX, targetRotY, targetRotZ;

        if (p < 0.32) {
          const t = p / 0.32;
          const ease = t * t * (3 - 2 * t);
          targetX = THREE.MathUtils.lerp(u.hero.x, u.float.x, ease);
          targetY = THREE.MathUtils.lerp(u.hero.y, u.float.y, ease);
          targetZ = THREE.MathUtils.lerp(u.hero.z, u.float.z, ease);
          targetRotX = THREE.MathUtils.lerp(u.hero.rotX, u.float.rotX, ease);
          targetRotY = THREE.MathUtils.lerp(u.hero.rotY, u.float.rotY, ease);
          targetRotZ = THREE.MathUtils.lerp(u.hero.rotZ, u.float.rotZ, ease);
        } else if (p < 0.65) {
          // Stable levitation arch above the reels section
          targetX = u.float.x;
          targetY = u.float.y;
          targetZ = u.float.z;
          targetRotX = u.float.rotX;
          targetRotY = u.float.rotY;
          targetRotZ = u.float.rotZ;
        } else {
          const t = (p - 0.65) / 0.35;
          const ease = t * t * (3 - 2 * t);
          targetX = THREE.MathUtils.lerp(u.float.x, u.form.x, ease);
          targetY = THREE.MathUtils.lerp(u.float.y, u.form.y, ease);
          targetZ = THREE.MathUtils.lerp(u.float.z, u.form.z, ease);
          targetRotX = THREE.MathUtils.lerp(u.float.rotX, u.form.rotX, ease);
          targetRotY = THREE.MathUtils.lerp(u.float.rotY, u.form.rotY, ease);
          targetRotZ = THREE.MathUtils.lerp(u.float.rotZ, u.form.rotZ, ease);
        }

        // Subtle organic levitation float
        const floatOffset = Math.sin(elapsedTime * 1.6 + idx * 0.8) * 0.06;
        targetY += floatOffset;

        // Hover elevation
        if (isHovered) {
          targetZ += 0.5;
          targetY += 0.2;
        }

        // Apply positions
        card.position.x += (targetX - card.position.x) * 0.1;
        card.position.y += (targetY - card.position.y) * 0.1;
        card.position.z += (targetZ - card.position.z) * 0.1;

        // Flip rotation
        const flipY = u.isFlipped ? Math.PI : 0;
        card.rotation.x += (targetRotX - card.rotation.x) * 0.1;
        card.rotation.y += ((targetRotY + flipY) - card.rotation.y) * 0.1;
        card.rotation.z += (targetRotZ - card.rotation.z) * 0.1;
      });
    }

    // Golden dust particles drifting in 3D
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02 + this.mouse.x * 0.08;
      this.particles.position.y = -p * 2.0;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
  }
}
