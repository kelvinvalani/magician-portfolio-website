import * as THREE from 'three';
import { soundFX } from './audioEffects.js';

// Procedural Card Texture Generator for luxury gold foil look
function createCardTexture(type = 'back', symbol = '♠', rank = 'A') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  if (type === 'back') {
    // Rich obsidian and intricate gold pattern back
    const grad = ctx.createRadialGradient(256, 384, 50, 256, 384, 380);
    grad.addColorStop(0, '#1c152e');
    grad.addColorStop(0.6, '#0f0c1b');
    grad.addColorStop(1, '#05040a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // Gold filigree borders
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 472, 728);

    ctx.strokeStyle = '#997a15';
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, 444, 700);

    // Center sacred geometry / mystic emblem
    ctx.save();
    ctx.translate(256, 384);
    ctx.strokeStyle = '#f3e5ab';
    ctx.lineWidth = 3;
    
    // Star & rings
    for (let r = 40; r <= 140; r += 30) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sacred geometric diamond
    ctx.beginPath();
    ctx.moveTo(0, -130);
    ctx.lineTo(130, 0);
    ctx.lineTo(0, 130);
    ctx.lineTo(-130, 0);
    ctx.closePath();
    ctx.stroke();

    // Aurelius 'A' monogram
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 72px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', 0, -5);
    ctx.restore();

  } else {
    // Front face: Crisp ivory pearl card face with gold/ruby/obsidian suit
    const isRed = symbol === '♥' || symbol === '♦';
    const mainColor = isRed ? '#b91c1c' : '#0f172a';
    const goldAccent = '#b45309';

    ctx.fillStyle = '#faf8f2';
    ctx.fillRect(0, 0, 512, 768);

    // Subtle luxury watermark
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 464, 720);

    // Corners: Rank & Symbol
    ctx.fillStyle = mainColor;
    ctx.font = 'bold 64px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText(rank, 70, 95);
    ctx.font = '48px serif';
    ctx.fillText(symbol, 70, 150);

    // Inverted bottom corner
    ctx.save();
    ctx.translate(512 - 70, 768 - 95);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 64px "Cinzel", serif';
    ctx.fillText(rank, 0, 0);
    ctx.font = '48px serif';
    ctx.fillText(symbol, 0, 55);
    ctx.restore();

    // Centerpiece
    ctx.save();
    ctx.translate(256, 384);
    ctx.fillStyle = mainColor;
    ctx.font = '160px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 0, -10);

    ctx.font = 'italic 24px "Cinzel", serif';
    ctx.fillStyle = goldAccent;
    ctx.fillText('AURELIUS ILLUSIONS', 0, 160);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export class MagicHeroScene {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cards = [];
    this.particles = null;
    this.spotlight = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isRevealing = false;
    this.activeCardIndex = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06050b, 0.045);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.5, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x2d1f4d, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // Purple mystical rim light
    const purpleLight = new THREE.PointLight(0x8b5cf6, 4.0, 15);
    purpleLight.position.set(-4, -2, 2);
    this.scene.add(purpleLight);

    // Golden interactive spotlight
    this.spotlight = new THREE.SpotLight(0xf59e0b, 5, 20, Math.PI / 5, 0.4, 1.2);
    this.spotlight.position.set(0, 5, 6);
    this.scene.add(this.spotlight);

    // Build Floating Arcane Cards
    this.createCards();

    // Build Mystical Particles Field
    this.createParticleField();

    // Event Listeners
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onClick = this.onClick.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('click', this.onClick);

    this.animate();
  }

  createCards() {
    const cardGeo = new THREE.BoxGeometry(1.4, 2.1, 0.02);
    const cardDefs = [
      { symbol: '♠', rank: 'A', name: 'Ace of Mystery' },
      { symbol: '♦', rank: 'K', name: 'King of Illusions' },
      { symbol: '♥', rank: 'Q', name: 'Queen of Hearts' },
      { symbol: '♣', rank: 'J', name: 'Jack of Wonder' },
      { symbol: '♠', rank: '7', name: 'Lucky Seventh' }
    ];

    const cardBackTex = createCardTexture('back');

    this.cardsGroup = new THREE.Group();
    this.scene.add(this.cardsGroup);

    cardDefs.forEach((def, index) => {
      const cardFrontTex = createCardTexture('front', def.symbol, def.rank);

      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.2
      });

      const frontMat = new THREE.MeshStandardMaterial({
        map: cardFrontTex,
        roughness: 0.35,
        metalness: 0.15
      });

      const backMat = new THREE.MeshStandardMaterial({
        map: cardBackTex,
        roughness: 0.3,
        metalness: 0.5
      });

      // Box materials: [right, left, top, bottom, front, back]
      const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];

      const cardMesh = new THREE.Mesh(cardGeo, materials);
      cardMesh.castShadow = true;
      cardMesh.receiveShadow = true;

      // Arc fan layout
      const angle = (index - 2) * 0.28;
      const radius = 3.6;
      const baseX = Math.sin(angle) * radius;
      const baseY = Math.cos(angle) * 0.4 - 0.4;
      const baseZ = -Math.cos(angle) * 0.8 + 0.5;

      cardMesh.position.set(baseX, baseY, baseZ);
      cardMesh.rotation.z = -angle * 0.9;
      cardMesh.rotation.y = angle * 0.5;
      cardMesh.rotation.x = 0.15;

      cardMesh.userData = {
        index,
        def,
        basePos: cardMesh.position.clone(),
        baseRot: cardMesh.rotation.clone(),
        floatingPhase: Math.random() * Math.PI * 2,
        isFlipped: false
      };

      this.cards.push(cardMesh);
      this.cardsGroup.add(cardMesh);
    });

    // Position cards group responsive to screen size
    this.updateCardsPosition();
  }

  updateCardsPosition() {
    if (!this.cardsGroup) return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      this.cardsGroup.position.set(0, -0.65, -0.3);
      this.cardsGroup.scale.set(0.85, 0.85, 0.85);
    } else {
      // Position on the right side of desktop screen
      this.cardsGroup.position.set(2.4, -0.2, 0.4);
      this.cardsGroup.scale.set(1.1, 1.1, 1.1);
    }
  }

  createParticleField() {
    const count = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const goldColor = new THREE.Color(0xf59e0b);
    const purpleColor = new THREE.Color(0x8b5cf6);
    const cyanColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const choice = Math.random();
      const col = choice > 0.6 ? goldColor : choice > 0.25 ? purpleColor : cyanColor;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture circle
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const rad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    rad.addColorStop(0.3, 'rgba(255, 220, 150, 0.8)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = rad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.16,
      map: pTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onPointerMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.mouse.targetX = x;
    this.mouse.targetY = y;
  }

  onClick(e) {
    const rect = this.container.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, this.camera);
    const intersects = raycaster.intersectObjects(this.cards);

    if (intersects.length > 0) {
      const card = intersects[0].object;
      this.triggerCardReveal(card);
    }
  }

  // Interactive 3D Card Trick Trigger
  triggerCardReveal(cardMesh) {
    soundFX.playCardSwoosh();
    soundFX.playSparkle();

    cardMesh.userData.isFlipped = !cardMesh.userData.isFlipped;
    const targetRotY = cardMesh.userData.isFlipped ? Math.PI : cardMesh.userData.baseRot.y;
    const targetZ = cardMesh.userData.isFlipped ? cardMesh.userData.basePos.z + 1.2 : cardMesh.userData.basePos.z;
    const targetScale = cardMesh.userData.isFlipped ? 1.25 : 1.0;

    // Trigger visual hint event to UI
    const event = new CustomEvent('magic-card-selected', {
      detail: {
        rank: cardMesh.userData.def.rank,
        symbol: cardMesh.userData.def.symbol,
        name: cardMesh.userData.def.name,
        isFlipped: cardMesh.userData.isFlipped
      }
    });
    window.dispatchEvent(event);

    // Animate flip smoothly
    const startRotY = cardMesh.rotation.y;
    const startZ = cardMesh.position.z;
    const startScale = cardMesh.scale.x;
    let progress = 0;

    const animateFlip = () => {
      progress += 0.06;
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
      cardMesh.rotation.y = THREE.MathUtils.lerp(startRotY, targetRotY, ease);
      cardMesh.position.z = THREE.MathUtils.lerp(startZ, targetZ, ease);
      const curScale = THREE.MathUtils.lerp(startScale, targetScale, ease);
      cardMesh.scale.set(curScale, curScale, curScale);

      if (progress < 1) {
        requestAnimationFrame(animateFlip);
      } else {
        if (cardMesh.userData.isFlipped) {
          soundFX.playChime(659.25); // E5 chord
        }
      }
    };
    animateFlip();
  }

  // Pick a random card via external button
  revealRandomCard() {
    const unrevealed = this.cards.filter(c => !c.userData.isFlipped);
    const target = unrevealed.length > 0 ? unrevealed[Math.floor(Math.random() * unrevealed.length)] : this.cards[0];
    this.triggerCardReveal(target);
  }

  shuffleDeck() {
    soundFX.playCardSwoosh();
    this.cards.forEach((card, idx) => {
      card.userData.isFlipped = false;
      const origPos = card.userData.basePos;
      
      let p = 0;
      const animateShuffle = () => {
        p += 0.05;
        const offset = Math.sin(p * Math.PI) * (idx % 2 === 0 ? 1.5 : -1.5);
        card.position.x = origPos.x + offset;
        card.rotation.z = card.userData.baseRot.z + offset * 0.2;
        card.rotation.y = card.userData.baseRot.y;
        card.scale.set(1, 1, 1);
        if (p < 1) {
          requestAnimationFrame(animateShuffle);
        } else {
          card.position.copy(origPos);
          card.rotation.copy(card.userData.baseRot);
        }
      };
      setTimeout(() => animateShuffle(), idx * 60);
    });
  }

  onWindowResize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.updateCardsPosition();
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Move camera parallax slightly
    this.camera.position.x = this.mouse.x * 0.9;
    this.camera.position.y = 0.5 + this.mouse.y * 0.4;
    this.camera.lookAt(0, 0, 0);

    // Update spotlight position
    if (this.spotlight) {
      this.spotlight.position.x = this.mouse.x * 4;
      this.spotlight.position.y = 4 + this.mouse.y * 2;
    }

    // Gentle float on cards
    this.cards.forEach((card, i) => {
      const p = card.userData.floatingPhase;
      const floatY = Math.sin(time * 1.5 + p) * 0.08;
      const tiltX = Math.cos(time * 1.2 + p) * 0.03;

      if (!card.userData.isFlipped) {
        card.position.y = card.userData.basePos.y + floatY;
        card.rotation.x = card.userData.baseRot.x + tiltX;
      }
    });

    // Rotate particles gently
    if (this.particles) {
      this.particles.rotation.y = time * 0.04;
      this.particles.rotation.x = Math.sin(time * 0.02) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
