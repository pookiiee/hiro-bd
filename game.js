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
  { id: 'cupcakeOven', name: 'فرن الكيك 🎂', item: 'cupcake', x: 730, y: 130, cookTime: 85, busy: false, progress: 0 },
  { id: 'trash', name: 'سلة الزبالة 🗑️', item: null, x: 130, y: 130, cookTime: 0, busy: false, progress: 0 }
];

// Playable Characters Registry (Danny Phantom Universe Only)
const CHARACTERS = [
  { id: 'danny', name: 'داني الشبح' },
  { id: 'dannyHuman', name: 'داني فنتون' },
  { id: 'sam', name: 'سام مانسون' },
  { id: 'tucker', name: 'تاكر فولي' },
  { id: 'jazz', name: 'جاز فنتون' },
  { id: 'vlad', name: 'فلاد بلاسما' },
  { id: 'skulker', name: 'سكلكر' },
  { id: 'ember', name: 'إمبر مكلين' },
  { id: 'box', name: 'شبح الصناديق' }
];

// Dining Tables
const TABLES = [
  { id: 1, x: 240, y: 260, customer: null },
  { id: 2, x: 480, y: 260, customer: null },
  { id: 3, x: 720, y: 260, customer: null },
  { id: 4, x: 360, y: 400, customer: null },
  { id: 5, x: 600, y: 400, customer: null }
];

const CUSTOMER_TYPES = ['danny', 'dannyHuman', 'sam', 'tucker', 'jazz', 'vlad', 'skulker', 'ember', 'box'];

// Core Game State
const state = {
  scene: 'cafe', // 'cafe' or 'party'
  mode: 'solo', // 'solo' or 'online'
  isHost: true,
  onlineConnected: false,
  maxUnlockedLevel: parseInt(localStorage.getItem('hiro_max_unlocked_level') || '0', 10),
  partyUnlocked: (localStorage.getItem('hiro_party_unlocked') === 'true'),
  currentLevelIndex: 0,
  levelRunning: false,
  isPaused: false,
  timeRemaining: 90,
  timerInterval: null,
  tick: 0,
  coins: 0,
  servedCount: 0,

  localPlayerName: localStorage.getItem('hiro_player_name') || 'هيرو',

  // Player 1 (Host / Solo Player)
  p1: {
    name: localStorage.getItem('hiro_player_name') || 'هيرو',
    charId: 'danny',
    x: 420,
    y: 200,
    speed: 3.5,
    dir: 'down',
    frame: 0,
    moving: false,
    dancing: false,
    heldItems: [] // Capacity up to 3 items!
  },

  // Player 2 (Online Guest / Partner)
  p2: {
    name: 'لاعب 2',
    charId: 'sam',
    x: 540,
    y: 200,
    speed: 3.5,
    dir: 'down',
    frame: 0,
    moving: false,
    dancing: false,
    heldItems: [] // Capacity up to 3 items!
  },

  spawnCooldown: 60,
  particles: [],
  floatingTexts: []
};

// Birthday Party Celebration Hall State (Cat Gifts with Meow Sound & Unique Breeds!)
const partyState = {
  candlesLit: true,
  partyLights: true,
  cake: { x: 480, y: 220, radius: 45 },
  danceFloor: { x: 480, y: 350, width: 280, height: 130 },
  gifts: [
    {
      id: 1,
      x: 190,
      y: 360,
      color: '#00ff88',
      ribbon: '#ffd700',
      opened: false,
      catType: 'ghostWhite',
      catName: 'شبحونة (القطة البيضاء)',
      catBreed: 'أنغورا شبحية ناصعة البياض بعيون خضراء زمردية',
      item: '🤍🐱',
      pitch: 1.25,
      title: 'قطة شبحونة البيضاء 🐾',
      msg: 'ميااااو~ 🤍 قطة بيضاء شبحية كيوت عيونها خضراء زمردية مضيئة! تحب اللعب والاختفاء، وتهدي هيرو أدفأ وألطف مياو بعيد ميلادها!'
    },
    {
      id: 2,
      x: 290,
      y: 440,
      color: '#00e5ff',
      ribbon: '#ffffff',
      opened: false,
      catType: 'marmalade',
      catName: 'مشمش (القطة المشمشية)',
      catBreed: 'شيرازية مشمشية مخططة بعيون عنبرية ذهبية',
      item: '🧡🐱',
      pitch: 1.0,
      title: 'قطة مشمش المشمشية 🐾',
      msg: 'ميااااو~ 🧡 قطة برتقالية مشمشية مخططة مليانة شقاوة وحنان، دخلت الحفلة فرحانة عشان تاكل كيكة وتلعب مع هيرو وتفرّح قلبها!'
    },
    {
      id: 3,
      x: 670,
      y: 440,
      color: '#ffd700',
      ribbon: '#00e5ff',
      opened: false,
      catType: 'midnightGoth',
      catName: 'لونا (قطة الليل الفخمة)',
      catBreed: 'بومباي سوداء قوثك حريرية بعيون ذهبية براقة',
      item: '🖤🐱',
      pitch: 0.85,
      title: 'قطة لونا الليلية 🐾',
      msg: 'ميااااو~ 🖤 قطة سوداء حريرية فخمة تشبه شخصيات داني الشبح، لابسة طوق بنفسجي وجاية تحرس سعادة هيرو وتتمنى لها سنة ولا أحلى!'
    },
    {
      id: 4,
      x: 770,
      y: 360,
      color: '#4c2675',
      ribbon: '#39ff14',
      opened: false,
      catType: 'silverSiamese',
      catName: 'سكر (القطة الفضية السيامية)',
      catBreed: 'سيامية رشيقة بفرو فضي وعيون سماوية',
      item: '🩶🐱',
      pitch: 1.15,
      title: 'قطة سكر الفضية 🐾',
      msg: 'ميااااو~ 🩶 قطة رمادية فضية دلوعة بعيون زرقاء سماوية ساحرة، تتمنى لهيرو أسعد وأحلى عيد ميلاد بالعالم!'
    }
  ],
  confettiCannons: [
    { x: 120, y: 220 },
    { x: 840, y: 220 }
  ],
  djBooth: { x: 840, y: 430 }
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
        state.p1.name = state.localPlayerName;
        if (state.selectedCharId) state.p1.charId = state.selectedCharId;
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
      state.p2.name = state.localPlayerName;
      if (state.selectedCharId) state.p2.charId = state.selectedCharId;

      this.conn.on('open', () => {
        statusElem.innerText = 'تم الدخول بنجاح! 🟢 مرحباً بكِ في الكافيه!';
        state.isHost = false;
        state.p2.name = state.localPlayerName;
        if (state.selectedCharId) state.p2.charId = state.selectedCharId;
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

    // Send custom player name and character immediately upon connection
    const sendIntro = () => {
      const myLocalP = (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;
      myLocalP.name = state.localPlayerName;
      this.send({
        type: 'PLAYER_INTRO',
        name: state.localPlayerName,
        charId: myLocalP.charId
      });
    };
    sendIntro();
    setTimeout(sendIntro, 350);
    setTimeout(sendIntro, 1000);

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
      if (data.charId) targetP.charId = data.charId;
      if (data.name) targetP.name = data.name;
      if (typeof data.dancing !== 'undefined') targetP.dancing = data.dancing;
    } else if (data.type === 'PLAYER_INTRO' || data.type === 'NAME_CHANGE') {
      const targetP = state.isHost ? state.p2 : state.p1;
      if (data.name) targetP.name = data.name;
      if (data.charId) targetP.charId = data.charId;
      if (!data.isReply) {
        const myLocalP = (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;
        this.send({
          type: 'PLAYER_INTRO',
          name: state.localPlayerName,
          charId: myLocalP.charId,
          isReply: true
        });
      }
    } else if (data.type === 'CHAR_CHANGE') {
      const targetP = state.isHost ? state.p2 : state.p1;
      if (data.charId) targetP.charId = data.charId;
      if (data.name) targetP.name = data.name;
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
    } else if (data.type === 'ENTER_PARTY_ROOM') {
      state.partyUnlocked = true;
      localStorage.setItem('hiro_party_unlocked', 'true');
      updatePartyMenuButton();
      enterPartyRoom(false);
    } else if (data.type === 'PARTY_CANDLES') {
      partyState.candlesLit = data.lit;
      if (!data.lit) {
        sounds.playCandlesBlow();
        spawnSparks(partyState.cake.x, partyState.cake.y - 40, 30, '#ffd700');
        spawnFloatingText('💨 طفيتو الشموع سوا! كل عام وأنتِ بخير يا هيرو! 🎉', partyState.cake.x, partyState.cake.y - 70, '#00ff88');
      } else {
        sounds.playInteract();
        spawnFloatingText('🕯️ تم إشعال الشموع من جديد! تمنوا أمنية ثانية ✨', partyState.cake.x, partyState.cake.y - 70, '#ffd700');
      }
    } else if (data.type === 'PARTY_GIFT') {
      const g = partyState.gifts.find(x => x.id === data.giftId);
      if (g) {
        g.opened = true;
        sounds.playMeow(g.pitch);
        sounds.playBoxPop();
        spawnSparks(g.x, g.y, 25, g.color);
        spawnFloatingText('🐾 مياااو!', g.x, g.y - 45, g.color);
      }
    } else if (data.type === 'PARTY_DANCE') {
      const targetP = state.isHost ? state.p2 : state.p1;
      targetP.dancing = data.dancing;
    } else if (data.type === 'PARTY_LIGHTS') {
      partyState.partyLights = data.lights;
      sounds.playInteract();
      spawnFloatingText(data.lights ? '💡 الإضاءة مشعلة!' : '🌙 إضاءة خافتة!', 840, 390, '#00e5ff');
    } else if (data.type === 'PARTY_CONFETTI') {
      triggerPartyConfetti(data.x, data.y, false);
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
      dancing: activePlayer.dancing,
      heldItems: activePlayer.heldItems,
      charId: activePlayer.charId,
      name: activePlayer.name
    });
  }
}

function movePlayer(p, dx, dy) {
  p.moving = (dx !== 0 || dy !== 0);
  if (p.moving) {
    p.dancing = false; // Moving stops dance
  }
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

  const minX = 70, maxX = 890, minY = 160, maxY = (state.scene === 'party') ? 500 : 480;

  const collidesObstacle = (tx, ty) => {
    if (state.scene === 'party') {
      if (Math.hypot(tx - partyState.cake.x, ty - partyState.cake.y) < 42) return true;
      if (Math.hypot(tx - partyState.djBooth.x, ty - partyState.djBooth.y) < 36) return true;
      return false;
    }
    return TABLES.some(tbl => Math.hypot(tx - tbl.x, ty - tbl.y) < 36);
  };

  if (nextX >= minX && nextX <= maxX && !collidesObstacle(nextX, p.y)) p.x = nextX;
  if (nextY >= minY && nextY <= maxY && !collidesObstacle(p.x, nextY)) p.y = nextY;

  if (p.moving) p.frame++;
  else if (!p.dancing) p.frame = 0;
  else p.frame++;
}

// Action Handler (Machine cooking, Pick up up to 3 items, Serving combos, Trash, Party Room interactions)
function handlePlayerAction(player) {
  // If in Party Room Mode
  if (state.scene === 'party') {
    // A. Cake & Blow Candles
    if (Math.hypot(player.x - partyState.cake.x, player.y - partyState.cake.y) < 70) {
      if (partyState.candlesLit) {
        partyState.candlesLit = false;
        sounds.playCandlesBlow();
        spawnSparks(partyState.cake.x, partyState.cake.y - 45, 35, '#ffd700');
        spawnFloatingText('💨 ففففف! طفيتي الشموع! كل عام وأنتِ بخير يا هيرو! 🎉', partyState.cake.x, partyState.cake.y - 75, '#00ff88');
        triggerPartyConfetti(partyState.cake.x, partyState.cake.y, true);
      } else {
        partyState.candlesLit = true;
        sounds.playInteract();
        spawnFloatingText('🕯️ تم إشعال الشموع من جديد! تمنوا أمنية ثانية ✨', partyState.cake.x, partyState.cake.y - 75, '#ffd700');
      }
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_CANDLES', lit: partyState.candlesLit });
      }
      return;
    }

    // B. Cat Gifts (Instant meow sound & cute cat appearance, no text modals!)
    const nearGift = partyState.gifts.find(g => Math.hypot(player.x - g.x, player.y - g.y) < 55);
    if (nearGift) {
      const wasOpened = nearGift.opened;
      nearGift.opened = true;
      sounds.playMeow(nearGift.pitch || 1.0);
      sounds.playBoxPop();
      if (!wasOpened) {
        triggerPartyConfetti(nearGift.x, nearGift.y, false);
      }
      spawnFloatingText('🐾 مياااو!', nearGift.x, nearGift.y - 45, nearGift.color);
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_GIFT', giftId: nearGift.id });
      }
      return;
    }

    // C. Confetti Cannon
    const nearCannon = partyState.confettiCannons.find(c => Math.hypot(player.x - c.x, player.y - c.y) < 58);
    if (nearCannon) {
      triggerPartyConfetti(nearCannon.x, nearCannon.y, true);
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_CONFETTI', x: nearCannon.x, y: nearCannon.y });
      }
      return;
    }

    // D. DJ Booth & Lights
    if (Math.hypot(player.x - partyState.djBooth.x, player.y - partyState.djBooth.y) < 60) {
      partyState.partyLights = !partyState.partyLights;
      sounds.playInteract();
      spawnFloatingText(partyState.partyLights ? '💡 الإضاءة مشعلة!' : '🌙 إضاءة الحفلة خافتة!', 840, 390, '#00e5ff');
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_LIGHTS', lights: partyState.partyLights });
      }
      return;
    }

    // E. On Dance floor / room: Toggle Dance!
    toggleDance(player);
    return;
  }
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
      // Wrong item delivered: Customer takes it and deducts points!
      const wrongItem = player.heldItems.pop(); // Takes the wrong item from hand
      sounds.playBoxPop();
      updateInventoryHUD();

      const penalty = 25;
      state.coins = Math.max(0, state.coins - penalty);
      updateHUD();

      // Customer loses patience when receiving wrong food
      cust.patience -= 450;
      spawnFloatingText(`-${penalty} 🪙 طلب غلط!`, nearTable.x, nearTable.y - 45, '#ff3333');
      spawnSparks(nearTable.x, nearTable.y - 20, 15, '#ff3333');

      if (cust.patience <= 0) {
        spawnFloatingText('الزبون مشى زعلان! 💨', nearTable.x, nearTable.y - 40, '#ff3333');
        nearTable.customer = null;
      }
    }
  }
}

// Update HUD for player inventory text (Visible both on character, bottom bar, and top screen pill)
function updateInventoryHUD() {
  const activeLocalPlayer = (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;
  const items = activeLocalPlayer.heldItems;

  const itemData = {
    burger: { emoji: '🍔', name: 'برجر' },
    shake: { emoji: '🥤', name: 'عصير' },
    fries: { emoji: '🍟', name: 'بطاطس' },
    tea: { emoji: '🍵', name: 'شاي' },
    cupcake: { emoji: '🎂', name: 'كيكة' }
  };

  // 1. Bottom footer text
  const invElem = document.getElementById('hud-inventory-text');
  if (invElem) {
    if (items.length === 0) {
      invElem.innerText = 'فاضية (0/3)';
      invElem.style.color = '#98a5b8';
    } else {
      const names = items.map(k => (itemData[k] ? `${itemData[k].emoji} ${itemData[k].name}` : k)).join(' + ');
      invElem.innerText = `${names} (${items.length}/3)`;
      invElem.style.color = (items.length >= 3) ? '#ffd700' : '#00ff88';
    }
  }

  // 2. Floating on-screen Pill (Always visible right on canvas/screen)
  const chipsContainer = document.getElementById('floating-items-chips');
  const capBadge = document.getElementById('inv-capacity-badge');
  const pill = document.getElementById('floating-inventory-pill');

  if (chipsContainer && capBadge) {
    capBadge.innerText = `(${items.length}/3)`;
    if (items.length >= 3) {
      capBadge.className = 'inv-cap-badge full';
      capBadge.innerText = '(3/3 ممتلئة)';
    } else {
      capBadge.className = 'inv-cap-badge';
    }

    if (items.length === 0) {
      chipsContainer.innerHTML = '<span class="empty-chip">يدك فاضية</span>';
      if (pill) pill.classList.remove('has-items');
    } else {
      if (pill) pill.classList.add('has-items');
      chipsContainer.innerHTML = items.map(k => {
        const info = itemData[k] || { emoji: '📦', name: k };
        return `<span class="held-chip ${k}"><span class="chip-icon">${info.emoji}</span><span class="chip-text">${info.name}</span></span>`;
      }).join('');
    }
  }

  // 3. Mobile touch action button text
  const touchActionBtn = document.querySelector('.t-action-btn span:nth-child(2)');
  if (touchActionBtn) {
    if (items.length === 0) {
      touchActionBtn.innerText = 'تشغيل / أخذ';
    } else if (items.length < 3) {
      const last = items[items.length - 1];
      const emoji = (itemData[last] && itemData[last].emoji) || '🍽️';
      touchActionBtn.innerText = `تقديم ${emoji} / تشغيل`;
    } else {
      touchActionBtn.innerText = 'تقديم الطلبات 🍽️';
    }
  }
}

// Customer Management & Progressive Combos
function updateCustomers() {
  if (!state.isHost) return;

  // Progress stations
  STATIONS.forEach(s => {
    if (s.busy && s.progress < s.cookTime) {
      s.progress++;
      if (s.progress >= s.cookTime) {
        sounds.playInteract();
        spawnSparks(s.x, s.y - 40, 16, '#00ff88');
        spawnFloatingText('جاهز! ✨', s.x, s.y - 55, '#00ff88');
      }
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
      const freeCustTypes = CUSTOMER_TYPES.filter(t => t !== state.p1.charId && t !== state.p2.charId);
      const randomType = (freeCustTypes.length > 0) ? freeCustTypes[Math.floor(Math.random() * freeCustTypes.length)] : 'danny';

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
  state.scene = 'cafe';
  // Enforce sequential progression: Cannot play locked levels
  if (index > state.maxUnlockedLevel) {
    index = state.maxUnlockedLevel;
  }
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
  state.p1.dancing = false;
  state.p2.dancing = false;

  const partyHudActions = document.getElementById('party-hud-actions');
  const normalHudActions = document.querySelector('.footer-actions');
  if (partyHudActions) partyHudActions.classList.add('hidden');
  if (normalHudActions) normalHudActions.classList.remove('hidden');

  const touchDanceBtn = document.getElementById('btn-touch-dance');
  if (touchDanceBtn) touchDanceBtn.classList.add('hidden');

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

    // Sequential progression: Unlock next level if beaten current
    const nextLvlIndex = state.currentLevelIndex + 1;
    let unlockedNew = false;
    if (nextLvlIndex < LEVELS.length && nextLvlIndex > state.maxUnlockedLevel) {
      state.maxUnlockedLevel = nextLvlIndex;
      localStorage.setItem('hiro_max_unlocked_level', state.maxUnlockedLevel);
      unlockedNew = true;
    }
    renderLevelCards();

    // Finished all levels (Level 4 completed)!
    if (state.currentLevelIndex === 3) {
      state.partyUnlocked = true;
      localStorage.setItem('hiro_party_unlocked', 'true');
      updatePartyMenuButton();
      const modal = document.getElementById('birthday-bash-modal');
      const customText = document.getElementById('bday-modal-custom-text');
      if (customText) {
        if (state.mode === 'online') {
          customText.innerText = 'كفو عليكم يا بطلات! أبدعتوا وخلصتوا جميع المراحل سوا بتعاون أسطوري! 🏆 الحين حان وقت الحفلة والمفاجأة الكبرى!';
        } else {
          customText.innerText = 'كفو عليكِ يا هيرو! أبدعتِ وخلصتِ جميع مراحل الكافيه بجدارة! 🏆 الحين حان وقت الحفلة والمفاجأة الكبرى!';
        }
      }
      modal.classList.remove('hidden');
    } else {
      const modal = document.getElementById('level-win-modal');
      document.getElementById('win-coins').innerText = `${state.coins} 🪙`;

      const winNotice = document.getElementById('win-next-notice');
      if (winNotice) {
        if (unlockedNew) {
          winNotice.innerText = `🔓 كفو! تم فتح المرحلة ${nextLvlIndex + 1}!`;
          winNotice.classList.remove('hidden');
        } else {
          winNotice.classList.add('hidden');
        }
      }

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

// Party Room Management
function updatePartyMenuButton() {
  const btn = document.getElementById('btn-menu-party-room');
  if (!btn) return;
  if (state.partyUnlocked) {
    btn.classList.remove('locked');
    btn.innerText = '🎂 غرفة الاحتفال والرقص 🎉';
    btn.title = 'دخول غرفة الاحتفال والرقص!';
  } else {
    btn.classList.add('locked');
    btn.innerText = '🔒 غرفة الاحتفال (مقفلة)';
    btn.title = 'تفتح فقط بعد إكمال جميع المراحل الـ 4!';
  }
}

function enterPartyRoom(notifyRemote = true) {
  if (!state.partyUnlocked) {
    sounds.playBoxPop();
    showNotice('⚠️ غرفة الاحتفال مقفلة! لازم تخلصون كل المراحل الـ 4 أولاً عشان تفتح لكم الحفلة 🎂🎉');
    return;
  }
  state.scene = 'party';
  state.levelRunning = true;
  state.isPaused = false;
  if (state.timerInterval) clearInterval(state.timerInterval);

  // Close all modals
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));

  // Position players nicely in the Party Room
  state.p1.x = 430;
  state.p1.y = 350;
  state.p1.dancing = false;
  state.p1.heldItems = [];

  state.p2.x = 530;
  state.p2.y = 350;
  state.p2.dancing = false;
  state.p2.heldItems = [];

  // Reset party state
  partyState.candlesLit = true;
  partyState.partyLights = true;
  partyState.gifts.forEach(g => g.opened = false);

  updatePartyHUD();

  sounds.init();
  sounds.playCelebrationFanfare();
  sounds.startPartyBGM();

  spawnFloatingText('🎉 أهلاً بكم في حفلة ميلاد هيرو الأسطورية! 🎂', 480, 160, '#00ff88');
  triggerPartyConfetti(480, 220, false);
  triggerPartyConfetti(200, 200, false);
  triggerPartyConfetti(760, 200, false);

  if (notifyRemote && state.mode === 'online' && Net.conn) {
    Net.send({ type: 'ENTER_PARTY_ROOM' });
  }
}

function returnToCafe() {
  state.scene = 'cafe';
  state.levelRunning = false;
  if (state.timerInterval) clearInterval(state.timerInterval);
  sounds.stopBGM();

  const partyHudActions = document.getElementById('party-hud-actions');
  const normalHudActions = document.querySelector('.footer-actions');
  if (partyHudActions) partyHudActions.classList.add('hidden');
  if (normalHudActions) normalHudActions.classList.remove('hidden');

  const touchDanceBtn = document.getElementById('btn-touch-dance');
  if (touchDanceBtn) touchDanceBtn.classList.add('hidden');

  renderLevelCards();
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  document.getElementById('menu-overlay').classList.remove('hidden');
}

function toggleDance(player) {
  player.dancing = !player.dancing;
  if (player.dancing) {
    sounds.playInteract();
    spawnFloatingText('💃 يلا نرقص! 🎵', player.x, player.y - 35, '#00ff88');
    const notes = ['🎵', '🎶', '✨', '💚'];
    for (let i = 0; i < 5; i++) {
      spawnFloatingText(notes[i % notes.length], player.x + (Math.random() * 40 - 20), player.y - 45 - Math.random() * 20, '#ffd700');
    }
  } else {
    spawnFloatingText('وقفت الرقص ✋', player.x, player.y - 35, '#aaa');
  }
  if (state.mode === 'online' && Net.conn) {
    Net.send({ type: 'PARTY_DANCE', dancing: player.dancing });
  }
}

function triggerPartyConfetti(x, y, playSfx = true) {
  if (playSfx) sounds.playFirework();
  const partyColors = ['#00ff88', '#00e5ff', '#ffd700', '#39ff14', '#ffffff', '#9d4edd', '#64dfdf'];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 5;
    state.particles.push({
      x: x + (Math.random() * 20 - 10),
      y: y + (Math.random() * 20 - 10),
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 2,
      radius: 2 + Math.random() * 3.5,
      alpha: 1,
      color: partyColors[Math.floor(Math.random() * partyColors.length)]
    });
  }
}

function updatePartyHUD() {
  document.getElementById('hud-timer').innerText = '🎉 حفلة';
  document.getElementById('hud-level-title').innerText = 'قاعة الاحتفال 🎂';
  document.getElementById('hud-coins').innerText = '9999 🪙';
  document.getElementById('target-count').innerText = 'عيد ميلاد هيرو السعيد! 💚';

  // Floating inventory pill: change to dance prompt in party room
  const pill = document.getElementById('floating-inventory-pill');
  if (pill) {
    pill.classList.add('has-items');
    const capBadge = document.getElementById('inv-capacity-badge');
    const chipsContainer = document.getElementById('floating-items-chips');
    if (capBadge) capBadge.innerText = '💃';
    if (chipsContainer) {
      chipsContainer.innerHTML = '<span class="held-chip cupcake"><span class="chip-icon">🎂</span> ارقصي واحتفلي!</span>';
    }
  }

  // Update touch buttons
  const touchActionBtn = document.querySelector('.t-action-btn span:nth-child(2)');
  if (touchActionBtn) {
    touchActionBtn.innerText = 'تفاعل ⚡';
  }

  const touchDanceBtn = document.getElementById('btn-touch-dance');
  if (touchDanceBtn) {
    touchDanceBtn.classList.remove('hidden');
  }

  const partyHudActions = document.getElementById('party-hud-actions');
  const normalHudActions = document.querySelector('.footer-actions');
  if (partyHudActions) partyHudActions.classList.remove('hidden');
  if (normalHudActions) normalHudActions.classList.add('hidden');
}

// Render Loop
function render() {
  state.tick++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.scene === 'party') {
    // 1. Party Room Environment
    Sprites.drawPartyRoom(ctx, canvas.width, canvas.height, state.tick, partyState);

    // 2. Draw Characters (with custom names underneath in small font!)
    const p1Online = (state.mode === 'online' && !state.isHost);
    Sprites.drawCharacter(ctx, state.p1.x, state.p1.y, state.p1.charId || 'danny', state.p1.frame, state.p1.dir, state.p1.heldItems, p1Online, state.p1.name, state.p1.dancing);

    if (state.mode === 'online') {
      const p2Online = state.isHost;
      Sprites.drawCharacter(ctx, state.p2.x, state.p2.y, state.p2.charId || 'sam', state.p2.frame, state.p2.dir, state.p2.heldItems, p2Online, state.p2.name, state.p2.dancing);
    }
  } else {
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

    // 4. Draw Characters (with custom names underneath in small font!)
    const p1Online = (state.mode === 'online' && !state.isHost);
    Sprites.drawCharacter(ctx, state.p1.x, state.p1.y, state.p1.charId || 'danny', state.p1.frame, state.p1.dir, state.p1.heldItems, p1Online, state.p1.name, state.p1.dancing);

    if (state.mode === 'online') {
      const p2Online = state.isHost;
      Sprites.drawCharacter(ctx, state.p2.x, state.p2.y, state.p2.charId || 'sam', state.p2.frame, state.p2.dir, state.p2.heldItems, p2Online, state.p2.name, state.p2.dancing);
    }
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
    if (state.scene !== 'party') {
      updateCustomers();
    }
    updateEffects();
  }

  requestAnimationFrame(render);
}

// UI Setup & Event Listeners
function setupCharacterSelect() {
  const grid = document.getElementById('char-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CHARACTERS.forEach(char => {
    const card = document.createElement('div');
    card.className = `char-card ${char.id === state.p1.charId ? 'selected' : ''}`;
    card.dataset.id = char.id;

    const cvs = document.createElement('canvas');
    cvs.width = 44;
    cvs.height = 44;
    cvs.className = 'char-portrait-canvas';
    Sprites.renderPortrait(cvs, char.id);

    const nameEl = document.createElement('span');
    nameEl.className = 'char-card-name';
    nameEl.innerText = char.name;

    card.appendChild(cvs);
    card.appendChild(nameEl);

    card.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedCharId = char.id;
      state.p1.charId = char.id;
      if (state.mode === 'online' && !state.isHost) {
        state.p2.charId = char.id;
      }

      sounds.playInteract();

      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'CHAR_CHANGE', charId: char.id, name: state.localPlayerName });
      }
    });

    grid.appendChild(card);
  });
}

// Temporary toast feedback
function showNotice(msg) {
  let noticeEl = document.getElementById('game-toast-notice');
  if (!noticeEl) {
    noticeEl = document.createElement('div');
    noticeEl.id = 'game-toast-notice';
    noticeEl.className = 'game-toast-notice';
    document.body.appendChild(noticeEl);
  }
  noticeEl.innerText = msg;
  noticeEl.classList.remove('show');
  void noticeEl.offsetWidth; // trigger reflow
  noticeEl.classList.add('show');
  clearTimeout(window._noticeTimeout);
  window._noticeTimeout = setTimeout(() => {
    noticeEl.classList.remove('show');
  }, 2600);
}

// Sequential Level Progression Renderer
function renderLevelCards() {
  const grid = document.getElementById('levels-grid');
  if (!grid) return;
  grid.innerHTML = '';

  LEVELS.forEach((lvl, idx) => {
    const card = document.createElement('div');
    const isUnlocked = idx <= state.maxUnlockedLevel;
    const isSelected = idx === state.currentLevelIndex;

    card.className = `level-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
    card.dataset.index = idx;

    let statusHtml = '';
    if (!isUnlocked) {
      statusHtml = `<div class="lvl-status locked-tag">🔒 مقفلة</div>`;
    } else if (idx < state.maxUnlockedLevel) {
      statusHtml = `<div class="lvl-status done-tag">✓ مكتملة</div>`;
    } else {
      statusHtml = `<div class="lvl-status current-tag">▶ جاهزة للعب</div>`;
    }

    card.innerHTML = `
      <div class="lvl-num">LVL ${lvl.id}</div>
      <div class="lvl-name">${lvl.title.split(':')[1] || lvl.title}</div>
      ${statusHtml}
    `;

    card.addEventListener('click', () => {
      if (!isUnlocked) {
        sounds.playBoxPop();
        card.classList.add('shake-anim');
        setTimeout(() => card.classList.remove('shake-anim'), 400);
        showNotice(`⚠️ المرحلة ${lvl.id} مقفلة! لازم تختمين المرحلة ${lvl.id - 1} أولاً.`);
        return;
      }

      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.currentLevelIndex = idx;
      sounds.playInteract();
    });

    grid.appendChild(card);
  });
}

function setupUI() {
  initTouchControls();
  Net.init();
  setupCharacterSelect();
  renderLevelCards();

  // Player Name Input Setup (Appears under chosen character)
  const nameInput = document.getElementById('input-player-name');
  if (nameInput) {
    nameInput.value = state.localPlayerName;
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim() || 'لاعب';
      state.localPlayerName = val;
      localStorage.setItem('hiro_player_name', val);

      if (state.mode === 'online' && !state.isHost) {
        state.p2.name = val;
      } else {
        state.p1.name = val;
      }

      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'NAME_CHANGE', name: val });
      }
    });
  }

  // Dismiss rotate banner button
  const btnDismissRotate = document.getElementById('btn-dismiss-rotate');
  const rotateBanner = document.getElementById('mobile-rotate-banner');
  if (btnDismissRotate && rotateBanner) {
    btnDismissRotate.addEventListener('click', () => {
      rotateBanner.classList.add('hidden');
    });
  }

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
    updatePartyMenuButton();
    renderLevelCards();
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

  // Party Room Triggers & Event Listeners
  const btnEnterParty = document.getElementById('btn-enter-party');
  if (btnEnterParty) {
    btnEnterParty.addEventListener('click', () => {
      enterPartyRoom(true);
    });
  }

  const btnMenuParty = document.getElementById('btn-menu-party-room');
  if (btnMenuParty) {
    btnMenuParty.addEventListener('click', () => {
      enterPartyRoom(true);
    });
  }

  const getActiveLocalPlayer = () => (state.mode === 'online' && !state.isHost) ? state.p2 : state.p1;

  const btnPartyDanceFooter = document.getElementById('btn-party-dance-footer');
  if (btnPartyDanceFooter) {
    btnPartyDanceFooter.addEventListener('click', () => {
      toggleDance(getActiveLocalPlayer());
    });
  }

  const btnTouchDance = document.getElementById('btn-touch-dance');
  if (btnTouchDance) {
    btnTouchDance.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDance(getActiveLocalPlayer());
    });
  }

  const btnPartyCandle = document.getElementById('btn-party-candle-footer');
  if (btnPartyCandle) {
    btnPartyCandle.addEventListener('click', () => {
      partyState.candlesLit = !partyState.candlesLit;
      if (!partyState.candlesLit) {
        sounds.playCandlesBlow();
        triggerPartyConfetti(partyState.cake.x, partyState.cake.y, false);
        spawnFloatingText('💨 طفيتو الشموع! سنة حلوة يا هيرو! 🎉', partyState.cake.x, partyState.cake.y - 70, '#00ff88');
      } else {
        sounds.playInteract();
        spawnFloatingText('🕯️ تم إشعال الشموع من جديد! ✨', partyState.cake.x, partyState.cake.y - 70, '#ffd700');
      }
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_CANDLES', lit: partyState.candlesLit });
      }
    });
  }

  const btnPartyConfetti = document.getElementById('btn-party-confetti-footer');
  if (btnPartyConfetti) {
    btnPartyConfetti.addEventListener('click', () => {
      triggerPartyConfetti(480, 220, true);
      triggerPartyConfetti(200, 200, false);
      triggerPartyConfetti(760, 200, false);
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_CONFETTI', x: 480, y: 220 });
      }
    });
  }

  const btnPartyLights = document.getElementById('btn-party-lights-footer');
  if (btnPartyLights) {
    btnPartyLights.addEventListener('click', () => {
      partyState.partyLights = !partyState.partyLights;
      sounds.playInteract();
      spawnFloatingText(partyState.partyLights ? '💡 الإضاءة مشعلة!' : '🌙 إضاءة الحفلة خافتة!', 480, 200, '#00e5ff');
      if (state.mode === 'online' && Net.conn) {
        Net.send({ type: 'PARTY_LIGHTS', lights: partyState.partyLights });
      }
    });
  }

  const btnPartyLeave = document.getElementById('btn-party-leave');
  if (btnPartyLeave) {
    btnPartyLeave.addEventListener('click', () => {
      returnToCafe();
    });
  }

  // Reset Progress Password Modal & Logic (Secret Password: 654654)
  const resetModal = document.getElementById('reset-modal');
  const btnOpenReset = document.getElementById('btn-open-reset-modal');
  const btnCloseResetX = document.getElementById('btn-close-reset-x');
  const btnCancelReset = document.getElementById('btn-cancel-reset');
  const btnConfirmReset = document.getElementById('btn-confirm-reset');
  const inputResetPass = document.getElementById('input-reset-pass');
  const resetError = document.getElementById('reset-pass-error');

  const openResetModal = () => {
    if (inputResetPass) inputResetPass.value = '';
    if (resetError) resetError.classList.add('hidden');
    if (resetModal) resetModal.classList.remove('hidden');
    setTimeout(() => { if (inputResetPass) inputResetPass.focus(); }, 120);
  };

  const closeResetModal = () => {
    if (resetModal) resetModal.classList.add('hidden');
  };

  if (btnOpenReset) btnOpenReset.addEventListener('click', openResetModal);
  if (btnCloseResetX) btnCloseResetX.addEventListener('click', closeResetModal);
  if (btnCancelReset) btnCancelReset.addEventListener('click', closeResetModal);

  const executeReset = () => {
    const pass = inputResetPass ? inputResetPass.value.trim() : '';
    if (pass === '654654') {
      // Correct password! Reset progress
      state.maxUnlockedLevel = 0;
      state.currentLevelIndex = 0;
      state.coins = 0;
      state.servedCount = 0;
      localStorage.removeItem('hiro_max_unlocked_level');
      renderLevelCards();
      updateHUD();
      closeResetModal();
      sounds.playBoxPop();
      showNotice('✓ تم تصفير اللعبة وإعادة قفل المراحل بنجاح!');
    } else {
      // Incorrect password!
      sounds.playBoxPop();
      if (resetError) resetError.classList.remove('hidden');
      if (inputResetPass) {
        inputResetPass.classList.add('shake-anim');
        setTimeout(() => inputResetPass.classList.remove('shake-anim'), 400);
      }
    }
  };

  if (btnConfirmReset) btnConfirmReset.addEventListener('click', executeReset);
  if (inputResetPass) {
    inputResetPass.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeReset();
    });
  }

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
