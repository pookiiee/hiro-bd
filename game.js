// ==========================================================
// Hiro's Ghost Cafe & Restaurant - Complete Gameplay Engine
// Supports Solo Mode, Online Room Code Multiplayer (PeerJS),
// 3-Item Inventory, Running Machines while Holding Items,
// and Natural Arabic Texts
// ==========================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Item Names in Natural Arabic for Messages & HUD
const ITEM_NAMES = {
  burger: 'برجر 🍔',
  shake: 'عصير 🥤',
  fries: 'بطاطس 🍟',
  tea: 'شاي 🍵',
  cupcake: 'كب كيك 🧁'
};

// Levels with Progressive Combined Orders
const LEVELS = [
  {
    id: 1,
    title: 'المرحلة 1: افتتاح الكافيه',
    target: 4,
    time: 140,
    comboSize: 1,
    menu: ['shake', 'fries', 'burger'],
    customerDelay: 200,
    desc: 'طلبات خفيفة لتبدأي وتتعودي على المكان براحتك.'
  },
  {
    id: 2,
    title: 'المرحلة 2: وجبات مزدوجة',
    target: 5,
    time: 160,
    comboSize: 2,
    menu: ['burger', 'fries', 'shake', 'tea'],
    customerDelay: 180,
    desc: 'الزبائن يطلبون وجبتين مع بعض! يمديك تشيلين الوجبتين بيدك وتسلمينهم سوا.'
  },
  {
    id: 3,
    title: 'المرحلة 3: ساعة الذروة',
    target: 7,
    time: 190,
    comboSize: 3,
    menu: ['burger', 'fries', 'shake', 'tea', 'cupcake'],
    customerDelay: 160,
    desc: 'وجبات ثلاثية متكاملة! استخدمي سعة يدك الكاملة (3 طلبات) لخدمتهم براحتك وبدون توتر.'
  },
  {
    id: 4,
    title: 'المرحلة 4: حفلة ميلاد هيرو الكبرى! 🎂',
    target: 8,
    time: 210,
    comboSize: 3,
    menu: ['burger', 'fries', 'shake', 'tea', 'cupcake'],
    customerDelay: 150,
    desc: 'المرحلة الاحتفالية! كل الأصدقاء حاضرين للاحتفال بيوم ميلاد هيرو!'
  }
];

// Kitchen Cooking Stations
const STATIONS = [
  { id: 'shakeMachine', name: 'عصير الشبح 🥤', item: 'shake', x: 250, y: 130, cookTime: 75, busy: false, progress: 0 },
  { id: 'fryer', name: 'بطاطس مقلية 🍟', item: 'fries', x: 370, y: 130, cookTime: 70, busy: false, progress: 0 },
  { id: 'grill', name: 'شواية البرجر 🍔', item: 'burger', x: 490, y: 130, cookTime: 110, busy: false, progress: 0 },
  { id: 'teaKettle', name: 'شاي الأشباح 🍵', item: 'tea', x: 610, y: 130, cookTime: 75, busy: false, progress: 0 },
  { id: 'cupcakeOven', name: 'كب كيك الميلاد 🧁', item: 'cupcake', x: 730, y: 130, cookTime: 85, busy: false, progress: 0 },
  { id: 'trash', name: 'سلة الزبالة 🗑️', item: null, x: 130, y: 130, cookTime: 0, busy: false, progress: 0 }
];

// Dining Tables
const TABLES = [
  { id: 1, x: 240, y: 260, customer: null },
  { id: 2, x: 480, y: 260, customer: null },
  { id: 3, x: 720, y: 260, customer: null },
  { id: 4, x: 360, y: 400, customer: null },
  { id: 5, x: 600, y: 400, customer: null }
];

const CUSTOMER_TYPES = ['sam', 'tucker', 'ember', 'box', 'friendlyGhost'];

// Core Game State
const state = {
  mode: 'solo', // 'solo' or 'online'
  isHost: true,
  onlineConnected: false,
  currentLevelIndex: 0,
  levelRunning: false,
  isPaused: false,
  timeRemaining: 90,
  timerInterval: null,
  tick: 0,
  coins: 0,
  servedCount: 0,

  // Player 1 (Local: Hiro if host/solo)
  p1: {
    name: 'هيرو',
    x: 420,
    y: 200,
    speed: 3.5,
    dir: 'down',
    frame: 0,
    moving: false,
    heldItems: [] // Capacity up to 3 items!
  },

  // Player 2 (Online Friend: Danny Phantom)
  p2: {
    name: 'داني',
    x: 540,
    y: 200,
    speed: 3.5,
    dir: 'down',
    frame: 0,
    moving: false,
    heldItems: [] // Capacity up to 3 items!
  },

  spawnCooldown: 60,
  particles: [],
  floatingTexts: []
};

// PeerJS Online Multiplayer Manager
const Net = {
  peer: null,
  conn: null,
  myCode: '',

  init() {
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library not loaded; online multiplayer will run in local simulation.');
      const codeElem = document.getElementById('my-room-code');
      if (codeElem) codeElem.innerText = 'HIRO-LOCAL';
      return;
    }

    try {
      const randNum = Math.floor(100 + Math.random() * 900);
      this.myCode = `HIRO-${randNum}`;
      const peerId = `ghost-cafe-${this.myCode.toLowerCase()}`;

      this.peer = new Peer(peerId);

      this.peer.on('open', (id) => {
        const codeElem = document.getElementById('my-room-code');
        if (codeElem) codeElem.innerText = this.myCode;
      });

      this.peer.on('connection', (c) => {
        this.conn = c;
        state.isHost = true;
        this.setupConnection();
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS status:', err);
      });
    } catch (e) {
      console.warn('Network peer exception:', e);
    }
  },

  connectTo(targetCode) {
    if (!this.peer) {
      alert('خدمة الأونلاين غير متاحة حالياً بدون اتصال إنترنت.');
      return;
    }
    const cleanCode = targetCode.trim().toUpperCase();
    const targetPeerId = `ghost-cafe-${cleanCode.toLowerCase()}`;
    const statusElem = document.getElementById('join-status');
    statusElem.innerText = 'جاري الدخول إلى الروم... ⏳';

    try {
      this.conn = this.peer.connect(targetPeerId);
      state.isHost = false;

      this.conn.on('open', () => {
        statusElem.innerText = 'تم الدخول بنجاح! 🟢 مرحباً بكِ في الكافيه!';
        this.setupConnection();
      });

      this.conn.on('error', (err) => {
        statusElem.innerText = 'تعذر الاتصال! تأكدي من كود الروم.';
      });
    } catch (e) {
      statusElem.innerText = 'حدث خطأ في الاتصال، حاولي ثانية.';
    }
  },

  setupConnection() {
    state.onlineConnected = true;
    state.mode = 'online';

    const netBadge = document.getElementById('net-status-badge');
    if (netBadge) {
      netBadge.innerText = 'أونلاين متصل 🟢';
      netBadge.style.borderColor = '#00ff88';
      netBadge.style.color = '#00ff88';
    }

    const hostStatus = document.getElementById('host-status');
    if (hostStatus) hostStatus.innerText = 'دخلت صاحبتك الروم! جاهزين للبدء 🟢';

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      state.onlineConnected = false;
      const netBadge = document.getElementById('net-status-badge');
      if (netBadge) netBadge.innerText = 'انقطع الاتصال 🔴';
    });
  },

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  },

  handleIncomingData(data) {
    if (data.type === 'POS') {
      const targetP = state.isHost ? state.p2 : state.p1;
      targetP.x = data.x;
      targetP.y = data.y;
      targetP.dir = data.dir;
      targetP.frame = data.frame;
      targetP.moving = data.moving;
      targetP.heldItems = data.heldItems || [];
    } else if (data.type === 'ACTION') {
      const remotePlayer = state.isHost ? state.p2 : state.p1;
      handlePlayerAction(remotePlayer);
    } else if (data.type === 'SYNC_STATE' && !state.isHost) {
      state.timeRemaining = data.timeRemaining;
      state.coins = data.coins;
      state.servedCount = data.servedCount;
      state.currentLevelIndex = data.currentLevelIndex;

      data.tables.forEach((t, i) => { TABLES[i].customer = t.customer; });
      data.stations.forEach((s, i) => {
        STATIONS[i].busy = s.busy;
        STATIONS[i].progress = s.progress;
      });

      updateHUD();
    } else if (data.type === 'START_LEVEL') {
      startLevel(data.levelIndex, false);
    }
  }
};

// Input Handling
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  keys[e.key] = true;

  if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
    e.preventDefault();
    if (state.levelRunning && !state.isPaused) {
      const activeLocalPlayer = (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;
      handlePlayerAction(activeLocalPlayer);

      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'ACTION' });
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  keys[e.key] = false;
});

// Touch controls for mobile
function initTouchControls() {
  const dpadBtns = document.querySelectorAll('.t-btn');
  dpadBtns.forEach(btn => {
    const k = btn.getAttribute('data-key');
    const start = (e) => { e.preventDefault(); keys[k] = true; };
    const end = (e) => { e.preventDefault(); keys[k] = false; };
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', end);
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
  });

  const actBtn = document.querySelector('.t-action-btn');
  if (actBtn) {
    actBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.levelRunning && !state.isPaused) {
        const activeLocalPlayer = (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;
        handlePlayerAction(activeLocalPlayer);
        if (state.mode === 'online' && Net.conn) {
          Net.send({ type: 'ACTION' });
        }
      }
    });
  }
}

// Visual Floating Text & Sparkles
function spawnFloatingText(text, x, y, color = '#ffcc00') {
  state.floatingTexts.push({ text, x, y, vy: -1.2, alpha: 1, color });
}

function spawnSparks(x, y, count = 12, col = '#00ff88') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1 + Math.random() * 3;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      radius: 2 + Math.random() * 3,
      alpha: 1,
      color: col
    });
  }
}

// Movement
function updatePlayers() {
  const isGuestOnline = (state.mode === 'online' && !state.isHost);
  const activePlayer = isGuestOnline ? state.p2 : state.p1;

  let dx = 0, dy = 0;
  if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

  movePlayer(activePlayer, dx, dy);

  // Broadcast position over Net if online
  if (state.mode === 'online' && Net.conn && state.tick % 3 === 0) {
    Net.send({
      type: 'POS',
      x: activePlayer.x,
      y: activePlayer.y,
      dir: activePlayer.dir,
      frame: activePlayer.frame,
      moving: activePlayer.moving,
      heldItems: activePlayer.heldItems
    });
  }
}

function movePlayer(p, dx, dy) {
  p.moving = (dx !== 0 || dy !== 0);
  if (dx !== 0 && dy !== 0) {
    dx *= 0.7071;
    dy *= 0.7071;
  }

  if (dx < 0) p.dir = 'left';
  else if (dx > 0) p.dir = 'right';
  else if (dy < 0) p.dir = 'up';
  else if (dy > 0) p.dir = 'down';

  const nextX = p.x + dx * p.speed;
  const nextY = p.y + dy * p.speed;

  const minX = 70, maxX = 890, minY = 160, maxY = 480;
  const collidesTable = (tx, ty) => TABLES.some(tbl => Math.hypot(tx - tbl.x, ty - tbl.y) < 36);

  if (nextX >= minX && nextX <= maxX && !collidesTable(nextX, p.y)) p.x = nextX;
  if (nextY >= minY && nextY <= maxY && !collidesTable(p.x, nextY)) p.y = nextY;

  if (p.moving) p.frame++;
  else p.frame = 0;
}

// Action Handler (Machine cooking, Pick up up to 3 items, Serving combos, Trash)
function handlePlayerAction(player) {
  // 1. Station Interaction
  const nearStation = STATIONS.find(s => Math.hypot(player.x - s.x, player.y - s.y) < 48);

  if (nearStation) {
    // Trash Can
    if (nearStation.id === 'trash') {
      if (player.heldItems.length > 0) {
        sounds.playBoxPop();
        spawnFloatingText('تم تفريغ يديك! 🗑️', nearStation.x, nearStation.y - 15, '#ff4444');
        player.heldItems = [];
        updateInventoryHUD();
      } else {
        spawnFloatingText('يدك فاضية أصلاً!', nearStation.x, nearStation.y - 15, '#999');
      }
      return;
    }

    // Cooking Machines:
    // Case A: Machine is NOT running -> START IT! (Even if holding items!)
    if (!nearStation.busy) {
      nearStation.busy = true;
      nearStation.progress = 0;
      sounds.playBubbles();
      spawnSparks(nearStation.x, nearStation.y - 10, 8, '#00ff88');
      spawnFloatingText('بدأ التحضير! ⏳', nearStation.x, nearStation.y - 20, '#00ff88');
      return;
    }

    // Case B: Machine is FINISHED cooking -> Pick up if hands have space (< 3)
    if (nearStation.busy && nearStation.progress >= nearStation.cookTime) {
      if (player.heldItems.length < 3) {
        player.heldItems.push(nearStation.item);
        nearStation.busy = false;
        nearStation.progress = 0;
        sounds.playInteract();

        const name = ITEM_NAMES[nearStation.item] || 'طلب';
        spawnFloatingText(`أخذتِ ${name} (${player.heldItems.length}/3)`, nearStation.x, nearStation.y - 20, '#00ff88');
        updateInventoryHUD();
      } else {
        // Hands full (3/3)
        sounds.playBoxPop();
        spawnFloatingText('يدك مليانة! (3/3) سلمي الطلبات أول ⚠️', nearStation.x, nearStation.y - 20, '#ffcc00');
      }
      return;
    }

    // Case C: Machine is still in progress
    if (nearStation.busy && nearStation.progress < nearStation.cookTime) {
      spawnFloatingText('لسه ما جهز! ⏳', nearStation.x, nearStation.y - 20, '#ffcc00');
      return;
    }
  }

  // 2. Table Interaction (Serve items from hands to customer)
  const nearTable = TABLES.find(t => Math.hypot(player.x - t.x, player.y - t.y) < 54);

  if (nearTable && nearTable.customer) {
    if (player.heldItems.length === 0) {
      spawnFloatingText('يدك فاضية! جيبي الطلب أول', nearTable.x, nearTable.y - 35, '#aaa');
      return;
    }

    const cust = nearTable.customer;
    let deliveredAny = false;

    // Check all held items (from hands) to deliver any matching needed items
    for (let i = player.heldItems.length - 1; i >= 0; i--) {
      const item = player.heldItems[i];
      const neededIndex = cust.orderItems.findIndex(needed => needed === item && !cust.deliveredItems.includes(needed));

      if (neededIndex !== -1) {
        cust.deliveredItems.push(item);
        player.heldItems.splice(i, 1);
        deliveredAny = true;
      }
    }

    if (deliveredAny) {
      sounds.playInteract();
      spawnSparks(nearTable.x, nearTable.y - 15, 12, '#00e5ff');
      updateInventoryHUD();

      // Check if entire combo is now fulfilled
      if (cust.deliveredItems.length === cust.orderItems.length) {
        sounds.playCelebrationFanfare();
        state.servedCount++;
        const baseReward = cust.orderItems.length * 40;
        let tip = (cust.patience / cust.maxPatience > 0.4) ? 30 : 0;
        state.coins += (baseReward + tip);

        spawnFloatingText(`+${baseReward + tip} 🪙 وجبة كاملة! كفو`, nearTable.x, nearTable.y - 45, '#ffd700');
        spawnSparks(nearTable.x, nearTable.y - 20, 25, '#39ff14');

        nearTable.customer = null;
        updateHUD();
        checkWinCondition();
      } else {
        const remaining = cust.orderItems.length - cust.deliveredItems.length;
        // Give customer a patience refill bonus since they received part of their food!
        cust.patience = Math.min(cust.maxPatience, cust.patience + 900);
        spawnFloatingText(`سلمتِ جزء! باقي ${remaining} ✓`, nearTable.x, nearTable.y - 35, '#00ff88');
      }
    } else {
      sounds.playBoxPop();
      spawnFloatingText('الزبون مو طالب هالشي! ❌', nearTable.x, nearTable.y - 40, '#ff4444');
    }
  }
}

// Update HUD for player inventory text
function updateInventoryHUD() {
  const activeLocalPlayer = (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;
  const items = activeLocalPlayer.heldItems;
  const invElem = document.getElementById('hud-inventory-text');
  if (!invElem) return;

  if (items.length === 0) {
    invElem.innerText = 'فاضية (0/3)';
    invElem.style.color = '#98a5b8';
  } else {
    const names = items.map(k => ITEM_NAMES[k] || k).join(' + ');
    invElem.innerText = `${names} (${items.length}/3)`;
    invElem.style.color = (items.length >= 3) ? '#ffd700' : '#00ff88';
  }
}

// Customer Management & Progressive Combos
function updateCustomers() {
  if (!state.isHost) return;

  // Progress stations
  STATIONS.forEach(s => {
    if (s.busy && s.progress < s.cookTime) {
      s.progress++;
      if (s.progress >= s.cookTime) sounds.playInteract();
    }
  });

  // Spawn new customer
  state.spawnCooldown--;
  const currentLvl = LEVELS[state.currentLevelIndex];

  if (state.spawnCooldown <= 0) {
    state.spawnCooldown = currentLvl.customerDelay;

    const freeTables = TABLES.filter(t => t.customer === null);
    if (freeTables.length > 0) {
      const chosenTable = freeTables[Math.floor(Math.random() * freeTables.length)];
      const randomType = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];

      const combo = [];
      const availableMenu = [...currentLvl.menu];

      for (let i = 0; i < currentLvl.comboSize; i++) {
        if (availableMenu.length > 0) {
          const randIdx = Math.floor(Math.random() * availableMenu.length);
          combo.push(availableMenu.splice(randIdx, 1)[0]);
        }
      }

      // Much more relaxed, generous patience: ~60 to 90+ seconds!
      const maxP = 3200 + currentLvl.comboSize * 900;
      chosenTable.customer = {
        type: randomType,
        orderItems: combo,
        deliveredItems: [],
        patience: maxP,
        maxPatience: maxP
      };

      sounds.playInteract();
      spawnSparks(chosenTable.x, chosenTable.y, 10, '#00e5ff');
    }
  }

  // Update customer patience
  TABLES.forEach(tbl => {
    if (tbl.customer) {
      tbl.customer.patience--;
      if (tbl.customer.patience <= 0) {
        sounds.playBoxPop();
        spawnFloatingText('الزبون طفش ومشى! 💨', tbl.x, tbl.y - 40, '#ff3333');
        tbl.customer = null;
      }
    }
  });

  // Broadcast state to guest every 6 ticks
  if (state.mode === 'online' && Net.conn && state.tick % 6 === 0) {
    Net.send({
      type: 'SYNC_STATE',
      timeRemaining: state.timeRemaining,
      coins: state.coins,
      servedCount: state.servedCount,
      currentLevelIndex: state.currentLevelIndex,
      tables: TABLES.map(t => ({ customer: t.customer })),
      stations: STATIONS.map(s => ({ busy: s.busy, progress: s.progress }))
    });
  }
}

// Particle & Text FX
function updateEffects() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    if (p.alpha <= 0) state.particles.splice(i, 1);
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const t = state.floatingTexts[i];
    t.y += t.vy;
    t.alpha -= 0.015;
    if (t.alpha <= 0) state.floatingTexts.splice(i, 1);
  }
}

// Level Control
function checkWinCondition() {
  const currentLvl = LEVELS[state.currentLevelIndex];
  if (state.servedCount >= currentLvl.target) {
    endLevel(true);
  }
}

function startLevel(index, notifyRemote = true) {
  state.currentLevelIndex = index;
  const lvl = LEVELS[index];

  state.levelRunning = true;
  state.isPaused = false;
  state.timeRemaining = lvl.time;
  state.servedCount = 0;
  state.spawnCooldown = 50;
  state.particles = [];
  state.floatingTexts = [];

  TABLES.forEach(t => t.customer = null);
  STATIONS.forEach(s => { s.busy = false; s.progress = 0; });
  state.p1.heldItems = [];
  state.p2.heldItems = [];

  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));

  sounds.init();
  sounds.startBGM();

  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (!state.isPaused && state.levelRunning) {
      if (state.isHost) {
        state.timeRemaining--;
        updateHUD();
        if (state.timeRemaining <= 0) endLevel(false);
      }
    }
  }, 1000);

  updateHUD();
  updateInventoryHUD();

  if (notifyRemote && state.mode === 'online' && Net.conn) {
    Net.send({ type: 'START_LEVEL', levelIndex: index });
  }
}

function endLevel(won) {
  state.levelRunning = false;
  if (state.timerInterval) clearInterval(state.timerInterval);

  if (won) {
    sounds.playCelebrationFanfare();
    if (state.currentLevelIndex === 3) {
      document.getElementById('birthday-bash-modal').classList.remove('hidden');
    } else {
      const modal = document.getElementById('level-win-modal');
      document.getElementById('win-coins').innerText = `${state.coins} 🪙`;
      modal.classList.remove('hidden');
    }
  } else {
    sounds.playBoxPop();
    document.getElementById('level-fail-modal').classList.remove('hidden');
  }
}

function updateHUD() {
  const lvl = LEVELS[state.currentLevelIndex];
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  document.getElementById('hud-timer').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  document.getElementById('hud-level-title').innerText = `المرحلة ${lvl.id}`;
  document.getElementById('hud-coins').innerText = `${state.coins}`;
  document.getElementById('target-count').innerText = `${state.servedCount} / ${lvl.target} وجبات`;
}

// Render Loop
function render() {
  state.tick++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Cafe Environment
  Sprites.drawEnvironment(ctx, canvas.width, canvas.height, state.tick);

  // 2. Stations
  STATIONS.forEach(station => Sprites.drawStation(ctx, station, state.tick));

  // 3. Tables & Customers
  TABLES.forEach(table => {
    Sprites.drawDiningTable(ctx, table, state.tick);

    if (table.customer) {
      Sprites.drawCustomer(ctx, table.x, table.y - 12, table.customer.type, state.tick);
      const pct = table.customer.patience / table.customer.maxPatience;
      Sprites.drawComboOrderBubble(ctx, table.x, table.y - 12, table.customer.orderItems, table.customer.deliveredItems, pct);
    }
  });

  // 4. Draw Hiro & Danny (With up to 3 held items rendered above heads!)
  if (state.mode === 'online') {
    Sprites.drawHiro(ctx, state.p1.x, state.p1.y, state.p1.frame, state.p1.dir, state.p1.heldItems, !state.isHost);
    Sprites.drawDanny(ctx, state.p2.x, state.p2.y, state.p2.frame, state.p2.dir, state.p2.heldItems, state.isHost);
  } else {
    Sprites.drawHiro(ctx, state.p1.x, state.p1.y, state.p1.frame, state.p1.dir, state.p1.heldItems, false);
  }

  // 5. Particles & Texts
  state.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  state.floatingTexts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.alpha);
    ctx.fillStyle = t.color;
    ctx.font = 'bold 15px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });

  // Updates
  if (state.levelRunning && !state.isPaused) {
    updatePlayers();
    updateCustomers();
    updateEffects();
  }

  requestAnimationFrame(render);
}

// UI Setup & Event Listeners
function setupUI() {
  initTouchControls();
  Net.init();

  // Populate Levels
  const grid = document.getElementById('levels-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lvl, idx) => {
    const card = document.createElement('div');
    card.className = `level-card ${idx === 0 ? 'selected' : ''}`;
    card.dataset.index = idx;
    card.innerHTML = `
      <div class="lvl-num">LVL ${lvl.id}</div>
      <div class="lvl-name">${lvl.title.split(':')[1] || lvl.title}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.currentLevelIndex = idx;
    });
    grid.appendChild(card);
  });

  // Mode Selection Tabs (Solo vs Online)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;

      const onlinePanel = document.getElementById('online-lobby-panel');
      if (state.mode === 'online') {
        onlinePanel.classList.remove('hidden');
      } else {
        onlinePanel.classList.add('hidden');
      }
    });
  });

  // Online Host / Join Subtabs
  const tabHost = document.getElementById('tab-host');
  const tabJoin = document.getElementById('tab-join');
  const hostView = document.getElementById('host-view');
  const joinView = document.getElementById('join-view');

  tabHost.addEventListener('click', () => {
    tabHost.classList.add('active');
    tabJoin.classList.remove('active');
    hostView.classList.remove('hidden');
    joinView.classList.add('hidden');
  });

  tabJoin.addEventListener('click', () => {
    tabJoin.classList.add('active');
    tabHost.classList.remove('active');
    joinView.classList.remove('hidden');
    hostView.classList.add('hidden');
  });

  // Copy Room Code Button
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    navigator.clipboard.writeText(Net.myCode);
    const btn = document.getElementById('btn-copy-code');
    btn.innerText = 'تم النسخ! ✓';
    setTimeout(() => { btn.innerText = 'نسخ الكود 📋'; }, 2000);
  });

  // Join Room by Code Button
  document.getElementById('btn-join-room').addEventListener('click', () => {
    const code = document.getElementById('input-room-code').value;
    if (code) {
      Net.connectTo(code);
    }
  });

  // Tutorial / Instructions Modal Triggers
  const tutorialModal = document.getElementById('tutorial-modal');
  const openTutorial = (e) => {
    if (e) e.stopPropagation();
    tutorialModal.classList.remove('hidden');
  };
  const closeTutorial = (e) => {
    if (e) e.stopPropagation();
    tutorialModal.classList.add('hidden');
  };

  document.getElementById('btn-show-instructions').addEventListener('click', openTutorial);
  document.getElementById('btn-how-to-play').addEventListener('click', openTutorial);
  document.getElementById('btn-close-tutorial').addEventListener('click', closeTutorial);
  document.getElementById('btn-close-tut-x').addEventListener('click', closeTutorial);

  // Play button on menu
  document.getElementById('btn-play-game').addEventListener('click', () => {
    startLevel(state.currentLevelIndex);
  });

  // Next level button
  document.getElementById('btn-next-level').addEventListener('click', () => {
    if (state.currentLevelIndex + 1 < LEVELS.length) {
      startLevel(state.currentLevelIndex + 1);
    } else {
      startLevel(0);
    }
  });

  document.getElementById('btn-retry-level').addEventListener('click', () => {
    startLevel(state.currentLevelIndex);
  });

  // Menu navigation
  const showMenu = () => {
    state.levelRunning = false;
    if (state.timerInterval) clearInterval(state.timerInterval);
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    document.getElementById('menu-overlay').classList.remove('hidden');
  };

  document.getElementById('btn-levels-menu').addEventListener('click', showMenu);
  document.getElementById('btn-menu-back').addEventListener('click', showMenu);
  document.getElementById('btn-menu-back-fail').addEventListener('click', showMenu);
  document.getElementById('btn-replay-all').addEventListener('click', showMenu);
  document.getElementById('btn-restart-level').addEventListener('click', () => {
    startLevel(state.currentLevelIndex);
  });

  // Audio & Pause toggles
  const btnSound = document.getElementById('btn-sound');
  btnSound.addEventListener('click', () => {
    const unmuted = sounds.toggleMute();
    btnSound.innerText = unmuted ? '🔊' : '🔇';
  });

  const btnPause = document.getElementById('btn-pause');
  btnPause.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    btnPause.innerText = state.isPaused ? '▶️' : '⏸️';
  });
}

window.addEventListener('load', () => {
  setupUI();
  requestAnimationFrame(render);
});
