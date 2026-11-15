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

    // Food Colors (Strictly NO pink)
    goldStar: '#ffcc00',
    bunGolden: '#d4883b',
    pattyBrown: '#3d1e0d',
    friesGold: '#ffb703',
    teaAmber: '#e07a24',
    cupcakeChoc: '#2d180c',
    creamMint: '#64dfdf',

    // Danny Phantom Characters Palettes
    dannySuit: '#14161d',
    dannyWhite: '#ffffff',
    dannyHair: '#f0faff',
    dannySkin: '#fedbb7',

    humanDannyHair: '#141416',
    humanDannyShirt: '#ffffff',
    humanDannyRed: '#d90429',
    humanDannyJeans: '#2b4162',

    samHair: '#101016',
    samPurple: '#4c2675',
    samSkin: '#fee0c6',

    tuckerSkin: '#7d4a2d',
    tuckerBeret: '#b52222',
    tuckerYellow: '#fab005',

    jazzHair: '#e85d04',
    jazzHeadband: '#00b4d8',
    jazzSkin: '#fedbb7',
    jazzPants: '#d4a373',

    vladHair: '#f1faee',
    vladSkin: '#d0d6dd',
    vladCape: '#800e13',
    vladSuit: '#101018',

    skulkerArmor: '#2d6a4f',
    skulkerDark: '#1b4332',
    skulkerFlame: '#39ff14',

    emberTeal: '#00f5d4',
    emberDark: '#111116',
    emberSkin: '#d8e2dc',

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

  // Helper to draw up to 3 held items above character's head with clear food picture and name
  drawHeldItems(ctx, heldItems = [], yOffset = -34) {
    if (!heldItems || heldItems.length === 0) return;
    const count = heldItems.length;
    const spacing = 30;
    const startX = -((count - 1) * spacing) / 2;

    // Outer backing tray plate with glowing ecto border
    const trayWidth = count * spacing + 14;
    ctx.fillStyle = 'rgba(7, 3, 16, 0.94)';
    ctx.beginPath();
    ctx.roundRect(-trayWidth / 2, yOffset - 17, trayWidth, 34, 10);
    ctx.fill();
    ctx.strokeStyle = this.colors.ectoGreen;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw each item clearly (large size, radius 14)
    heldItems.forEach((item, idx) => {
      this.drawItem(ctx, startX + idx * spacing, yOffset, item, false);
    });

    // Clear readable text badge above the tray showing what you are holding
    const itemNamesArabic = {
      burger: 'برجر',
      shake: 'عصير',
      fries: 'بطاطس',
      tea: 'شاي',
      cupcake: 'كيك'
    };
    const textLabel = heldItems.map(i => itemNamesArabic[i] || i).join(' + ');

    ctx.fillStyle = 'rgba(6, 3, 14, 0.96)';
    const badgeW = Math.max(56, textLabel.length * 9 + 20);
    ctx.beginPath();
    ctx.roundRect(-badgeW / 2, yOffset - 35, badgeW, 17, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(textLabel, 0, yOffset - 23);
  },

  // 2. UNIFIED PLAYABLE CHARACTER RENDERER (Danny Phantom Universe Only)
  drawCharacter(ctx, x, y, charId = 'danny', frame = 0, dir = 'down', heldItems = [], isOnlineFriend = false, tagText = null, isDancing = false) {
    ctx.save();
    ctx.translate(x, y);

    const isGhost = (charId === 'danny' || charId === 'vlad' || charId === 'ember' || charId === 'skulker' || charId === 'box');
    const danceBob = isDancing ? Math.sin(frame * 0.35) * 5 : 0;
    const danceSway = isDancing ? Math.cos(frame * 0.25) * 4 : 0;
    const hover = (isGhost ? Math.sin(frame * 0.12) * 4 : 0) + danceBob;
    const bob = (isGhost ? 0 : Math.sin(frame * 0.25) * 2) + danceBob;
    const hasItems = (heldItems && heldItems.length > 0);

    if (isDancing) {
      ctx.translate(danceSway, 0);
      // Floating musical notes & sparkles above head
      const noteBob = (frame * 1.5) % 36;
      const notes = ['♪', '♫', '✦', '★'];
      const noteIndex = Math.floor(frame / 18) % notes.length;
      ctx.fillStyle = this.colors.ectoGreenBright;
      ctx.font = 'bold 13px Arial';
      ctx.fillText(notes[noteIndex], -8, -52 - noteBob * 0.4);
      ctx.fillText(notes[(noteIndex + 1) % notes.length], 8, -60 - noteBob * 0.3);
    }

    // Clean, natural Arabic character names (No cringe titles)
    const charNames = {
      danny: 'داني الشبح',
      dannyHuman: 'داني فنتون',
      sam: 'سام مانسون',
      tucker: 'تاكر فولي',
      jazz: 'جاز فنتون',
      vlad: 'فلاد بلاسما',
      skulker: 'سكلكر',
      ember: 'إمبر مكلين',
      box: 'شبح الصناديق'
    };
    const displayName = tagText || charNames[charId] || charId;

    if (displayName) {
      // Put name UNDERNEATH the character in clear, readable font
      const textW = Math.max(34, displayName.length * 7.5 + 10);
      ctx.fillStyle = 'rgba(6, 3, 14, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-textW / 2, 21, textW, 15, 4);
      ctx.fill();
      ctx.strokeStyle = isOnlineFriend ? '#00e5ff' : '#00ff88';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = isOnlineFriend ? '#00e5ff' : '#ffffff';
      ctx.font = 'bold 10.5px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(displayName, 0, 32.5);
    }

    // Ghost Auras
    if (charId === 'danny') {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
      ctx.beginPath();
      ctx.arc(0, -6 + hover, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (charId === 'vlad') {
      ctx.fillStyle = 'rgba(128, 14, 19, 0.25)';
      ctx.beginPath();
      ctx.arc(0, -6 + hover, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (charId === 'ember') {
      ctx.fillStyle = 'rgba(0, 245, 212, 0.18)';
      ctx.beginPath();
      ctx.arc(0, -8 + hover, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // CHARACTER DRAWING IMPLEMENTATIONS
    if (charId === 'danny') {
      // 1. DANNY PHANTOM (Ghost Form)
      ctx.fillStyle = this.colors.dannyWhite;
      ctx.fillRect(-6, 6 + hover, 4, 8);
      ctx.fillRect(2, 6 + hover, 4, 8);

      ctx.fillStyle = this.colors.dannySuit;
      ctx.fillRect(-8, -8 + hover, 16, 14);

      ctx.fillStyle = this.colors.dannyWhite;
      ctx.fillRect(-8, 2 + hover, 16, 3);
      ctx.fillStyle = this.colors.ectoGreen;
      ctx.fillRect(-3, -4 + hover, 6, 5);
      ctx.fillStyle = this.colors.dannySuit;
      ctx.fillRect(-1, -3 + hover, 2, 3);

      ctx.fillStyle = this.colors.dannyWhite;
      ctx.fillRect(-5, -10 + hover, 10, 3);

      ctx.fillStyle = this.colors.dannySuit;
      if (hasItems) {
        ctx.fillRect(-11, -14 + hover, 4, 8);
        ctx.fillRect(7, -14 + hover, 4, 8);
      } else {
        ctx.fillRect(-11, -7 + hover, 4, 9);
        ctx.fillRect(7, -7 + hover, 4, 9);
      }

      ctx.fillStyle = this.colors.dannySkin;
      ctx.fillRect(-6, -21 + hover, 12, 11);
      ctx.fillStyle = this.colors.ectoGreenBright;
      ctx.fillRect(-4, -17 + hover, 3, 3);
      ctx.fillRect(1, -17 + hover, 3, 3);

      ctx.fillStyle = this.colors.dannyHair;
      ctx.fillRect(-8, -26 + hover, 16, 7);
      ctx.fillRect(-10, -24 + hover, 3, 7);
      ctx.fillRect(7, -24 + hover, 3, 7);
      ctx.fillRect(-5, -29 + hover, 4, 4);
      ctx.fillRect(1, -30 + hover, 5, 5);

    } else if (charId === 'dannyHuman') {
      // 2. DANNY FENTON (Human Form)
      ctx.fillStyle = this.colors.humanDannyRed;
      ctx.fillRect(-6, 10 + bob * 0.4, 4, 6);
      ctx.fillRect(2, 10 - bob * 0.4, 4, 6);

      ctx.fillStyle = this.colors.humanDannyJeans;
      ctx.fillRect(-6, 3 + bob * 0.4, 4, 8);
      ctx.fillRect(2, 3 - bob * 0.4, 4, 8);

      ctx.fillStyle = this.colors.humanDannyShirt;
      ctx.fillRect(-8, -8 + bob, 16, 12);
      ctx.fillStyle = this.colors.humanDannyRed;
      ctx.fillRect(-4, -5 + bob, 8, 6); // Red oval on shirt

      ctx.fillStyle = this.colors.humanDannyShirt;
      if (hasItems) {
        ctx.fillRect(-11, -12 + bob, 4, 8);
        ctx.fillRect(7, -12 + bob, 4, 8);
      } else {
        ctx.fillRect(-11, -6 + bob, 4, 9);
        ctx.fillRect(7, -6 + bob, 4, 9);
      }

      ctx.fillStyle = this.colors.dannySkin;
      ctx.fillRect(-6, -20 + bob, 12, 12);
      ctx.fillStyle = '#0077b6'; // Blue eyes
      ctx.fillRect(-4, -16 + bob, 2, 3);
      ctx.fillRect(2, -16 + bob, 2, 3);

      ctx.fillStyle = this.colors.humanDannyHair;
      ctx.fillRect(-8, -25 + bob, 16, 7);
      ctx.fillRect(-9, -21 + bob, 3, 12);
      ctx.fillRect(6, -21 + bob, 3, 12);

    } else if (charId === 'sam') {
      // 3. SAM MANSON
      ctx.fillStyle = '#141419';
      ctx.fillRect(-5, 9 + bob * 0.4, 3, 7);
      ctx.fillRect(2, 9 - bob * 0.4, 3, 7);

      ctx.fillStyle = this.colors.samPurple;
      ctx.fillRect(-7, 2 + bob, 14, 8);

      ctx.fillStyle = '#18181f';
      ctx.fillRect(-7, -7 + bob, 14, 10);
      ctx.fillStyle = this.colors.ectoGreen;
      ctx.fillRect(-2, -4 + bob, 4, 3);

      ctx.fillStyle = '#18181f';
      if (hasItems) {
        ctx.fillRect(-11, -12 + bob, 4, 8);
        ctx.fillRect(7, -12 + bob, 4, 8);
      } else {
        ctx.fillRect(-10, -6 + bob, 3, 9);
        ctx.fillRect(7, -6 + bob, 3, 9);
      }

      ctx.fillStyle = this.colors.samSkin;
      ctx.fillRect(-5, -18 + bob, 10, 11);
      ctx.fillStyle = '#4c2675';
      ctx.fillRect(-4, -15 + bob, 2, 2);
      ctx.fillRect(2, -15 + bob, 2, 2);

      ctx.fillStyle = this.colors.samHair;
      ctx.fillRect(-7, -23 + bob, 14, 6);
      ctx.fillRect(-8, -19 + bob, 3, 8);
      ctx.fillRect(5, -19 + bob, 3, 8);
      ctx.fillRect(-1, -28 + bob, 3, 6);
      ctx.fillStyle = this.colors.samPurple;
      ctx.fillRect(-2, -24 + bob, 4, 2);

    } else if (charId === 'tucker') {
      // 4. TUCKER FOLEY
      ctx.fillStyle = '#222';
      ctx.fillRect(-5, 9 + bob * 0.4, 4, 7);
      ctx.fillRect(1, 9 - bob * 0.4, 4, 7);

      ctx.fillStyle = '#654321';
      ctx.fillRect(-6, 3 + bob * 0.4, 12, 7);

      ctx.fillStyle = this.colors.tuckerYellow;
      ctx.fillRect(-7, -6 + bob, 14, 10);
      ctx.fillStyle = '#0b522e';
      ctx.fillRect(-8, -6 + bob, 2, 8);

      ctx.fillStyle = this.colors.tuckerYellow;
      if (hasItems) {
        ctx.fillRect(-11, -12 + bob, 4, 8);
        ctx.fillRect(7, -12 + bob, 4, 8);
      } else {
        ctx.fillRect(-10, -6 + bob, 3, 9);
        ctx.fillRect(7, -6 + bob, 3, 9);
      }

      ctx.fillStyle = this.colors.tuckerSkin;
      ctx.fillRect(-6, -18 + bob, 12, 12);
      ctx.fillStyle = '#111';
      ctx.strokeRect(-5, -15 + bob, 4, 3);
      ctx.strokeRect(1, -15 + bob, 4, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-4, -14 + bob, 2, 1);
      ctx.fillRect(2, -14 + bob, 2, 1);

      ctx.fillStyle = this.colors.tuckerBeret;
      ctx.fillRect(-8, -23 + bob, 16, 6);
      ctx.fillRect(-6, -25 + bob, 10, 3);

    } else if (charId === 'jazz') {
      // 5. JAZZ FENTON
      ctx.fillStyle = '#3d2616';
      ctx.fillRect(-5, 9 + bob * 0.4, 3, 7);
      ctx.fillRect(2, 9 - bob * 0.4, 3, 7);

      ctx.fillStyle = this.colors.jazzPants;
      ctx.fillRect(-6, 2 + bob * 0.4, 12, 8);

      ctx.fillStyle = '#141419';
      ctx.fillRect(-7, -8 + bob, 14, 11);
      ctx.fillStyle = this.colors.jazzHeadband;
      ctx.fillRect(-4, -7 + bob, 8, 3);

      ctx.fillStyle = '#141419';
      if (hasItems) {
        ctx.fillRect(-11, -12 + bob, 4, 8);
        ctx.fillRect(7, -12 + bob, 4, 8);
      } else {
        ctx.fillRect(-10, -6 + bob, 3, 9);
        ctx.fillRect(7, -6 + bob, 3, 9);
      }

      ctx.fillStyle = this.colors.jazzSkin;
      ctx.fillRect(-5, -19 + bob, 10, 11);
      ctx.fillStyle = '#1e3d59';
      ctx.fillRect(-4, -16 + bob, 2, 2);
      ctx.fillRect(2, -16 + bob, 2, 2);

      ctx.fillStyle = this.colors.jazzHair;
      ctx.fillRect(-8, -24 + bob, 16, 7);
      ctx.fillRect(-9, -20 + bob, 4, 16);
      ctx.fillRect(5, -20 + bob, 4, 16);
      ctx.fillStyle = this.colors.jazzHeadband;
      ctx.fillRect(-8, -22 + bob, 16, 3);

    } else if (charId === 'vlad') {
      // 6. VLAD PLASMIUS
      // Red Cape behind body
      ctx.fillStyle = this.colors.vladCape;
      ctx.fillRect(-10, -4 + hover, 20, 16);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, 6 + hover, 4, 8);
      ctx.fillRect(2, 6 + hover, 4, 8);

      ctx.fillStyle = this.colors.vladSuit;
      ctx.fillRect(-8, -8 + hover, 16, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8, 2 + hover, 16, 3); // Belt

      ctx.fillStyle = this.colors.vladSuit;
      if (hasItems) {
        ctx.fillRect(-11, -13 + hover, 4, 8);
        ctx.fillRect(7, -13 + hover, 4, 8);
      } else {
        ctx.fillRect(-10, -6 + hover, 3, 9);
        ctx.fillRect(7, -6 + hover, 3, 9);
      }

      ctx.fillStyle = this.colors.vladSkin;
      ctx.fillRect(-6, -20 + hover, 12, 11);
      // Red Vampire Eyes
      ctx.fillStyle = '#d90429';
      ctx.fillRect(-4, -16 + hover, 3, 3);
      ctx.fillRect(1, -16 + hover, 3, 3);

      // Pointed White Hair Horns
      ctx.fillStyle = this.colors.vladHair;
      ctx.fillRect(-7, -25 + hover, 14, 6);
      ctx.fillRect(-9, -29 + hover, 4, 6);
      ctx.fillRect(5, -29 + hover, 4, 6);

    } else if (charId === 'skulker') {
      // 7. SKULKER (Battle Armor Hunter)
      ctx.fillStyle = this.colors.skulkerDark;
      ctx.fillRect(-6, 7 + hover, 5, 8);
      ctx.fillRect(1, 7 + hover, 5, 8);

      // Heavy green armor
      ctx.fillStyle = this.colors.skulkerArmor;
      ctx.fillRect(-9, -8 + hover, 18, 15);
      ctx.fillStyle = '#111';
      ctx.fillRect(-6, -2 + hover, 12, 4);

      // Massive shoulder armor
      ctx.fillStyle = this.colors.skulkerDark;
      ctx.fillRect(-12, -9 + hover, 4, 6);
      ctx.fillRect(8, -9 + hover, 4, 6);

      if (hasItems) {
        ctx.fillRect(-12, -14 + hover, 4, 8);
        ctx.fillRect(8, -14 + hover, 4, 8);
      } else {
        ctx.fillRect(-12, -4 + hover, 4, 8);
        ctx.fillRect(8, -4 + hover, 4, 8);
      }

      // Green Ghost Flame Head
      ctx.fillStyle = this.colors.skulkerFlame;
      ctx.fillRect(-6, -21 + hover, 12, 12);
      ctx.fillRect(-3, -25 + hover, 6, 5);
      // Red Glowing Visor Eyes
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-5, -17 + hover, 10, 3);

    } else if (charId === 'ember') {
      // 8. EMBER MCLAIN
      ctx.fillStyle = '#141419';
      ctx.fillRect(-5, 7 + hover, 4, 8);
      ctx.fillRect(1, 7 + hover, 4, 8);

      ctx.fillStyle = this.colors.emberDark;
      ctx.fillRect(-7, -7 + hover, 14, 14);
      ctx.fillStyle = this.colors.ghostCyan;
      ctx.fillRect(-4, 0 + hover, 8, 2);

      ctx.fillStyle = this.colors.emberDark;
      if (hasItems) {
        ctx.fillRect(-11, -13 + hover, 4, 8);
        ctx.fillRect(7, -13 + hover, 4, 8);
      } else {
        ctx.fillRect(-10, -6 + hover, 3, 9);
        ctx.fillRect(7, -6 + hover, 3, 9);
      }

      ctx.fillStyle = this.colors.emberSkin;
      ctx.fillRect(-5, -18 + hover, 10, 11);
      ctx.fillStyle = '#00f5d4';
      ctx.fillRect(-4, -15 + hover, 2, 2);
      ctx.fillRect(2, -15 + hover, 2, 2);

      const flame = Math.sin(frame * 0.2) * 2;
      ctx.fillStyle = this.colors.emberTeal;
      ctx.fillRect(-8, -25 + hover, 16, 7);
      ctx.fillRect(-4, -30 + hover + flame, 8, 6);
      ctx.fillRect(-1, -34 + hover + flame * 1.5, 4, 5);

    } else if (charId === 'box') {
      // 9. THE BOX GHOST
      const fl = Math.sin(frame * 0.1) * 3;
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

      // Cardboard box held
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(-7, 2 + fl, 14, 10);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(-7, 6 + fl, 14, 2);
    }

    // Render all held items (up to 3) in hands
    if (hasItems) {
      this.drawHeldItems(ctx, heldItems, isGhost ? -38 + hover : -32 + bob);
    }

    ctx.restore();
  },

  // 3. Draw Customer at Table
  drawCustomer(ctx, x, y, type = 'sam', tick = 0) {
    this.drawCharacter(ctx, x, y, type, tick, 'down', [], false, '');
  },

  // 4. Food Items
  drawItem(ctx, x, y, itemKey, isMini = false) {
    ctx.save();
    ctx.translate(x, y);

    const r = isMini ? 14 : 17;
    const s = isMini ? 0.95 : 1.25;

    ctx.fillStyle = 'rgba(10, 5, 22, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.colors.ectoGreen;
    ctx.lineWidth = 1.8;
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
      ctx.fillRect(-6, 0, 12, 7);
      ctx.fillStyle = this.colors.ectoGreenBright;
      ctx.fillRect(-8, -5, 16, 6);
      ctx.fillStyle = this.colors.goldStar;
      ctx.fillRect(-2, -8, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -11, 2, 4);
    }

    ctx.restore();
  },

  // 5. Draw Cooking Station WITH FLOATING PICTURE OF FOOD ITEM
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
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-4, -10, 8, 6);
    } else if (station.id === 'trash') {
      ctx.fillStyle = '#495057';
      ctx.fillRect(-12, -14, 24, 28);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-14, -18, 28, 5);
      // Clean vector bin icon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-5, -4, 10, 10);
      ctx.moveTo(-7, -4); ctx.lineTo(7, -4);
      ctx.moveTo(-2, -6); ctx.lineTo(2, -6);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(-22, 20, 44, 14);
    ctx.fillStyle = '#fff';
    ctx.font = '9px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(station.name, 0, 31);

    if (station.busy && station.cookTime > 0) {
      const pct = Math.min(1, station.progress / station.cookTime);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(-20, -32, 40, 8);
      ctx.fillStyle = (pct >= 1) ? '#ffcc00' : this.colors.ectoGreenBright;
      ctx.fillRect(-19, -31, 38 * pct, 6);
    }

    // FLOATING PICTURE OF ITEM + READY INDICATOR
    const isReady = (station.busy && station.progress >= station.cookTime);
    const signBob = isReady ? Math.sin(tick * 0.16) * 4 : Math.sin(tick * 0.06 + station.x) * 3;
    const signY = (isReady ? -48 : -42) + signBob;

    ctx.save();
    ctx.translate(0, signY);

    if (station.item) {
      // Pulsing Green Aura if Order is Ready
      if (isReady) {
        const pulse = (Math.sin(tick * 0.2) + 1) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 136, ${0.2 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(8, 4, 18, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isReady ? this.colors.ectoGreenBright : ((station.item === 'cupcake') ? this.colors.goldStar : this.colors.ectoGreen);
      ctx.lineWidth = isReady ? 3 : 2;
      ctx.stroke();

      this.drawItem(ctx, 0, 0, station.item, false);

      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(-3, 16);
      ctx.lineTo(0, 20);
      ctx.lineTo(3, 16);
      ctx.closePath();
      ctx.fill();

      // 🌟 Prominent "✓ جاهز!" Badge above the food icon! 🌟
      if (isReady) {
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.roundRect(-22, -26, 44, 15, 6);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#060e0a';
        ctx.font = 'bold 9px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('جاهز', 0, -15);
      }

    } else if (station.id === 'trash') {
      ctx.fillStyle = 'rgba(8, 4, 18, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Clean vector bin icon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-5, -4, 10, 10);
      ctx.moveTo(-7, -4); ctx.lineTo(7, -4);
      ctx.moveTo(-2, -6); ctx.lineTo(2, -6);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  },

  // 6. Dining Table
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

  // 7. MULTI-ITEM COMBO BUBBLE WITH PATIENCE METER
  drawComboOrderBubble(ctx, x, y, orderItems, deliveredItems = [], patiencePct = 1) {
    ctx.save();
    ctx.translate(x, y - 56);

    const count = orderItems.length;
    const spacing = 34;
    const bubbleWidth = Math.max(46, count * spacing + 18);
    const bubbleHeight = 42;

    ctx.fillStyle = 'rgba(8, 4, 18, 0.94)';
    ctx.beginPath();
    ctx.roundRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 12);
    ctx.fill();

    let timerColor = this.colors.ectoGreen;
    if (patiencePct < 0.3) timerColor = '#ff3333';
    else if (patiencePct < 0.6) timerColor = '#ffcc00';

    ctx.strokeStyle = timerColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'rgba(8, 4, 18, 0.94)';
    ctx.beginPath();
    ctx.moveTo(-6, bubbleHeight / 2);
    ctx.lineTo(0, bubbleHeight / 2 + 8);
    ctx.lineTo(6, bubbleHeight / 2);
    ctx.closePath();
    ctx.fill();

    const startX = -((count - 1) * spacing) / 2;
    orderItems.forEach((item, idx) => {
      const ix = startX + idx * spacing;
      const isDelivered = deliveredItems.includes(item);

      if (isDelivered) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.beginPath();
        ctx.arc(ix, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.colors.ectoGreen;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = this.colors.ectoGreenBright;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓', ix, 5);
      } else {
        this.drawItem(ctx, ix, 0, item, true);
      }
    });

    ctx.restore();
  },

  // 8. Draw Background Architecture
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

    // Billiards Table
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
  },

  // 9. GRAND PARTY ROOM FOR HIRO'S BIRTHDAY CELEBRATION
  drawPartyRoom(ctx, width, height, tick, partyState) {
    // 1. Background & Starry Ambiance
    ctx.fillStyle = '#080312';
    ctx.fillRect(0, 0, width, height);

    // Starry sparkles on background
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    for (let i = 0; i < 28; i++) {
      const sx = (i * 67 + tick * 0.3) % width;
      const sy = (i * 41) % 150;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Top Stage Wall (Royal Ghost Zone Dark Violet)
    ctx.fillStyle = '#120726';
    ctx.fillRect(0, 0, width, 140);
    ctx.fillStyle = this.colors.ectoGreenDark;
    ctx.fillRect(0, 137, width, 3);
    ctx.fillStyle = this.colors.wallGoldTrim;
    ctx.fillRect(0, 140, width, 4);

    // Festive Bunting Garland (Triangle flags hanging across top)
    const flagCols = [this.colors.ectoGreen, this.colors.ghostCyan, this.colors.goldStar, '#6b2fb5', '#39ff14'];
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 26);
    for (let x = 0; x <= width; x += 40) {
      const sag = Math.sin((x / width) * Math.PI * 6) * 12 + 32;
      ctx.lineTo(x, sag);
    }
    ctx.stroke();

    for (let x = 20; x < width; x += 40) {
      const sag = Math.sin((x / width) * Math.PI * 6) * 12 + 32;
      ctx.fillStyle = flagCols[(Math.floor(x / 40)) % flagCols.length];
      ctx.beginPath();
      ctx.moveTo(x - 12, sag - 3);
      ctx.lineTo(x + 12, sag - 3);
      ctx.lineTo(x, sag + 18);
      ctx.closePath();
      ctx.fill();
    }

    // Huge Grand Banner: "🎉 HAPPY BIRTHDAY HIRO 🎉"
    const bannerW = 480;
    const bannerH = 46;
    const bannerX = width / 2 - bannerW / 2;
    const bannerY = 68;

    // Glowing banner plate
    ctx.fillStyle = 'rgba(10, 4, 24, 0.94)';
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 12);
    ctx.fill();
    ctx.strokeStyle = (tick % 24 < 12) ? this.colors.ectoGreen : this.colors.goldStar;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Banner Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 17px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = this.colors.ectoGreen;
    ctx.shadowBlur = 10;
    ctx.fillText('كل عام وأنتِ بألف خير وسعادة يا هيرو!', width / 2, bannerY + 29);
    ctx.shadowBlur = 0;

    // Floor Base (Deep party tiles)
    ctx.fillStyle = '#0b0617';
    ctx.fillRect(0, 144, width, height - 144);

    // Floor grid tiles
    ctx.strokeStyle = 'rgba(60, 30, 95, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 144); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 144; y <= height; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // 2. DISCO DANCE FLOOR (Center Area)
    const df = partyState.danceFloor;
    const dfX = df.x - df.width / 2;
    const dfY = df.y - df.height / 2;
    const cols = 8;
    const rows = 4;
    const tileW = df.width / cols;
    const tileH = df.height / rows;

    // Dance floor outer glow frame
    ctx.strokeStyle = (tick % 16 < 8) ? this.colors.ghostCyan : this.colors.ectoGreenBright;
    ctx.lineWidth = 3;
    ctx.strokeRect(dfX - 4, dfY - 4, df.width + 8, df.height + 8);

    const discoColors = [
      'rgba(0, 255, 136, 0.42)',
      'rgba(0, 229, 255, 0.42)',
      'rgba(255, 204, 0, 0.38)',
      'rgba(100, 45, 175, 0.48)',
      'rgba(57, 255, 20, 0.42)'
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIdx = (c + r * 2 + Math.floor(tick / 12)) % discoColors.length;
        ctx.fillStyle = discoColors[colorIdx];
        ctx.fillRect(dfX + c * tileW + 1, dfY + r * tileH + 1, tileW - 2, tileH - 2);

        // Center light pulse
        if ((c + r + Math.floor(tick / 8)) % 3 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(dfX + c * tileW + tileW / 2 - 2, dfY + r * tileH + tileH / 2 - 2, 4, 4);
        }
      }
    }

    // Dance floor label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 11px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ساحة الرقص والاحتفال', df.x, dfY + df.height + 18);

    // 3. AMBIENT DISCO BEAMS (Sweeping spotlights across room)
    if (partyState.partyLights) {
      const beamAngle = Math.sin(tick * 0.03) * 0.45;
      ctx.save();
      ctx.translate(width / 2, 0);
      ctx.rotate(beamAngle);
      const grad1 = ctx.createLinearGradient(0, 0, 0, height);
      grad1.addColorStop(0, 'rgba(0, 255, 136, 0.28)');
      grad1.addColorStop(1, 'rgba(0, 255, 136, 0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-75, height);
      ctx.lineTo(75, height);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const beamAngle2 = Math.cos(tick * 0.025) * 0.55;
      ctx.save();
      ctx.translate(width / 2, 0);
      ctx.rotate(beamAngle2);
      const grad2 = ctx.createLinearGradient(0, 0, 0, height);
      grad2.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      grad2.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-85, height);
      ctx.lineTo(85, height);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. GIANT BIRTHDAY CAKE ON ROYAL PEDESTAL
    this.drawGrandBirthdayCake(ctx, partyState.cake.x, partyState.cake.y, tick, partyState.candlesLit);

    // 5. CUTE WRAPPED GIFTS AROUND THE ROOM
    partyState.gifts.forEach(gift => {
      this.drawCuteGift(ctx, gift, tick);
    });

    // 6. CONFETTI CANNONS
    partyState.confettiCannons.forEach((cannon, idx) => {
      this.drawConfettiCannon(ctx, cannon.x, cannon.y, idx === 0 ? 'right' : 'left', tick);
    });

    // 7. DJ & JUKEBOX STATION
    this.drawDJBooth(ctx, 840, 430, tick, partyState.partyLights);
  },

  // Grand Birthday Cake (with blowable candles)
  drawGrandBirthdayCake(ctx, x, y, tick, candlesLit) {
    ctx.save();

    // Table pedestal
    ctx.fillStyle = '#1e1136';
    ctx.fillRect(x - 44, y + 14, 88, 20);
    ctx.fillStyle = '#2c164d';
    ctx.beginPath();
    ctx.roundRect(x - 48, y + 10, 96, 26, 6);
    ctx.fill();
    ctx.strokeStyle = this.colors.goldStar;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cake Tier 1 (Base - chocolate vanilla)
    ctx.fillStyle = '#3a1f10';
    ctx.beginPath();
    ctx.roundRect(x - 36, y - 6, 72, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#64dfdf';
    ctx.fillRect(x - 36, y - 8, 72, 5);
    ctx.fillStyle = '#ffd700';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x - 28 + i * 14, y + 4, 4, 4);
    }

    // Cake Tier 2 (Middle - ecto green velvet)
    ctx.fillStyle = '#0f522e';
    ctx.beginPath();
    ctx.roundRect(x - 26, y - 24, 52, 19, 4);
    ctx.fill();
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(x - 26, y - 26, 52, 4);

    // Cake Tier 3 (Top - royal purple with gold cream)
    ctx.fillStyle = '#4c2675';
    ctx.beginPath();
    ctx.roundRect(x - 16, y - 40, 32, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x - 16, y - 42, 32, 3);

    // 3 Burning / Blowable Candles
    const candleXs = [-10, 0, 10];
    candleXs.forEach((cx, idx) => {
      // Candle stick
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + cx - 2, y - 52, 4, 10);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(x + cx - 2, y - 48, 4, 2);

      if (candlesLit) {
        // Flickering warm flame
        const flameFlicker = Math.sin(tick * 0.4 + idx * 1.5) * 1.5;
        // Outer halo
        ctx.fillStyle = 'rgba(255, 204, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(x + cx, y - 56, 12, 0, Math.PI * 2);
        ctx.fill();

        // Flame body
        ctx.fillStyle = '#ff7700';
        ctx.beginPath();
        ctx.ellipse(x + cx, y - 56 + flameFlicker, 3.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffff33';
        ctx.beginPath();
        ctx.ellipse(x + cx, y - 55 + flameFlicker, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Blown out wick + smoke puffs
        ctx.fillStyle = '#222';
        ctx.fillRect(x + cx - 1, y - 54, 2, 3);

        const smokeY = (tick * 0.7 + idx * 10) % 24;
        ctx.fillStyle = 'rgba(180, 220, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(x + cx + Math.sin(smokeY * 0.25) * 3, y - 57 - smokeY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Floating Interaction Badge Above Cake
    const badgeBob = Math.sin(tick * 0.08) * 3;
    const badgeText = candlesLit ? 'اضغطي لإطفاء الشموع' : 'تم إطفاء الشموع! كل عام وأنتِ بخير';
    ctx.fillStyle = 'rgba(8, 4, 18, 0.94)';
    const badgeW = 200;
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2, y - 82 + badgeBob, badgeW, 20, 6);
    ctx.fill();
    ctx.strokeStyle = candlesLit ? this.colors.goldStar : this.colors.ectoGreen;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, x, y - 68 + badgeBob);

    ctx.restore();
  },

  // Cute Wrapped Gift Box
  drawCuteGift(ctx, gift, tick) {
    ctx.save();
    const bob = Math.sin(tick * 0.1 + gift.x * 0.05) * 3;

    if (!gift.opened) {
      // Wrapped Gift
      ctx.fillStyle = gift.color;
      ctx.beginPath();
      ctx.roundRect(gift.x - 14, gift.y - 12 + bob, 28, 24, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ribbon
      ctx.fillStyle = gift.ribbon;
      ctx.fillRect(gift.x - 3, gift.y - 12 + bob, 6, 24);
      ctx.fillRect(gift.x - 14, gift.y - 2 + bob, 28, 5);

      // Cute Bow on top
      ctx.beginPath();
      ctx.arc(gift.x - 5, gift.y - 14 + bob, 4, 0, Math.PI * 2);
      ctx.arc(gift.x + 5, gift.y - 14 + bob, 4, 0, Math.PI * 2);
      ctx.fill();

      // Floating Badge: "🎁 افتحي الهدية"
      ctx.fillStyle = 'rgba(8, 4, 18, 0.9)';
      ctx.beginPath();
      ctx.roundRect(gift.x - 42, gift.y - 32 + bob, 84, 16, 4);
      ctx.fill();
      ctx.strokeStyle = gift.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('اضغطي لفتح الهدية', gift.x, gift.y - 21 + bob);
    } else {
      // Opened Gift Box with cute revealed kitten (No text badges - just the pure cute cat!)
      ctx.fillStyle = gift.color;
      ctx.beginPath();
      ctx.roundRect(gift.x - 14, gift.y - 2, 28, 16, 4);
      ctx.fill();

      // Open lid tilted
      ctx.fillStyle = gift.ribbon;
      ctx.save();
      ctx.translate(gift.x + 16, gift.y - 4);
      ctx.rotate(0.4);
      ctx.fillRect(-12, -4, 24, 6);
      ctx.restore();

      // Draw the Unique Cute Pixel Cat for this gift!
      this.drawPixelCat(ctx, gift.x, gift.y - 14 + bob, gift.catType || 'ghostWhite', tick);
    }

    ctx.restore();
  },

  // Draw 4 distinct pixel-art cats with unique fur, ears, eyes, and cute animations
  drawPixelCat(ctx, x, y, catType = 'ghostWhite', tick = 0) {
    ctx.save();
    ctx.translate(x, y);

    const earTwitch = Math.sin(tick * 0.2 + x) * 1.5;
    const tailWag = Math.sin(tick * 0.15 + x) * 3;

    let furCol = '#ffffff';
    let stripeCol = null;
    let eyeCol = '#00ff88';
    let earInner = '#bce7fd';
    let collarCol = '#00ff88';

    if (catType === 'ghostWhite') {
      furCol = '#f8f9fa';
      eyeCol = '#00ff88'; // Ecto green glowing eyes
      earInner = '#cbf3f0';
      collarCol = '#00ff88';
    } else if (catType === 'marmalade') {
      furCol = '#f4a261'; // Ginger orange
      stripeCol = '#e76f51';
      eyeCol = '#ffcc00'; // Amber gold
      earInner = '#ffe5d9';
      collarCol = '#ffb703';
    } else if (catType === 'midnightGoth') {
      furCol = '#1a1426'; // Midnight goth black
      eyeCol = '#ffd700'; // Bright gold
      earInner = '#3c2a4d';
      collarCol = '#9d4edd'; // Violet collar
    } else if (catType === 'silverSiamese') {
      furCol = '#d8dbe2'; // Silver grey
      stripeCol = '#586f7c'; // Dark points
      eyeCol = '#00e5ff'; // Ghost cyan eyes
      earInner = '#8d99ae';
      collarCol = '#00e5ff';
    }

    // Tail
    ctx.fillStyle = stripeCol || furCol;
    ctx.beginPath();
    ctx.arc(-13 + tailWag * 0.5, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Cat Body / Chest (sitting in box)
    ctx.fillStyle = furCol;
    ctx.beginPath();
    ctx.roundRect(-10, -6, 20, 14, 5);
    ctx.fill();

    // Stripes if marmalade or siamese mask
    if (stripeCol && catType === 'marmalade') {
      ctx.fillStyle = stripeCol;
      ctx.fillRect(-7, -4, 3, 7);
      ctx.fillRect(4, -4, 3, 7);
      ctx.fillRect(-2, -5, 4, 3);
    }

    // Collar
    ctx.fillStyle = collarCol;
    ctx.fillRect(-7, 4, 14, 2.5);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 7, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cat Head
    ctx.fillStyle = furCol;
    ctx.beginPath();
    ctx.arc(0, -9, 9, 0, Math.PI * 2);
    ctx.fill();

    if (stripeCol && catType === 'silverSiamese') {
      // Siamese dark face mask
      ctx.fillStyle = stripeCol;
      ctx.beginPath();
      ctx.arc(0, -8, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cat Ears (Triangles with inner ear)
    ctx.fillStyle = furCol;
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-8, -13 + earTwitch);
    ctx.lineTo(-2, -16);
    ctx.lineTo(-3, -9);
    ctx.closePath();
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(8, -13 - earTwitch);
    ctx.lineTo(2, -16);
    ctx.lineTo(3, -9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = earInner;
    ctx.fillRect(-6, -13, 2, 3);
    ctx.fillRect(4, -13, 2, 3);

    // Big Cute Eyes
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(-3.5, -9, 2.8, 0, Math.PI * 2);
    ctx.arc(3.5, -9, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#06030c';
    ctx.fillRect(-4, -10.5, 1.8, 3);
    ctx.fillRect(3, -10.5, 1.8, 3);

    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4.5, -11, 1, 1);
    ctx.fillRect(2.5, -11, 1, 1);

    // Nose
    ctx.fillStyle = (catType === 'midnightGoth') ? '#444' : '#ff9999';
    ctx.fillRect(-1, -6, 2, 1.5);

    // Whiskers
    ctx.strokeStyle = (catType === 'midnightGoth') ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    // left whiskers
    ctx.moveTo(-4, -6); ctx.lineTo(-10, -7);
    ctx.moveTo(-4, -5); ctx.lineTo(-10, -4);
    // right whiskers
    ctx.moveTo(4, -6); ctx.lineTo(10, -7);
    ctx.moveTo(4, -5); ctx.lineTo(10, -4);
    ctx.stroke();

    // Cute Paws resting on the gift box edge
    ctx.fillStyle = furCol;
    ctx.beginPath();
    ctx.arc(-6, 3, 3, 0, Math.PI * 2);
    ctx.arc(6, 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Cute floating sparkles around the kitten
    const sparkleBob = Math.sin(tick * 0.15) * 3;
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.moveTo(-14, -18 + sparkleBob - 3);
    ctx.lineTo(-11, -18 + sparkleBob);
    ctx.lineTo(-14, -18 + sparkleBob + 3);
    ctx.lineTo(-17, -18 + sparkleBob);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13, -20 - sparkleBob - 2.5);
    ctx.lineTo(15.5, -20 - sparkleBob);
    ctx.lineTo(13, -20 - sparkleBob + 2.5);
    ctx.lineTo(10.5, -20 - sparkleBob);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  // Confetti Popper Cannon (Fixed: scale only barrel, text is NEVER mirrored!)
  drawConfettiCannon(ctx, x, y, dir = 'right', tick) {
    ctx.save();
    ctx.translate(x, y);

    // Scale barrel only so text stays correctly oriented!
    ctx.save();
    if (dir === 'left') ctx.scale(-1, 1);

    // Base stand
    ctx.fillStyle = '#222';
    ctx.fillRect(-8, 8, 16, 12);

    // Golden cannon barrel
    ctx.save();
    ctx.rotate(-0.55);
    ctx.fillStyle = this.colors.goldStar;
    ctx.fillRect(-6, -20, 14, 28);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.fillRect(-7, -22, 16, 4);
    ctx.restore();
    ctx.restore(); // Restore scale so text is NOT flipped

    // Upright readable Arabic label on BOTH sides
    ctx.fillStyle = 'rgba(8, 4, 18, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-42, 20, 84, 15, 4);
    ctx.fill();
    ctx.strokeStyle = this.colors.goldStar;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('مدفع المفرقعات', 0, 31);

    ctx.restore();
  },

  // DJ Booth / Jukebox
  drawDJBooth(ctx, x, y, tick, partyLights) {
    ctx.save();
    ctx.translate(x, y);

    // Table
    ctx.fillStyle = '#1c122e';
    ctx.fillRect(-35, -16, 70, 36);
    ctx.fillStyle = this.colors.ghostCyan;
    ctx.fillRect(-35, -16, 70, 3);

    // Speakers (pulsing bass)
    const pulse = (tick % 8 < 4) ? 2 : 0;
    ctx.fillStyle = '#0f0a1c';
    ctx.fillRect(-32, -12, 18, 28);
    ctx.fillStyle = this.colors.ectoGreen;
    ctx.beginPath();
    ctx.arc(-23, 2, 6 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Turntable Vinyl
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(14, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.colors.goldStar;
    ctx.beginPath();
    ctx.arc(14, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Light switch indicator
    ctx.fillStyle = partyLights ? this.colors.ectoGreenBright : '#555';
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('إضاءة الحفلة', 0, 30);

    ctx.restore();
  },

  // 10. Render Portrait for Menu Character Selection
  renderPortrait(canvas, charId) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(1.2, 1.2);
    this.drawCharacter(ctx, canvas.width / (2 * 1.2), canvas.height / (2 * 1.2) + 12, charId, 0, 'down', [], false, '');
    ctx.restore();
  }
};

Sprites.init();
