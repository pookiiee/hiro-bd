// ==========================================================
// Hiro's Ghost Cafe - Dedicated Pixel Art Generator & Renderer
// Inspired by Danny Phantom & cozy 2D Top-Down pixel art
// ==========================================================

const Sprites = {
  // Color Palette Reference (Strictly NO pink!)
  colors: {
    darkVoid: '#0a0614',
    floorDark: '#1a1033',
    floorLight: '#2c1954',
    floorAccent: '#3a226e',
    wallWoodDark: '#2c1a10',
    wallWoodMid: '#4d2e1c',
    wallGold: '#d4af37',
    starGold: '#ffdd44',
    starGlow: '#ffee88',
    ectoGreen: '#00ff88',
    ectoGreenGlow: '#39ff14',
    ectoDark: '#0b5930',
    cyan: '#00e5ff',
    white: '#ffffff',
    charcoal: '#181b22',
    skinHiro: '#fcdcb8',
    hairHiro: '#362312',
    hiroJacket: '#1c2438',
    hiroShirt: '#00e5ff',
    hiroPants: '#1a1d2e',
    samHair: '#111116',
    samPurple: '#512b7a',
    tuckerBeret: '#b52525',
    tuckerSkin: '#825338',
    boxBrown: '#8b5a2b',
    boxRibbon: '#00ff88'
  },

  // Pre-rendered tile cache
  tiles: {},

  init() {
    this.createFloorPattern();
  },

  createFloorPattern() {
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 48;
    tileCanvas.height = 48;
    const ctx = tileCanvas.getContext('2d');

    // Base background
    ctx.fillStyle = this.colors.floorDark;
    ctx.fillRect(0, 0, 48, 48);

    // Diamond grid
    ctx.fillStyle = this.colors.floorLight;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(48, 24);
    ctx.lineTo(24, 48);
    ctx.lineTo(0, 24);
    ctx.closePath();
    ctx.fill();

    // Central Ghost/Star Emblem
    ctx.fillStyle = this.colors.floorAccent;
    ctx.fillRect(22, 22, 4, 4);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.25)'; // Ecto floor glow accent
    ctx.fillRect(23, 23, 2, 2);

    // Border highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeRect(0, 0, 48, 48);

    this.tiles.floor = tileCanvas;
  },

  // Draw Hiro (Player)
  drawHiro(ctx, x, y, frame = 0, dir = 'down') {
    ctx.save();
    ctx.translate(x, y);

    const bob = Math.sin(frame * 0.2) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Boots
    ctx.fillStyle = this.colors.charcoal;
    ctx.fillRect(-6, 8 + bob * 0.5, 4, 8);
    ctx.fillRect(2, 8 - bob * 0.5, 4, 8);

    // Jacket & Torso
    ctx.fillStyle = this.colors.hiroJacket;
    ctx.fillRect(-9, -4 + bob, 18, 14);

    // Cyan T-shirt with green ghost emblem
    ctx.fillStyle = this.colors.hiroShirt;
    ctx.fillRect(-4, -2 + bob, 8, 10);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-2, 1 + bob, 4, 4);

    // Head
    ctx.fillStyle = this.colors.skinHiro;
    ctx.fillRect(-7, -18 + bob, 14, 14);

    // Hair
    ctx.fillStyle = this.colors.hairHiro;
    ctx.fillRect(-8, -23 + bob, 16, 8);
    ctx.fillRect(-9, -20 + bob, 4, 15);
    ctx.fillRect(5, -20 + bob, 4, 15);

    // Glowing Ecto Green Hairpin (Hiro loves it!)
    ctx.fillStyle = this.colors.ectoGreenGlow;
    ctx.fillRect(3, -19 + bob, 3, 3);

    // Eyes
    if (dir !== 'up') {
      ctx.fillStyle = '#1c152b';
      ctx.fillRect(-5, -13 + bob, 3, 3);
      ctx.fillRect(2, -13 + bob, 3, 3);
      // Sparkle in eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -13 + bob, 1, 1);
      ctx.fillRect(3, -13 + bob, 1, 1);
    }

    ctx.restore();
  },

  // Draw Danny Phantom
  drawDanny(ctx, x, y, tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    const hover = Math.sin(tick * 0.08) * 5;

    // Ecto Aura Glow
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -6 + hover, 24, 0, Math.PI * 2);
    ctx.fill();

    // Ghostly Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 10 + Math.sin(tick * 0.08) * 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ghost tail / legs (drifting)
    ctx.fillStyle = this.colors.white;
    ctx.fillRect(-5, 8 + hover, 10, 8);
    // Green boot tips
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-6, 14 + hover, 12, 3);

    // Black Hazmat Suit
    ctx.fillStyle = this.colors.charcoal;
    ctx.fillRect(-8, -5 + hover, 16, 14);

    // White Belt & DP Logo
    ctx.fillStyle = this.colors.white;
    ctx.fillRect(-8, 5 + hover, 16, 3);
    // "D" Ghost Logo
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-3, -2 + hover, 6, 5);
    ctx.fillStyle = this.colors.charcoal;
    ctx.fillRect(-1, -1 + hover, 2, 3);

    // White collar
    ctx.fillStyle = this.colors.white;
    ctx.fillRect(-5, -7 + hover, 10, 3);

    // Head
    ctx.fillStyle = '#fedbb7';
    ctx.fillRect(-6, -18 + hover, 12, 12);

    // Iconic Glowing Green Eyes!
    ctx.fillStyle = this.colors.ectoGreenGlow;
    ctx.fillRect(-4, -14 + hover, 3, 3);
    ctx.fillRect(1, -14 + hover, 3, 3);

    // Danny's Snow White Spiky Hair!
    ctx.fillStyle = this.colors.white;
    ctx.fillRect(-8, -24 + hover, 16, 8);
    ctx.fillRect(-10, -22 + hover, 4, 6);
    ctx.fillRect(6, -22 + hover, 4, 6);
    // Spikes
    ctx.fillRect(-6, -27 + hover, 4, 4);
    ctx.fillRect(1, -28 + hover, 5, 5);

    ctx.restore();
  },

  // Draw Sam Manson
  drawSam(ctx, x, y, tick = 0) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(tick * 0.06) * 1.5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark skirt & combat boots
    ctx.fillStyle = '#111';
    ctx.fillRect(-5, 9 + bob, 3, 7);
    ctx.fillRect(2, 9 + bob, 3, 7);
    ctx.fillStyle = this.colors.samPurple;
    ctx.fillRect(-7, 2 + bob, 14, 8);

    // Black Top with green skull accent
    ctx.fillStyle = '#151515';
    ctx.fillRect(-6, -6 + bob, 12, 9);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-2, -3 + bob, 4, 3);

    // Head
    ctx.fillStyle = '#fee0c6';
    ctx.fillRect(-5, -17 + bob, 10, 11);

    // Eyes (Dark purple eyeliner)
    ctx.fillStyle = '#472165';
    ctx.fillRect(-4, -13 + bob, 2, 2);
    ctx.fillRect(2, -13 + bob, 2, 2);

    // Jet Black Hair with Top Ponytail
    ctx.fillStyle = this.colors.samHair;
    ctx.fillRect(-7, -21 + bob, 14, 6);
    ctx.fillRect(-8, -17 + bob, 3, 9);
    ctx.fillRect(5, -17 + bob, 3, 9);
    // Ponytail spike
    ctx.fillRect(-1, -25 + bob, 3, 5);
    ctx.fillStyle = this.colors.samPurple;
    ctx.fillRect(-2, -22 + bob, 4, 2); // Hair tie

    ctx.restore();
  },

  // Draw Tucker Foley
  drawTucker(ctx, x, y, tick = 0) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(tick * 0.05 + 1) * 1.5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cargo pants & sneakers
    ctx.fillStyle = '#5c4827';
    ctx.fillRect(-5, 8 + bob, 3, 8);
    ctx.fillRect(2, 8 + bob, 3, 8);

    // Yellow shirt
    ctx.fillStyle = '#e6b800';
    ctx.fillRect(-7, -5 + bob, 14, 14);

    // Holding PDA / Tech device
    ctx.fillStyle = this.colors.cyan;
    ctx.fillRect(5, 0 + bob, 5, 7);

    // Head
    ctx.fillStyle = this.colors.tuckerSkin;
    ctx.fillRect(-6, -16 + bob, 12, 11);

    // Glasses
    ctx.fillStyle = '#333333';
    ctx.strokeRect(-5, -13 + bob, 4, 3);
    ctx.strokeRect(1, -13 + bob, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -12 + bob, 2, 1);
    ctx.fillRect(2, -12 + bob, 2, 1);

    // Iconic Red Beret
    ctx.fillStyle = this.colors.tuckerBeret;
    ctx.fillRect(-8, -21 + bob, 16, 6);
    ctx.fillRect(-6, -23 + bob, 10, 3);

    ctx.restore();
  },

  // Draw Box Ghost
  drawBoxGhost(ctx, x, y, tick = 0) {
    ctx.save();
    ctx.translate(x, y);
    const floatY = Math.sin(tick * 0.07) * 7;

    // Ghost aura
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(0, floatY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Ghost body (Cyan/Blue translucent)
    ctx.fillStyle = '#4da6ff';
    ctx.beginPath();
    ctx.arc(0, -6 + floatY, 10, Math.PI, 0);
    ctx.lineTo(10, 10 + floatY);
    ctx.quadraticCurveTo(0, 16 + floatY, -10, 10 + floatY);
    ctx.closePath();
    ctx.fill();

    // Red ghost eyes
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(-4, -8 + floatY, 3, 3);
    ctx.fillRect(2, -8 + floatY, 3, 3);

    // Wrapped Birthday Box in his hands!
    ctx.fillStyle = this.colors.boxBrown;
    ctx.fillRect(-8, 2 + floatY, 16, 14);
    // Green Ribbon (No pink!)
    ctx.fillStyle = this.colors.ectoGreenGlow;
    ctx.fillRect(-8, 8 + floatY, 16, 3);
    ctx.fillRect(-2, 2 + floatY, 3, 14);

    ctx.restore();
  },

  // Draw Fenton Ghost Portal on the wall
  drawGhostPortal(ctx, x, y, tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Metal portal frame
    ctx.fillStyle = '#1b1d28';
    ctx.fillRect(-40, -50, 80, 70);
    ctx.strokeStyle = '#394056';
    ctx.lineWidth = 4;
    ctx.strokeRect(-40, -50, 80, 70);

    // Arch top
    ctx.beginPath();
    ctx.arc(0, -50, 40, Math.PI, 0);
    ctx.fillStyle = '#1b1d28';
    ctx.fill();
    ctx.stroke();

    // Swirling Ectoplasmic vortex
    const gradient = ctx.createRadialGradient(0, -25, 5, 0, -25, 42);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, this.colors.ectoGreenGlow);
    gradient.addColorStop(0.7, '#08733a');
    gradient.addColorStop(1, '#051d14');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, -25, 34, 0, Math.PI * 2);
    ctx.fill();

    // Swirl particles inside portal
    ctx.save();
    ctx.translate(0, -25);
    ctx.rotate(tick * 0.04);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(8, 0, 14, 3);
    }
    ctx.restore();

    // Portal control levers & warning lights
    ctx.fillStyle = this.colors.ectoGreenGlow;
    ctx.fillRect(-35, 12, 6, 6);
    ctx.fillRect(29, 12, 6, 6);

    ctx.restore();
  },

  // Draw Cozy Bar Counter & Shelves (like the reference picture)
  drawBar(ctx, x, y, width = 360, tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Wall Backing
    ctx.fillStyle = '#130c26';
    ctx.fillRect(0, -90, width, 90);

    // Top Shelves with Glowing Bottles (Ecto Green, Cyan, Purple, Gold - NO PINK!)
    ctx.fillStyle = '#2d184a';
    ctx.fillRect(10, -75, width - 20, 8);
    ctx.fillRect(10, -45, width - 20, 8);

    const bottleColors = [
      this.colors.ectoGreenGlow,
      this.colors.cyan,
      '#a25bf7',
      '#ffcc00',
      '#00ffc4'
    ];

    // Shelf 1 Bottles
    for (let i = 0; i < 14; i++) {
      const bx = 20 + i * 23;
      const col = bottleColors[i % bottleColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(bx, -90 + (i % 2 === 0 ? 0 : 3), 8, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 2, -94 + (i % 2 === 0 ? 0 : 3), 4, 4); // bottle cap
    }

    // Shelf 2 Bottles & Glasses
    for (let i = 0; i < 12; i++) {
      const bx = 25 + i * 26;
      const col = bottleColors[(i + 2) % bottleColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(bx, -60, 10, 14);
      // Glow sparkle
      if ((i + Math.floor(tick / 20)) % 5 === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(bx + 3, -56, 3, 3);
      }
    }

    // Main Counter Bar Countertop
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(0, -10, width, 40);

    // Golden/Brass Trim (just like reference image)
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(0, -12, width, 4);
    ctx.fillRect(0, 26, width, 4);

    // Counter Front Face (Geometric pattern with subtle ghost glow)
    ctx.fillStyle = '#1f1338';
    ctx.fillRect(4, 2, width - 8, 22);

    ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
    for (let i = 0; i < width - 20; i += 30) {
      ctx.fillRect(12 + i, 8, 12, 10);
    }

    ctx.restore();
  },

  // Draw Hanging Star Lamps (as in the screenshot!)
  drawStarLamp(ctx, x, y, tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    const swing = Math.sin(tick * 0.03 + x) * 0.05;
    ctx.rotate(swing);

    // Cord
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Ambient glow
    ctx.fillStyle = 'rgba(255, 221, 68, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 6, 22, 0, Math.PI * 2);
    ctx.fill();

    // 5-point Pixel Star
    ctx.fillStyle = this.colors.starGold;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 12, -Math.sin((18 + i * 72) * Math.PI / 180) * 12 + 6);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 5, -Math.sin((54 + i * 72) * Math.PI / 180) * 5 + 6);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  // Draw Tables & Chairs (Cozy booths / restaurant seating)
  drawRoundTable(ctx, x, y, hasCandle = true, tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Table shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden tabletop
    ctx.fillStyle = '#613b1f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Table cloth / inner rim
    ctx.fillStyle = '#7a4b27';
    ctx.beginPath();
    ctx.ellipse(0, -1, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center Green Ghost Candle
    if (hasCandle) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -8, 4, 8); // Candle stick
      // Flickering green ecto-flame
      const flicker = Math.sin(tick * 0.2 + x) * 1.5;
      ctx.fillStyle = this.colors.ectoGreenGlow;
      ctx.beginPath();
      ctx.arc(0 + flicker * 0.5, -11, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  // Draw Cozy Armchair (Olive/Green or Leather like reference)
  drawArmchair(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cushion
    ctx.fillStyle = '#3f573c'; // Green armchair as in user image
    ctx.fillRect(-15, -12, 30, 22);

    // Armrests
    ctx.fillStyle = '#293a27';
    ctx.fillRect(-18, -10, 5, 20);
    ctx.fillRect(13, -10, 5, 20);

    // Backrest
    ctx.fillStyle = '#4f6c4b';
    ctx.fillRect(-15, -20, 30, 10);

    ctx.restore();
  },

  // Draw Ghost Birthday Cake (Hiro's VIP Birthday Table)
  drawBirthdayCake(ctx, x, y, tick = 0, lit = true) {
    ctx.save();
    ctx.translate(x, y);

    // Table backing
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 32, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // VIP Table
    ctx.fillStyle = '#3a1f59';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.colors.wallGold;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cake Base Layer (Dark chocolate with mint green frosting - NO PINK!)
    ctx.fillStyle = '#231409';
    ctx.fillRect(-16, -14, 32, 14);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-17, -14, 34, 4);

    // Cake Top Layer
    ctx.fillStyle = '#382011';
    ctx.fillRect(-10, -24, 20, 11);
    ctx.fillStyle = this.colors.ectoGreenGlow;
    ctx.fillRect(-11, -24, 22, 3);

    // Ecto Green Sprinkles & Star Toppers
    ctx.fillStyle = this.colors.starGold;
    ctx.fillRect(-6, -18, 2, 2);
    ctx.fillRect(4, -19, 2, 2);
    ctx.fillRect(0, -9, 2, 2);
    ctx.fillRect(-10, -8, 2, 2);
    ctx.fillRect(9, -8, 2, 2);

    // Birthday Candles
    const candleXs = [-6, 0, 6];
    candleXs.forEach(cx => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, -30, 3, 7);

      if (lit) {
        // Flickering Ghost Flames
        const fl = Math.sin(tick * 0.25 + cx) * 1.5;
        ctx.fillStyle = this.colors.ectoGreenGlow;
        ctx.beginPath();
        ctx.arc(cx + fl * 0.3, -33, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, -33, 1.5, 1.5);
      }
    });

    ctx.restore();
  },

  // Draw Ghost Jukebox
  drawJukebox(ctx, x, y, tick = 0, playing = false) {
    ctx.save();
    ctx.translate(x, y);

    // Cabinet
    ctx.fillStyle = '#221136';
    ctx.fillRect(-16, -34, 32, 40);

    // Golden arch top
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(0, -34, 16, Math.PI, 0);
    ctx.fill();

    // Glowing Neon tubes
    ctx.strokeStyle = playing ? this.colors.ectoGreenGlow : '#4c2e77';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -34, 12, Math.PI, 0);
    ctx.stroke();

    // Speaker grill
    ctx.fillStyle = '#10081a';
    ctx.fillRect(-12, -24, 24, 24);

    if (playing) {
      // Floating music notes
      const noteY = -40 - ((tick * 0.8) % 30);
      ctx.fillStyle = this.colors.ectoGreenGlow;
      ctx.font = '14px Arial';
      ctx.fillText('♪', Math.sin(tick * 0.1) * 8, noteY);
    }

    ctx.restore();
  },

  // Render Portrait onto canvas for dialog
  renderPortrait(canvas, charType) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2.2, 2.2);

    if (charType === 'danny') {
      this.drawDanny(ctx, 18, 22, 0);
    } else if (charType === 'hiro') {
      this.drawHiro(ctx, 18, 22, 0, 'down');
    } else if (charType === 'sam') {
      this.drawSam(ctx, 18, 22, 0);
    } else if (charType === 'tucker') {
      this.drawTucker(ctx, 18, 22, 0);
    } else if (charType === 'box') {
      this.drawBoxGhost(ctx, 18, 18, 0);
    }

    ctx.restore();
  }
};

Sprites.init();
