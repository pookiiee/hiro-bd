// ==========================================================
// Hiro's Ghost Cafe - High-Fidelity Pixel Art Graphics Engine
// Danny Phantom Theme | Strict No-Pink Palette
// ==========================================================

const Sprites = {
  // Master Color Palette
  colors: {
    deepVoid: '#090514',
    floorBlueDark: '#1c1c38',
    floorBlueLight: '#282c50',
    floorAccent: '#3c4578',
    wallWood: '#361e12',
    wallWoodDark: '#22120a',
    wallGoldTrim: '#d4af37',
    counterTop: '#422415',
    counterFront: '#1f1433',

    // Danny Phantom Signature Ecto-Green & Cyan
    ectoGreen: '#00ff88',
    ectoGreenBright: '#39ff14',
    ectoGreenDark: '#0b6638',
    ghostCyan: '#00e5ff',
    ghostCyanDark: '#008394',

    // Warm & Food Colors (Golden, Roasted, Amber - NO PINK)
    goldStar: '#ffcc00',
    bunGolden: '#d4883b',
    pattyBrown: '#3d1e0d',
    friesGold: '#ffb703',
    teaAmber: '#e07a24',
    cupcakeChoc: '#2d180c',
    creamMint: '#64dfdf',

    // Characters
    skinHiro: '#fcdcb8',
    hairHiro: '#2b1b17',
    hiroClothes: '#162238',
    hiroAccent: '#00ff88',

    dannySuit: '#14161d',
    dannyWhite: '#ffffff',
    dannyHair: '#f0faff',
    dannySkin: '#fedbb7',

    samHair: '#101016',
    samPurple: '#4c2675',
    samSkin: '#fee0c6',

    tuckerSkin: '#7d4a2d',
    tuckerBeret: '#b52222',
    tuckerYellow: '#fab005',

    emberTeal: '#00f5d4',
    boxBlue: '#48cae4'
  },

  init() {
    this.createFloorPattern();
  },

  // 1. Tiled Floor
  createFloorPattern() {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 48;
    const ctx = c.getContext('2d');

    ctx.fillStyle = this.colors.floorBlueDark;
    ctx.fillRect(0, 0, 48, 48);

    ctx.fillStyle = this.colors.floorBlueLight;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(48, 24);
    ctx.lineTo(24, 48);
    ctx.lineTo(0, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.colors.floorAccent;
    ctx.fillRect(22, 22, 4, 4);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.fillRect(23, 23, 2, 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeRect(0, 0, 48, 48);

    this.floorPattern = c;
  },

  // Helper to draw up to 3 held items above character's head
  drawHeldItems(ctx, heldItems = [], yOffset = -30) {
    if (!heldItems || heldItems.length === 0) return;
    const count = heldItems.length;
    const spacing = 22;
    const startX = -((count - 1) * spacing) / 2;

    heldItems.forEach((item, idx) => {
      this.drawItem(ctx, startX + idx * spacing, yOffset, item, true);
    });
  },

  // 2. Draw Hiro (Player 1)
  drawHiro(ctx, x, y, frame = 0, dir = 'down', heldItems = [], isOnlineFriend = false) {
    ctx.save();
    ctx.translate(x, y);

    const bob = Math.sin(frame * 0.25) * 2;
    const hasItems = (heldItems && heldItems.length > 0);

    // Online player tag
    if (isOnlineFriend) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
      ctx.font = 'bold 9px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('هيرو 🟢', 0, -42 + bob);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boots
    ctx.fillStyle = '#141419';
    ctx.fillRect(-6, 10 + bob * 0.4, 4, 6);
    ctx.fillRect(2, 10 - bob * 0.4, 4, 6);

    // Dark Jeans
    ctx.fillStyle = '#1e2436';
    ctx.fillRect(-6, 3 + bob * 0.4, 4, 8);
    ctx.fillRect(2, 3 - bob * 0.4, 4, 8);

    // Apron & Jacket
    ctx.fillStyle = this.colors.hiroClothes;
    ctx.fillRect(-8, -8 + bob, 16, 12);
    ctx.fillStyle = this.colors.hiroAccent;
    ctx.fillRect(-5, -6 + bob, 10, 10);
    ctx.fillStyle = '#0b522e';
    ctx.fillRect(-3, -2 + bob, 6, 4);

    // Arms (Raised if carrying items!)
    ctx.fillStyle = this.colors.hiroClothes;
    if (hasItems) {
      ctx.fillRect(-11, -12 + bob, 4, 8);
      ctx.fillRect(7, -12 + bob, 4, 8);
    } else {
      ctx.fillRect(-11, -6 + bob, 4, 9);
      ctx.fillRect(7, -6 + bob, 4, 9);
    }

    // Head
    ctx.fillStyle = this.colors.skinHiro;
    ctx.fillRect(-6, -20 + bob, 12, 12);

    // Hair
    ctx.fillStyle = this.colors.hairHiro;
    ctx.fillRect(-8, -25 + bob, 16, 7);
    ctx.fillRect(-9, -21 + bob, 3, 14);
    ctx.fillRect(6, -21 + bob, 3, 14);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(4, -22 + bob, 3, 3);

    // Eyes
    if (dir !== 'up') {
      ctx.fillStyle = '#16131c';
      ctx.fillRect(-4, -16 + bob, 2, 3);
      ctx.fillRect(2, -16 + bob, 2, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-4, -16 + bob, 1, 1);
      ctx.fillRect(2, -16 + bob, 1, 1);
    }

    // Render all held items (up to 3) in hands
    if (hasItems) {
      this.drawHeldItems(ctx, heldItems, -32 + bob);
    }

    ctx.restore();
  },

  // 3. Draw Danny Phantom (Player 2 / Online Co-op Friend)
  drawDanny(ctx, x, y, frame = 0, dir = 'down', heldItems = [], isOnlineFriend = true) {
    ctx.save();
    ctx.translate(x, y);

    const hover = Math.sin(frame * 0.12) * 4;
    const hasItems = (heldItems && heldItems.length > 0);

    // Online player tag
    if (isOnlineFriend) {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
      ctx.font = 'bold 9px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('داني (صاحبتك) 🟢', 0, -44 + hover);
    }

    // Glowing Ecto Aura
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -6 + hover, 20, 0, Math.PI * 2);
    ctx.fill();

    // Ghost Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Boots / Ghost trail
    ctx.fillStyle = this.colors.dannyWhite;
    ctx.fillRect(-6, 6 + hover, 4, 8);
    ctx.fillRect(2, 6 + hover, 4, 8);

    // Black Hazmat Suit
    ctx.fillStyle = this.colors.dannySuit;
    ctx.fillRect(-8, -8 + hover, 16, 14);

    // White Belt & DP Logo
    ctx.fillStyle = this.colors.dannyWhite;
    ctx.fillRect(-8, 2 + hover, 16, 3);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-3, -4 + hover, 6, 5);
    ctx.fillStyle = this.colors.dannySuit;
    ctx.fillRect(-1, -3 + hover, 2, 3);

    // Collar
    ctx.fillStyle = this.colors.dannyWhite;
    ctx.fillRect(-5, -10 + hover, 10, 3);

    // Arms
    ctx.fillStyle = this.colors.dannySuit;
    if (hasItems) {
      ctx.fillRect(-11, -14 + hover, 4, 8);
      ctx.fillRect(7, -14 + hover, 4, 8);
    } else {
      ctx.fillRect(-11, -7 + hover, 4, 9);
      ctx.fillRect(7, -7 + hover, 4, 9);
    }

    // Head
    ctx.fillStyle = this.colors.dannySkin;
    ctx.fillRect(-6, -21 + hover, 12, 11);

    // Glowing Ecto Eyes
    ctx.fillStyle = this.colors.ectoGreenBright;
    ctx.fillRect(-4, -17 + hover, 3, 3);
    ctx.fillRect(1, -17 + hover, 3, 3);

    // Snow-white spiky hair
    ctx.fillStyle = this.colors.dannyHair;
    ctx.fillRect(-8, -26 + hover, 16, 7);
    ctx.fillRect(-10, -24 + hover, 3, 7);
    ctx.fillRect(7, -24 + hover, 3, 7);
    ctx.fillRect(-5, -29 + hover, 4, 4);
    ctx.fillRect(1, -30 + hover, 5, 5);

    // Render all held items (up to 3) in hands
    if (hasItems) {
      this.drawHeldItems(ctx, heldItems, -38 + hover);
    }

    ctx.restore();
  },

  // 4. Draw Customer
  drawCustomer(ctx, x, y, type = 'sam', tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'sam') {
      ctx.fillStyle = this.colors.samPurple;
      ctx.fillRect(-6, 2, 12, 9);
      ctx.fillStyle = '#141414';
      ctx.fillRect(-6, -7, 12, 9);
      ctx.fillStyle = this.colors.samSkin;
      ctx.fillRect(-5, -18, 10, 11);
      ctx.fillStyle = '#3f1a5c';
      ctx.fillRect(-4, -14, 2, 2);
      ctx.fillRect(2, -14, 2, 2);
      ctx.fillStyle = this.colors.samHair;
      ctx.fillRect(-7, -23, 14, 6);
      ctx.fillRect(-8, -18, 3, 8);
      ctx.fillRect(5, -18, 3, 8);
      ctx.fillRect(-1, -27, 3, 5);
    } else if (type === 'tucker') {
      ctx.fillStyle = '#654321';
      ctx.fillRect(-6, 4, 12, 8);
      ctx.fillStyle = this.colors.tuckerYellow;
      ctx.fillRect(-7, -6, 14, 10);
      ctx.fillStyle = this.colors.tuckerSkin;
      ctx.fillRect(-6, -17, 12, 11);
      ctx.fillStyle = '#222';
      ctx.strokeRect(-5, -14, 4, 3);
      ctx.strokeRect(1, -14, 4, 3);
      ctx.fillStyle = this.colors.tuckerBeret;
      ctx.fillRect(-8, -22, 16, 6);
    } else if (type === 'ember') {
      ctx.fillStyle = '#1b1b22';
      ctx.fillRect(-6, -4, 12, 14);
      ctx.fillStyle = '#d8e2dc';
      ctx.fillRect(-5, -16, 10, 12);
      const f = Math.sin(tick * 0.2) * 2;
      ctx.fillStyle = this.colors.emberTeal;
      ctx.fillRect(-8, -26 + f, 16, 10);
      ctx.fillRect(-4, -30 + f, 8, 5);
    } else if (type === 'box') {
      const fl = Math.sin(tick * 0.1) * 3;
      ctx.fillStyle = this.colors.boxBlue;
      ctx.beginPath();
      ctx.arc(0, -6 + fl, 9, Math.PI, 0);
      ctx.lineTo(9, 8 + fl);
      ctx.lineTo(-9, 8 + fl);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(-3, -7 + fl, 2, 2);
      ctx.fillRect(2, -7 + fl, 2, 2);
    } else {
      const fl = Math.sin(tick * 0.12) * 3;
      ctx.fillStyle = this.colors.ectoGreen;
      ctx.beginPath();
      ctx.arc(0, -6 + fl, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#062615';
      ctx.fillRect(-3, -7 + fl, 2, 3);
      ctx.fillRect(2, -7 + fl, 2, 3);
    }

    ctx.restore();
  },

  // 5. Food Items
  drawItem(ctx, x, y, itemKey, isMini = false) {
    ctx.save();
    ctx.translate(x, y);

    const r = isMini ? 11 : 14;
    const s = isMini ? 0.75 : 1;

    ctx.fillStyle = 'rgba(10, 5, 22, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.colors.ectoGreen;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.scale(s, s);

    if (itemKey === 'burger') {
      ctx.fillStyle = this.colors.bunGolden;
      ctx.fillRect(-8, -6, 16, 4);
      ctx.fillStyle = this.colors.ectoGreenBright;
      ctx.fillRect(-9, -2, 18, 2);
      ctx.fillStyle = this.colors.pattyBrown;
      ctx.fillRect(-8, 0, 16, 3);
      ctx.fillStyle = this.colors.bunGolden;
      ctx.fillRect(-8, 3, 16, 3);
    } else if (itemKey === 'shake') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -6, 10, 12);
      ctx.fillStyle = this.colors.ectoGreen;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = this.colors.creamMint;
      ctx.fillRect(-6, -8, 12, 3);
      ctx.fillStyle = this.colors.ghostCyan;
      ctx.fillRect(1, -12, 2, 5);
    } else if (itemKey === 'fries') {
      ctx.fillStyle = '#10522c';
      ctx.fillRect(-6, -2, 12, 9);
      ctx.fillStyle = this.colors.friesGold;
      ctx.fillRect(-5, -7, 2, 6);
      ctx.fillRect(-2, -9, 2, 8);
      ctx.fillRect(1, -8, 2, 7);
      ctx.fillRect(4, -6, 2, 5);
    } else if (itemKey === 'tea') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -2, 12, 8);
      ctx.fillRect(6, 0, 2, 4);
      ctx.fillStyle = this.colors.teaAmber;
      ctx.fillRect(-5, -1, 10, 3);
      ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
      ctx.fillRect(-2, -6, 3, 3);
    } else if (itemKey === 'cupcake') {
      ctx.fillStyle = this.colors.cupcakeChoc;
      ctx.fillRect(-5, 1, 10, 6);
      ctx.fillStyle = this.colors.ectoGreenBright;
      ctx.fillRect(-7, -4, 14, 6);
      ctx.fillStyle = this.colors.goldStar;
      ctx.fillRect(-1, -7, 3, 3);
    }

    ctx.restore();
  },

  // 6. Draw Cooking Station
  drawStation(ctx, station, tick = 0) {
    ctx.save();
    ctx.translate(station.x, station.y);

    ctx.fillStyle = this.colors.counterTop;
    ctx.fillRect(-24, -20, 48, 40);
    ctx.fillStyle = this.colors.counterFront;
    ctx.fillRect(-22, -6, 44, 24);
    ctx.fillStyle = this.colors.wallGoldTrim;
    ctx.fillRect(-24, -20, 48, 3);

    if (station.id === 'grill') {
      ctx.fillStyle = '#222';
      ctx.fillRect(-16, -16, 32, 18);
      ctx.fillStyle = station.busy ? ((tick % 6 < 3) ? '#ffcc00' : '#ff4400') : '#ff6600';
      ctx.fillRect(-14, -14, 28, 4);
      ctx.fillRect(-14, -8, 28, 4);
    } else if (station.id === 'shakeMachine') {
      ctx.fillStyle = '#1c2836';
      ctx.fillRect(-14, -28, 28, 26);
      ctx.fillStyle = this.colors.ectoGreen;
      ctx.fillRect(-10, -24, 20, 10);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-3, -12, 6, 8);
    } else if (station.id === 'fryer') {
      ctx.fillStyle = '#3a3a44';
      ctx.fillRect(-16, -16, 32, 18);
      ctx.fillStyle = '#e69500';
      ctx.fillRect(-12, -12, 24, 10);
    } else if (station.id === 'teaKettle') {
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(-12, -18, 24, 16);
      ctx.fillStyle = this.colors.teaAmber;
      ctx.fillRect(-8, -14, 16, 8);
    } else if (station.id === 'cupcakeOven') {
      ctx.fillStyle = '#281c3b';
      ctx.fillRect(-16, -20, 32, 18);
      ctx.fillStyle = this.colors.ectoGreenBright;
      ctx.fillRect(-12, -16, 24, 4);
    } else if (station.id === 'trash') {
      ctx.fillStyle = '#495057';
      ctx.fillRect(-12, -14, 24, 28);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-14, -18, 28, 5);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText('🗑️', -7, 4);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-22, 20, 44, 14);
    ctx.fillStyle = '#fff';
    ctx.font = '9px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(station.name, 0, 31);

    if (station.busy && station.cookTime > 0) {
      const pct = Math.min(1, station.progress / station.cookTime);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(-20, -32, 40, 8);
      ctx.fillStyle = (pct >= 1) ? '#ffcc00' : this.colors.ectoGreenBright;
      ctx.fillRect(-19, -31, 38 * pct, 6);
    }

    ctx.restore();
  },

  // 7. Dining Table
  drawDiningTable(ctx, table, tick = 0) {
    ctx.save();
    ctx.translate(table.x, table.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c381e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1c2238';
    ctx.beginPath();
    ctx.ellipse(0, -1, 21, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.colors.ectoGreenDark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = this.colors.wallGoldTrim;
    ctx.fillRect(-6, -4, 12, 6);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 5px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(table.id, 0, 1);

    ctx.fillStyle = '#3f573c';
    ctx.fillRect(-34, -8, 8, 16);
    ctx.fillRect(26, -8, 8, 16);

    ctx.restore();
  },

  // 8. MULTI-ITEM COMBO BUBBLE WITH PATIENCE METER
  drawComboOrderBubble(ctx, x, y, orderItems, deliveredItems = [], patiencePct = 1) {
    ctx.save();
    ctx.translate(x, y - 50);

    const count = orderItems.length;
    const bubbleWidth = Math.max(34, count * 28 + 12);
    const bubbleHeight = 32;

    ctx.fillStyle = 'rgba(10, 5, 20, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);
    ctx.fill();

    let timerColor = this.colors.ectoGreen;
    if (patiencePct < 0.3) timerColor = '#ff3333';
    else if (patiencePct < 0.6) timerColor = '#ffcc00';

    ctx.strokeStyle = timerColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(10, 5, 20, 0.9)';
    ctx.beginPath();
    ctx.moveTo(-5, bubbleHeight / 2);
    ctx.lineTo(0, bubbleHeight / 2 + 7);
    ctx.lineTo(5, bubbleHeight / 2);
    ctx.closePath();
    ctx.fill();

    const startX = -((count - 1) * 26) / 2;
    orderItems.forEach((item, idx) => {
      const ix = startX + idx * 26;
      const isDelivered = deliveredItems.includes(item);

      if (isDelivered) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.25)';
        ctx.beginPath();
        ctx.arc(ix, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.colors.ectoGreen;
        ctx.stroke();

        ctx.fillStyle = this.colors.ectoGreenBright;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓', ix, 4);
      } else {
        this.drawItem(ctx, ix, 0, item, true);
      }
    });

    ctx.restore();
  },

  // 9. Draw Background Architecture
  drawEnvironment(ctx, width, height, tick = 0) {
    if (this.floorPattern) {
      for (let x = 0; x < width; x += 48) {
        for (let y = 80; y < height; y += 48) {
          ctx.drawImage(this.floorPattern, x, y);
        }
      }
    }

    ctx.fillStyle = this.colors.wallWoodDark;
    ctx.fillRect(0, 0, width, 88);
    ctx.fillStyle = this.colors.wallWood;
    ctx.fillRect(0, 0, width, 80);
    ctx.fillStyle = this.colors.wallGoldTrim;
    ctx.fillRect(0, 78, width, 4);

    ctx.fillStyle = '#1e112e';
    ctx.fillRect(180, 16, 600, 10);
    ctx.fillRect(180, 44, 600, 10);

    const bottleCols = [this.colors.ectoGreen, this.colors.ghostCyan, '#a25bf7', '#ffd166', '#06d6a0'];
    for (let i = 0; i < 22; i++) {
      const bx = 195 + i * 26;
      ctx.fillStyle = bottleCols[i % bottleCols.length];
      ctx.fillRect(bx, 8, 8, 14);
      ctx.fillRect(bx + 2, 4, 4, 4);
    }
    for (let i = 0; i < 20; i++) {
      const bx = 205 + i * 28;
      ctx.fillStyle = bottleCols[(i + 2) % bottleCols.length];
      ctx.fillRect(bx, 36, 9, 14);
      ctx.fillRect(bx + 2, 32, 5, 4);
    }

    const starXs = [90, 260, 480, 700, 870];
    starXs.forEach((sx, idx) => {
      const swing = Math.sin(tick * 0.04 + idx) * 2;
      ctx.strokeStyle = this.colors.wallGoldTrim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + swing, 70);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 204, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(sx + swing, 72, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.colors.goldStar;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(sx + swing + Math.cos((18 + i * 72) * Math.PI / 180) * 10, 72 - Math.sin((18 + i * 72) * Math.PI / 180) * 10);
        ctx.lineTo(sx + swing + Math.cos((54 + i * 72) * Math.PI / 180) * 4, 72 - Math.sin((54 + i * 72) * Math.PI / 180) * 4);
      }
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = '#3a2012';
    ctx.fillRect(840, 310, 80, 130);
    ctx.fillStyle = '#0f5132';
    ctx.fillRect(846, 316, 68, 118);
    ctx.fillStyle = '#111';
    ctx.fillRect(846, 316, 6, 6);
    ctx.fillRect(908, 316, 6, 6);
    ctx.fillRect(846, 428, 6, 6);
    ctx.fillRect(908, 428, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(878, 360, 4, 4);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(880, 370, 4, 4);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(875, 374, 4, 4);
  }
};

Sprites.init();
