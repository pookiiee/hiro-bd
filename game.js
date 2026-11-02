// ==========================================================
// Hiro's Ghost Birthday Cafe - Main Game Logic
// Danny Phantom Theme | Top-Down Pixel Cozy Cafe
// ==========================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const state = {
  tick: 0,
  gameStarted: false,
  dialogActive: false,
  celebrationTriggered: false,
  candlesBlown: false,

  // Quest objectives
  questStep: 0,
  quests: {
    talkedDanny: false,
    startedJukebox: false,
    mixedDrink: false,
    gotBoxGift: false,
    cakeLit: true
  },

  // Player Hiro
  player: {
    x: 480,
    y: 360,
    speed: 3.2,
    vx: 0,
    vy: 0,
    dir: 'down',
    moving: false,
    frame: 0
  },

  // Particles & Visual FX
  particles: [],
  fireworks: [],
  activeInteractable: null
};

// NPCs & Interactive Objects
const entities = {
  danny: {
    name: 'داني الشبح',
    type: 'danny',
    x: 480,
    y: 135,
    w: 36,
    h: 40,
    prompt: 'تحدثي مع داني',
    dialogue: [
      "يا هلا يا هيرو! ميلاد سعيد لأروع بطلة! 💚👻",
      "أنا والأصدقاء جهزنا لك حفلة أشباح سرية خاصة فيكِ، وبدون أي ذرة لون بينك زي ما تحبي تماماً!",
      "عشان نبدأ الحفلة، شغلي جهاز الموسيقى (Jukebox) على اليمين، وحضري مشروب الأكتوبلازم من الكاونتر، وشوفي هدية شبح الصناديق!"
    ]
  },
  sam: {
    name: 'سام مانسون',
    type: 'sam',
    x: 230,
    y: 290,
    w: 32,
    h: 36,
    prompt: 'تحدثي مع سام',
    dialogue: [
      "كل سنة وأنتِ طيبة يا هيرو! 🖤",
      "أفضل قرار عملناه اليوم هو طرد كل الألوان الوردية من المقهى واستبدالها بالأخضر والبنفسجي الداكن!",
      "استمتعي بالحفلة، تستاهلين كل خير يا أحسن صديقة."
    ]
  },
  tucker: {
    name: 'تاكر فولي',
    type: 'tucker',
    x: 740,
    y: 290,
    w: 32,
    h: 36,
    prompt: 'تحدثي مع تاكر',
    dialogue: [
      "هيرو! سنة حلوة يا مبدعة! 👓⚡",
      "قمت ببرمجة جهاز الـ PDA حقي ليرسل لكِ أمنيات سعيدة بسرعة 10 جيجابت في الثانية!",
      "كيكة عيد ميلادك هناك على طاولة الـ VIP تبدو خرافية!"
    ]
  },
  boxGhost: {
    name: 'شبح الصناديق',
    type: 'box',
    x: 320,
    y: 190,
    w: 36,
    h: 36,
    prompt: 'استلمي الصندوق',
    dialogue: [
      "احذروااا! أنا شبح الصناديق! 📦👻",
      "لكن اليوم ليس يوماً للشر والكرتون... اليوم أحضرت لكِ صندوق هدية عيد ميلادك يا هيرو!",
      "مغلف بشريطة خضراء نيون خصيصاً لكِ! هابي بيرثداي!"
    ]
  },
  jukebox: {
    name: 'جهاز الموسيقى الشبحي',
    type: 'jukebox',
    x: 820,
    y: 120,
    w: 40,
    h: 50,
    prompt: 'تشغيل الموسيقى 🎵',
    playing: false
  },
  barStation: {
    name: 'كاونتر المشروبات',
    type: 'bar',
    x: 380,
    y: 120,
    w: 60,
    h: 40,
    prompt: 'صنع عصير الأكتوبلازم 🍹'
  },
  cakeTable: {
    name: 'طاولة كيكة الميلاد',
    type: 'cake',
    x: 480,
    y: 290,
    w: 60,
    h: 50,
    prompt: 'تفقد كيكة ميلاد هيرو 🎂'
  },
  portal: {
    name: 'بوابة منطقة الأشباح',
    type: 'portal',
    x: 130,
    y: 90,
    w: 70,
    h: 80,
    prompt: 'فحص البوابة 🌀'
  }
};

// Input Handling
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  keys[e.key] = true;

  if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
    e.preventDefault();
    handleAction();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  keys[e.key] = false;
});

// Setup Mobile Touch Controls
function setupMobileControls() {
  const dpadBtns = document.querySelectorAll('.dpad-btn');
  dpadBtns.forEach(btn => {
    const key = btn.getAttribute('data-key');
    const startPress = (e) => {
      e.preventDefault();
      keys[key] = true;
    };
    const endPress = (e) => {
      e.preventDefault();
      keys[key] = false;
    };

    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', endPress);
    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', endPress);
    btn.addEventListener('mouseleave', endPress);
  });

  const actionBtn = document.getElementById('mobile-action-btn');
  if (actionBtn) {
    actionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAction();
    });
  }
}

// Particle System
function spawnEctoParticles(x, y, count = 10, color = '#00ff88') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3.5;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      radius: 2 + Math.random() * 3,
      alpha: 1,
      color,
      decay: 0.02 + Math.random() * 0.02
    });
  }
}

function updateParticles() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  state.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// Dialog Logic
let currentDialogueQueue = [];
let currentDialogueSpeaker = '';
let currentSpeakerType = '';

function showDialogue(speakerName, speakerType, textList) {
  state.dialogActive = true;
  currentDialogueSpeaker = speakerName;
  currentSpeakerType = speakerType;
  currentDialogueQueue = [...textList];

  const modal = document.getElementById('dialog-modal');
  modal.classList.remove('hidden');

  document.getElementById('dialog-speaker-name').innerText = speakerName;
  Sprites.renderPortrait(document.getElementById('portraitCanvas'), speakerType);

  advanceDialogue();
}

function advanceDialogue() {
  if (currentDialogueQueue.length > 0) {
    const text = currentDialogueQueue.shift();
    const textElem = document.getElementById('dialog-text');
    textElem.innerText = text;
    sounds.playDialogueBlip(320 + Math.random() * 120);
  } else {
    // Close dialogue
    state.dialogActive = false;
    document.getElementById('dialog-modal').classList.add('hidden');
    checkAllQuestsDone();
  }
}

// Interaction handling
function handleAction() {
  if (state.dialogActive) {
    advanceDialogue();
    return;
  }

  if (!state.activeInteractable) return;

  const target = state.activeInteractable;
  sounds.playInteract();

  if (target === entities.danny) {
    state.quests.talkedDanny = true;
    showDialogue(target.name, target.type, target.dialogue);
    updateQuestTracker();
  } else if (target === entities.sam) {
    showDialogue(target.name, target.type, target.dialogue);
  } else if (target === entities.tucker) {
    showDialogue(target.name, target.type, target.dialogue);
  } else if (target === entities.boxGhost) {
    state.quests.gotBoxGift = true;
    spawnEctoParticles(target.x, target.y, 25, '#39ff14');
    sounds.playBoxPop();
    showDialogue(target.name, target.type, target.dialogue);
    updateQuestTracker();
  } else if (target === entities.jukebox) {
    entities.jukebox.playing = !entities.jukebox.playing;
    if (entities.jukebox.playing) {
      state.quests.startedJukebox = true;
      spawnEctoParticles(target.x, target.y - 30, 20, '#00e5ff');
      sounds.startBGM();
      showDialogue('المسجل', 'danny', ['🎶 بدأت الموسيقى الشبحية بالعزف! الأجواء الآن 100% داني الشبح!']);
    } else {
      sounds.stopBGM();
    }
    updateQuestTracker();
  } else if (target === entities.barStation) {
    state.quests.mixedDrink = true;
    sounds.playBubbles();
    spawnEctoParticles(target.x, target.y, 25, '#00ff88');
    showDialogue('كاونتر المشروبات', 'danny', [
      '🍹 تم تحضير عصير الأكتوبلازم الأخضر المنعش بنكهة التفاح والليمون الأخضر!',
      'مشروب الطاقة الرسمي لأبطال منطقة الأشباح!'
    ]);
    updateQuestTracker();
  } else if (target === entities.portal) {
    sounds.playGhostPortal();
    spawnEctoParticles(target.x, target.y - 20, 30, '#00ff88');
    showDialogue('بوابة الأشباح (Fenton Portal)', 'danny', [
      '🌀 البوابة متصلة مباشرة بمنطقة الأشباح! كل الأشباح الودودة ترسل تهنئتها لهيرو اليوم!'
    ]);
  } else if (target === entities.cakeTable) {
    if (state.quests.talkedDanny && state.quests.startedJukebox && state.quests.mixedDrink && state.quests.gotBoxGift) {
      triggerGrandCelebration();
    } else {
      showDialogue('طاولة الكيكة', 'danny', [
        '🎂 كيكة عيد ميلاد هيرو الخرافية! الشوكولاتة الداكنة مع كريمة النعناع والأكتوبلازم وشموع الأشباح المشعة!',
        'أكملي تجهيز الحفلة حتى نجتمع كلنا ونحتفل بكِ!'
      ]);
    }
  }
}

function updateQuestTracker() {
  const questText = document.getElementById('quest-text');
  if (!state.quests.talkedDanny) {
    questText.innerText = 'المهمة: تحدثي مع داني الشبح عند الكاونتر!';
  } else if (!state.quests.startedJukebox) {
    questText.innerText = 'المهمة: شغلي جهاز الموسيقى (Jukebox) على اليمين 🎵';
  } else if (!state.quests.mixedDrink) {
    questText.innerText = 'المهمة: اصنعي مشروب الأكتوبلازم المنعش من الكاونتر 🍹';
  } else if (!state.quests.gotBoxGift) {
    questText.innerText = 'المهمة: استلمي هدية شبح الصناديق 📦';
  } else {
    questText.innerText = '✨ الكل جاهز! توجهي لطاولة الكيكة في المنتصف لبدء الاحتفال! 🎂';
  }
}

function checkAllQuestsDone() {
  if (state.quests.talkedDanny && state.quests.startedJukebox && state.quests.mixedDrink && state.quests.gotBoxGift) {
    updateQuestTracker();
  }
}

// Grand Birthday Surprise Trigger
function triggerGrandCelebration() {
  if (state.celebrationTriggered) return;
  state.celebrationTriggered = true;

  sounds.playCelebrationFanfare();
  sounds.startBGM();

  // Draw cake on modal
  const bigCakeCanvas = document.getElementById('bigCakeCanvas');
  const bCtx = bigCakeCanvas.getContext('2d');
  bCtx.clearRect(0, 0, 120, 120);
  Sprites.drawBirthdayCake(bCtx, 60, 80, 0, true);

  const modal = document.getElementById('birthday-celebration-modal');
  modal.classList.remove('hidden');

  // Launch fireworks
  launchCelebrationFireworks();
}

function launchCelebrationFireworks() {
  const colors = ['#00ff88', '#39ff14', '#00e5ff', '#ffcc00', '#ffffff'];
  const interval = setInterval(() => {
    if (!state.celebrationTriggered) {
      clearInterval(interval);
      return;
    }
    const rx = 100 + Math.random() * 760;
    const ry = 80 + Math.random() * 300;
    const col = colors[Math.floor(Math.random() * colors.length)];
    spawnEctoParticles(rx, ry, 35, col);
    sounds.playFirework();
  }, 450);
}

// Player Movement & Collisions
function updatePlayer() {
  if (state.dialogActive || state.celebrationTriggered) return;

  let dx = 0;
  let dy = 0;

  if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
  if (keys['ArrowDown'] || keys['KeyS']) dy += 1;
  if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) dx += 1;

  if (dx !== 0 && dy !== 0) {
    dx *= 0.7071;
    dy *= 0.7071;
  }

  state.player.moving = (dx !== 0 || dy !== 0);

  if (dx < 0) state.player.dir = 'left';
  else if (dx > 0) state.player.dir = 'right';
  else if (dy < 0) state.player.dir = 'up';
  else if (dy > 0) state.player.dir = 'down';

  let nextX = state.player.x + dx * state.player.speed;
  let nextY = state.player.y + dy * state.player.speed;

  // Screen Bounds (Within cozy cafe room)
  const minX = 70;
  const maxX = 890;
  const minY = 170; // Below counter and upper bar
  const maxY = 490;

  // Collisions with tables
  const collidesWithTable = (x, y) => {
    // Cake table
    if (Math.hypot(x - entities.cakeTable.x, y - entities.cakeTable.y) < 36) return true;
    // Side tables
    if (Math.hypot(x - 200, y - 380) < 30) return true;
    if (Math.hypot(x - 760, y - 380) < 30) return true;
    return false;
  };

  if (nextX >= minX && nextX <= maxX && !collidesWithTable(nextX, state.player.y)) {
    state.player.x = nextX;
  }
  if (nextY >= minY && nextY <= maxY && !collidesWithTable(state.player.x, nextY)) {
    state.player.y = nextY;
  }

  if (state.player.moving) {
    state.player.frame++;
  } else {
    state.player.frame = 0;
  }

  // Check proximity to interactables
  checkProximity();
}

function checkProximity() {
  let closest = null;
  let minDist = 65;

  Object.values(entities).forEach(ent => {
    const d = Math.hypot(state.player.x - ent.x, state.player.y - ent.y);
    if (d < minDist) {
      closest = ent;
      minDist = d;
    }
  });

  state.activeInteractable = closest;
  const bubble = document.getElementById('interact-bubble');

  if (closest) {
    bubble.classList.remove('hidden');
    bubble.querySelector('.prompt-text').innerText = closest.prompt;

    // Convert canvas world coordinates to screen percentage
    const rect = canvas.getBoundingClientRect();
    const screenX = (closest.x / canvas.width) * rect.width;
    const screenY = ((closest.y - 40) / canvas.height) * rect.height;

    bubble.style.left = `${screenX}px`;
    bubble.style.top = `${screenY}px`;
  } else {
    bubble.classList.add('hidden');
  }
}

// Main Render Loop
function render() {
  state.tick++;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Floor Tile Grid
  if (Sprites.tiles.floor) {
    for (let x = 0; x < canvas.width; x += 48) {
      for (let y = 130; y < canvas.height; y += 48) {
        ctx.drawImage(Sprites.tiles.floor, x, y);
      }
    }
  }

  // 2. Draw Upper Wall & Bar Counter (Like Screenshot!)
  Sprites.drawBar(ctx, 280, 110, 400, state.tick);

  // 3. Draw Fenton Ghost Portal on Left Wall
  Sprites.drawGhostPortal(ctx, entities.portal.x, entities.portal.y, state.tick);

  // 4. Draw Ghost Jukebox on Right Wall
  Sprites.drawJukebox(ctx, entities.jukebox.x, entities.jukebox.y, state.tick, entities.jukebox.playing);

  // 5. Draw Decorative Wall Arches & Lanterns
  const lampXs = [130, 310, 480, 650, 830];
  lampXs.forEach(lx => Sprites.drawStarLamp(ctx, lx, 80, state.tick));

  // 6. Draw Furniture: Cozy Armchairs & Booths (Olive green like the screenshot)
  Sprites.drawArmchair(ctx, 120, 260);
  Sprites.drawArmchair(ctx, 120, 340);
  Sprites.drawArmchair(ctx, 120, 420);

  // Tables on the left and right
  Sprites.drawRoundTable(ctx, 200, 380, true, state.tick);
  Sprites.drawRoundTable(ctx, 760, 380, true, state.tick);

  // 7. Draw Birthday VIP Table with the Cake!
  Sprites.drawBirthdayCake(ctx, entities.cakeTable.x, entities.cakeTable.y, state.tick, state.quests.cakeLit);

  // 8. Draw NPCs & Floating Entities
  Sprites.drawDanny(ctx, entities.danny.x, entities.danny.y, state.tick);
  Sprites.drawSam(ctx, entities.sam.x, entities.sam.y, state.tick);
  Sprites.drawTucker(ctx, entities.tucker.x, entities.tucker.y, state.tick);
  Sprites.drawBoxGhost(ctx, entities.boxGhost.x, entities.boxGhost.y, state.tick);

  // 9. Draw Player Hiro (هيرو)
  Sprites.drawHiro(ctx, state.player.x, state.player.y, state.player.frame, state.player.dir);

  // 10. Draw Particles
  updateParticles();
  drawParticles();

  // Loop update
  updatePlayer();
  requestAnimationFrame(render);
}

// Initial Game Setup
function initGame() {
  setupMobileControls();

  // Start Overlay Click
  document.getElementById('btn-start').addEventListener('click', () => {
    sounds.init();
    sounds.playGhostPortal();
    document.getElementById('start-overlay').classList.add('hidden');
    state.gameStarted = true;
  });

  // Music Toggle Button
  const btnMusic = document.getElementById('btn-music-toggle');
  btnMusic.addEventListener('click', () => {
    const isUnmuted = sounds.toggleMute();
    btnMusic.innerText = isUnmuted ? '🔊' : '🔇';
  });

  // Dialog Box Click to Advance
  document.getElementById('dialog-modal').addEventListener('click', () => {
    handleAction();
  });

  // Birthday Candles Blow Button
  document.getElementById('btn-blow-candles').addEventListener('click', () => {
    sounds.playCandlesBlow();
    state.quests.cakeLit = false;
    spawnEctoParticles(canvas.width / 2, canvas.height / 2, 80, '#39ff14');
    document.getElementById('btn-blow-candles').innerText = '✨ تحققت الأمنية! سنة سعيدة يا هيرو! ✨';
    document.getElementById('btn-blow-candles').style.background = '#ffd700';
  });

  document.getElementById('btn-continue-party').addEventListener('click', () => {
    document.getElementById('birthday-celebration-modal').classList.add('hidden');
  });

  requestAnimationFrame(render);
}

window.addEventListener('load', initGame);
