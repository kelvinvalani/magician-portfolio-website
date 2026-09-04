import * as THREE from 'three';

// Procedural high-resolution texture generator matching the "Magic By Kelvin" poster
function generateCardTexture(suit, rank, isBack = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  if (isBack) {
    // Elegant warm cream and subtle gold filigree back
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 760);
    bgGrad.addColorStop(0, '#fbf8f1');
    bgGrad.addColorStop(1, '#f3ede0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 760);

    // Outer double gold border
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, 476, 724);

    ctx.strokeStyle = '#e6c888';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 456, 704);

    // Geometric diamond lattice
    ctx.save();
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.22)';
    ctx.lineWidth = 1.5;
    const step = 40;
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

    ctx.fillStyle = '#faf6ed';
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.strokeStyle = '#dfc285';
    ctx.lineWidth = 1;
    ctx.stroke();

    // MBK monogram
    ctx.fillStyle = '#26221c';
    ctx.font = 'italic 34px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Magic By Kelvin', 0, -8);

    ctx.fillStyle = '#b89047';
    ctx.font = '16px "Playfair Display", serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('ENCHANT', 0, 26);
    ctx.restore();

  } else {
    // Front face: Warm ivory with crisp typography and suit symbols
    const isRed = suit === '♥' || suit === '♦';
    const mainColor = isRed ? '#a62b2b' : '#22201e';

    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, 512, 760);

    // Outer crisp gold edge definition
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 5;
    ctx.strokeRect(6, 6, 500, 748);

    // Fine luxury inner border
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 464, 712);

    // Top-left rank & suit
    ctx.fillStyle = mainColor;
    ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(rank, 65, 80);
    ctx.font = '44px serif';
    ctx.fillText(suit, 65, 130);

    // Bottom-right inverted rank & suit
    ctx.save();
    ctx.translate(512 - 65, 760 - 80);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
    ctx.fillText(rank, 0, 0);
    ctx.font = '44px serif';
    ctx.fillText(suit, 0, 50);
    ctx.restore();

    // Central suit symbol
    ctx.save();
    ctx.translate(256, 380);
    ctx.fillStyle = mainColor;
    ctx.font = '150px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suit, 0, -10);

    // Script text at bottom center
    ctx.fillStyle = '#8f774e';
    ctx.font = 'italic 20px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('MAGIC BY KELVIN', 0, 240);
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
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hoveredCard = null;
    this.isSpread = true;
    this.clock = new THREE.Clock();

    this.init();
    this.setupEvents();
    this.animate();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || 520;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.2);

    // 3. Renderer with transparent background for blending with video overlay
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false; // Soft clean studio aesthetic

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting - Crisp, luminous warm studio lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 2.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(0, 5, 8);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff3db, 1.2);
    fillLight.position.set(-4, -2, 6);
    this.scene.add(fillLight);

    const goldRimLight = new THREE.PointLight(0xe8c878, 2.0, 15);
    goldRimLight.position.set(4, 2, 5);
    this.scene.add(goldRimLight);

    // 5. Build the 4 iconic cards matching Kelvin's poster: ♣ Clubs, ♦ Diamonds, ♠ Spades, ♥ Hearts
    this.createFannedDeck();

    // 6. Ambient golden dust particles
    this.createGoldenParticles();
  }

  createFannedDeck() {
    // 4 cards in exact order of Kelvin's poster: Club, Diamond, Spade, Heart
    const cardDefs = [
      { suit: '♣', rank: 'A', name: 'Ace of Clubs', angle: -0.28, x: -1.35, y: -0.2, z: -0.12 },
      { suit: '♦', rank: 'A', name: 'Ace of Diamonds', angle: -0.09, x: -0.45, y: 0.05, z: 0.0 },
      { suit: '♠', rank: 'A', name: 'Ace of Spades', angle: 0.09, x: 0.45, y: 0.05, z: 0.12 },
      { suit: '♥', rank: 'A', name: 'Ace of Hearts', angle: 0.28, x: 1.35, y: -0.2, z: 0.24 }
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

      // Single card group containing front and back
      const singleCard = new THREE.Group();
      singleCard.userData = {
        id: index,
        name: def.name,
        suit: def.suit,
        rank: def.rank,
        baseAngle: def.angle,
        basePos: new THREE.Vector3(def.x, def.y, def.z),
        targetPos: new THREE.Vector3(def.x, def.y, def.z),
        targetRot: new THREE.Euler(0, 0, def.angle),
        isFlipped: false,
        isHovered: false
      };

      const frontMesh = new THREE.Mesh(cardGeom, frontMat);
      frontMesh.userData.parentCard = singleCard;

      const backMesh = new THREE.Mesh(cardGeom, backMat);
      backMesh.userData.parentCard = singleCard;

      singleCard.add(frontMesh);
      singleCard.add(backMesh);

      singleCard.position.copy(singleCard.userData.basePos);
      singleCard.rotation.z = def.angle;

      this.cardsGroup.add(singleCard);
      this.cards.push(singleCard);
    });

    // Position the cards group slightly lowered for natural breathing room
    this.cardsGroup.position.set(0, -0.15, 0);
  }

  createGoldenParticles() {
    const particleCount = 75;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      scales[i] = Math.random() * 0.8 + 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Warm gold particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(235, 205, 130, 0.95)');
    grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.6)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.18,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupEvents() {
    this.onResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight || 520;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.onResize);

    // Mouse movement for subtle tilt
    this.onMouseMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height * 2 - 1);

      this.mouse.targetX = x;
      this.mouse.targetY = y;

      this.pointer.x = x;
      this.pointer.y = y;

      // Raycasting for card hover
      this.checkHover();
    };
    window.addEventListener('mousemove', this.onMouseMove);

    // Click on cards
    this.onClick = (e) => {
      const rect = this.container.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        this.pointer.x = (e.clientX - rect.left) / rect.width * 2 - 1;
        this.pointer.y = -((e.clientY - rect.top) / rect.height * 2 - 1);
        this.handleCardClick();
      }
    };
    this.container.addEventListener('click', this.onClick);
  }

  checkHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardsGroup.children, true);

    if (intersects.length > 0) {
      let hitCard = intersects[0].object.userData.parentCard;
      if (hitCard && hitCard !== this.hoveredCard) {
        this.hoveredCard = hitCard;
        this.container.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredCard) {
        this.hoveredCard = null;
        this.container.style.cursor = 'default';
      }
    }
  }

  handleCardClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardsGroup.children, true);

    if (intersects.length > 0) {
      const card = intersects[0].object.userData.parentCard;
      if (card) {
        // Toggle flip
        card.userData.isFlipped = !card.userData.isFlipped;

        // Custom event for UI notification
        const evt = new CustomEvent('kelvin-card-click', {
          detail: {
            name: card.userData.name,
            suit: card.userData.suit,
            isFlipped: card.userData.isFlipped
          }
        });
        window.dispatchEvent(evt);
      }
    }
  }

  shuffleDeck() {
    this.cards.forEach((card, idx) => {
      const scatterX = (Math.random() - 0.5) * 3;
      const scatterY = (Math.random() - 0.5) * 1.5;
      const scatterAngle = (Math.random() - 0.5) * 1.2;

      card.position.set(scatterX, scatterY, 0.8);
      card.rotation.z = scatterAngle;
      card.rotation.y = Math.PI * 2;
    });

    const evt = new CustomEvent('kelvin-card-shuffled');
    window.dispatchEvent(evt);
  }

  resetFan() {
    this.cards.forEach((card) => {
      card.userData.isFlipped = false;
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth camera tilt damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.cardsGroup) {
      // Gentle responsive tilt
      this.cardsGroup.rotation.y = this.mouse.x * 0.22;
      this.cardsGroup.rotation.x = -this.mouse.y * 0.16;

      // Subtle organic breathing float
      this.cardsGroup.position.y = -0.15 + Math.sin(elapsedTime * 1.5) * 0.04;

      // Update individual cards
      this.cards.forEach((card, idx) => {
        const u = card.userData;
        const isHovered = (this.hoveredCard === card);

        // Position interpolation
        let targetX = u.basePos.x;
        let targetY = u.basePos.y;
        let targetZ = u.basePos.z;

        if (isHovered) {
          targetY += 0.35;
          targetZ += 0.6;
        }

        card.position.x += (targetX - card.position.x) * 0.1;
        card.position.y += (targetY - card.position.y) * 0.1;
        card.position.z += (targetZ - card.position.z) * 0.1;

        // Rotation interpolation
        let targetRotZ = u.baseAngle;
        if (isHovered) {
          targetRotZ = u.baseAngle * 0.6;
        }
        card.rotation.z += (targetRotZ - card.rotation.z) * 0.1;

        // Flip rotation
        const targetRotY = u.isFlipped ? Math.PI : 0;
        card.rotation.y += (targetRotY - card.rotation.y) * 0.12;
      });
    }

    // Gentle particle motion
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.025 + this.mouse.x * 0.1;
      this.particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.container && this.onClick) {
      this.container.removeEventListener('click', this.onClick);
    }
  }
}
