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
  burger: 'برجر',
  shake: 'عصير',
  fries: 'بطاطس',
  tea: 'شاي',
  cupcake: 'كعكة'
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
    title: 'المرحلة 4: قاعة احتفال هيرو الكبرى',
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
  { id: 'shakeMachine', name: 'عصير الشبح', item: 'shake', x: 250, y: 130, cookTime: 75, busy: false, progress: 0 },
  { id: 'fryer', name: 'بطاطس مقلية', item: 'fries', x: 370, y: 130, cookTime: 70, busy: false, progress: 0 },
  { id: 'grill', name: 'شواية البرجر', item: 'burger', x: 490, y: 130, cookTime: 110, busy: false, progress: 0 },
  { id: 'teaKettle', name: 'شاي الأشباح', item: 'tea', x: 610, y: 130, cookTime: 75, busy: false, progress: 0 },
  { id: 'cupcakeOven', name: 'فرن الكعك', item: 'cupcake', x: 730, y: 130, cookTime: 85, busy: false, progress: 0 },
  { id: 'trash', name: 'سلة المهملات', item: null, x: 130, y: 130, cookTime: 0, busy: false, progress: 0 }
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
  mySlot: 1, // 1 for host, 2..6 for guests
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

  // 6 Playable Characters Slots (Host + up to 5 Online Friends!)
  players: [
    { id: 1, name: localStorage.getItem('hiro_player_name') || 'هيرو', charId: 'danny', x: 360, y: 200, speed: 3.5, dir: 'down', frame: 0, moving: false, dancing: false, heldItems: [], connected: true },
    { id: 2, name: 'صديقة 2', charId: 'sam', x: 440, y: 200, speed: 3.5, dir: 'down', frame: 0, moving: false, dancing: false, heldItems: [], connected: false },
    { id: 3, name: 'صديقة 3', charId: 'tucker', x: 520, y: 200, speed: 3.5, dir: 'down', frame: 0, moving: false, dancing: false, heldItems: [], connected: false },
    { id: 4, name: 'صديقة 4', charId: 'jazz', x: 600, y: 200, speed: 3.5, dir: 'down', frame: 0, moving: false, dancing: false, heldItems: [], connected: false },
    { id: 5, name: 'صديقة 5', charId: 'ember', x: 360, y: 250, speed: 3.5, dir: 'down', frame: 0, moving: false, dancing: false, heldItems: [], connected: false },
    { id: 6, name: 'صديقة 6', charId: 'vlad', x: 600, y: 250, speed: 3.5, dir: 'down', frame: 0, moving: false, dancing: false, heldItems: [], connected: false }
  ],

  // Backward compatibility getters
  get p1() { return this.players[0]; },
  get p2() { return this.players[1]; },

  spawnCooldown: 60,
  particles: [],
  floatingTexts: []
};

// Helper: Get the exact local player instance for this browser client
function getLocalPlayer() {
  const slot = (state.mode === 'online') ? (state.mySlot || 1) : 1;
  const idx = Math.max(0, Math.min(5, slot - 1));
  return state.players[idx];
}

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
      item: 'القطة البيضاء',
      pitch: 1.25,
      title: 'شبحونة (القطة البيضاء)',
      msg: 'مياو! قطة بيضاء شبحية جميلة بعيون خضراء زمردية، تهدي هيرو أدفأ وألطف الأمنيات بمناسبة عيد ميلادها!'
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
      item: 'القطة المشمشية',
      pitch: 1.0,
      title: 'مشمش (القطة المشمشية)',
      msg: 'مياو! قطة برتقالية مشمشية مخططة مليئة بالمرح، تحتفل مع هيرو وتسعد قلبها في يومها المميز!'
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
      item: 'القطة الليلية',
      pitch: 0.85,
      title: 'لونا (قطة الليل)',
      msg: 'مياو! قطة سوداء حريرية فخمة مستوحاة من عالم داني الشبح، تتمنى لهيرو أسعد وأجمل الأوقات!'
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
      item: 'القطة الفضية',
      pitch: 1.15,
      title: 'سكر (القطة الفضية)',
      msg: 'مياو! قطة رمادية فضية أنيقة بعيون سماوية ساحرة، تهدي هيرو أجمل التهاني والأمنيات السعيدة!'
    }
  ],
  confettiCannons: [
    { x: 120, y: 220 },
    { x: 840, y: 220 }
  ],
  djBooth: { x: 840, y: 430 }
};

// PeerJS Online Multiplayer Manager (Fixed: Accurate Slots, Unique Names, Fast Connect)
const Net = {
  peer: null,
  conn: null,       // Guest connection to Host
  conns: {},        // Host map: peerId -> DataConnection (supports up to 5 guests)
  myCode: '',
  connectTimeout: null,

  init(forceNewCode = false) {
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library not loaded; online multiplayer will run in local simulation.');
      const codeElem = document.getElementById('my-room-code');
      if (codeElem) codeElem.innerText = 'HIRO-LOCAL';
      updateOnlineLobbyUI();
      return;
    }

    try {
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy(); } catch (e) {}
      }

      this.conns = {};
      this.conn = null;

      const randNum = forceNewCode ? Math.floor(1000 + Math.random() * 9000) : Math.floor(100 + Math.random() * 900);
      this.myCode = `HIRO-${randNum}`;
      const peerId = `ghost-cafe-${this.myCode.toLowerCase()}`;

      this.peer = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        const codeElem = document.getElementById('my-room-code');
        if (codeElem) codeElem.innerText = this.myCode;
        updateOnlineLobbyUI();
      });

      // Host listener for incoming connections from guests (up to 5 guests)
      this.peer.on('connection', (c) => {
        state.isHost = true;
        state.mySlot = 1;
        state.players[0].name = state.localPlayerName;
        state.players[0].connected = true;
        if (state.selectedCharId) state.players[0].charId = state.selectedCharId;

        const onHostConnOpen = () => {
          // Check if room is full (max 6: 1 host + 5 guests)
          const activeConns = Object.values(Net.conns).filter(conn => conn && conn.open);
          if (activeConns.length >= 5) {
            try {
              c.send({ type: 'ROOM_FULL', message: 'الغرفة ممتلئة بالكامل (الحد الأقصى 6 لاعبات).' });
              setTimeout(() => c.close(), 500);
            } catch (e) {}
            return;
          }

          // Assign free slot 2..6
          let assignedSlot = -1;
          for (let s = 1; s < 6; s++) {
            if (!state.players[s].connected) {
              assignedSlot = s + 1;
              break;
            }
          }
          if (assignedSlot === -1) assignedSlot = activeConns.length + 2;

          c.playerSlot = assignedSlot;
          Net.conns[c.peer] = c;
          state.players[assignedSlot - 1].connected = true;
          state.onlineConnected = true;
          state.mode = 'online';

          // 1. Send slot assignment & existing room state to new guest
          try {
            c.send({
              type: 'ASSIGN_SLOT',
              slot: assignedSlot,
              players: state.players.map(p => ({
                id: p.id,
                name: p.name,
                charId: p.charId,
                connected: p.connected,
                x: p.x,
                y: p.y
              })),
              scene: state.scene,
              levelRunning: state.levelRunning,
              currentLevelIndex: state.currentLevelIndex
            });
          } catch(e) {}

          // 2. Broadcast to other existing guests that a new player joined
          Net.broadcast({
            type: 'PLAYER_JOINED',
            slot: assignedSlot,
            name: state.players[assignedSlot - 1].name,
            charId: state.players[assignedSlot - 1].charId
          }, c.peer);

          // 3. Listen for incoming data from this guest
          c.on('data', (data) => {
            Net.handleIncomingData(data, c);
          });

          c.on('close', () => {
            const slot = c.playerSlot;
            if (slot && state.players[slot - 1]) {
              state.players[slot - 1].connected = false;
            }
            delete Net.conns[c.peer];
            const remaining = Object.values(Net.conns).filter(conn => conn && conn.open).length;
            if (remaining === 0) state.onlineConnected = false;
            Net.broadcast({ type: 'PLAYER_LEFT', slot });
            updateOnlineLobbyUI();
          });

          updateOnlineLobbyUI();
          sounds.playCelebrationFanfare();
          const totalInRoom = Object.values(Net.conns).filter(conn => conn && conn.open).length + 1;
          showNotice(`انضمت صديقة جديدة للغرفة! (${totalInRoom}/6)`);

          // If Host is ALREADY playing, immediately launch guest directly into game!
          if (state.levelRunning) {
            setTimeout(() => {
              try {
                if (state.scene === 'party') {
                  c.send({ type: 'ENTER_PARTY_ROOM' });
                } else {
                  c.send({ type: 'START_LEVEL', levelIndex: state.currentLevelIndex });
                }
              } catch(e) {}
            }, 300);
          }
        };

        if (c.open) {
          onHostConnOpen();
        } else {
          c.on('open', onHostConnOpen);
        }
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS status:', err);
        if (err && (err.type === 'unavailable-id' || err.type === 'server-error')) {
          setTimeout(() => this.init(true), 400);
        }
      });
    } catch (e) {
      console.warn('Network peer exception:', e);
    }
  },

  connectTo(targetCode) {
    let raw = (targetCode || '').trim().toUpperCase();
    if (!raw) {
      showNotice('يرجى كتابة رمز الغرفة أولاً للانضمام.');
      return;
    }
    // Normalize code: accept "489", "hiro-489", "HIRO-489", "HIRO489"
    if (!raw.startsWith('HIRO-')) {
      const stripped = raw.replace(/^HIRO/i, '').replace(/^-/, '');
      raw = 'HIRO-' + (stripped || raw);
    }
    const targetPeerId = `ghost-cafe-${raw.toLowerCase()}`;
    const statusElem = document.getElementById('join-status');
    const btnJoin = document.getElementById('btn-join-room');
    if (statusElem) statusElem.innerText = `جاري الاتصال بالغرفة (${raw})...`;
    if (btnJoin) btnJoin.innerText = 'جاري الاتصال...';

    // Ensure our own peer is initialized and open before connecting
    if (!this.peer || this.peer.disconnected || !this.peer.open) {
      this.init();
      setTimeout(() => this.connectTo(targetCode), 700);
      return;
    }

    try {
      if (this.conn && this.conn.open) {
        try { this.conn.close(); } catch(e) {}
      }

      clearTimeout(this.connectTimeout);
      this.connectTimeout = setTimeout(() => {
        if (!state.onlineConnected) {
          if (statusElem) statusElem.innerText = `تعذر الاتصال بالمضيفة (${raw})! تأكدي أن صاحبة الغرفة فاتحة اللعبة، وأن الرمز صحيح.`;
          if (btnJoin) btnJoin.innerText = 'دخول الغرفة';
          showNotice(`تعذر الاتصال بالغرفة (${raw})! تأكدي من صحة الرمز.`);
        }
      }, 9000);

      this.conn = this.peer.connect(targetPeerId, { reliable: true });
      state.isHost = false;

      const onGuestConnOpen = () => {
        clearTimeout(Net.connectTimeout);
        if (statusElem) statusElem.innerText = `تم الانضمام بنجاح إلى الغرفة (${raw})!`;
        if (btnJoin) btnJoin.innerText = 'دخول الغرفة';
        state.onlineConnected = true;
        state.isHost = false;

        const lobbyCodeVal = document.getElementById('lobby-code-val');
        if (lobbyCodeVal) lobbyCodeVal.innerText = raw;

        sounds.playCelebrationFanfare();
        showNotice(`تم الانضمام بنجاح للغرفة (${raw})! بانتظار المضيفة لبدء اللعبة`);
        this.setupConnection();
      };

      if (this.conn.open) {
        onGuestConnOpen();
      } else {
        this.conn.on('open', onGuestConnOpen);
      }

      this.conn.on('error', (err) => {
        clearTimeout(Net.connectTimeout);
        if (statusElem) statusElem.innerText = 'تعذر الاتصال! تأكدي من صحة رمز الغرفة وأن المضيفة متصلة.';
        if (btnJoin) btnJoin.innerText = 'دخول الغرفة';
        showNotice('تعذر الاتصال بالغرفة! تأكدي من صحة الرمز.');
      });
    } catch (e) {
      clearTimeout(this.connectTimeout);
      if (statusElem) statusElem.innerText = 'حدث خطأ في الاتصال، حاولي ثانية.';
      if (btnJoin) btnJoin.innerText = 'دخول الغرفة';
    }
  },

  setupConnection() {
    state.onlineConnected = true;
    state.mode = 'online';

    const netBadge = document.getElementById('net-status-badge');
    if (netBadge) {
      netBadge.innerText = 'متصل';
      netBadge.style.borderColor = '#00ff88';
      netBadge.style.color = '#00ff88';
    }

    const hostStatus = document.getElementById('host-status');
    if (hostStatus) {
      hostStatus.innerText = state.isHost ? 'الغرفة جاهزة، شاركي الرمز مع صديقاتك (حتى 6)' : 'أنتِ متصلة بالغرفة!';
    }

    updateOnlineLobbyUI();

    if (this.conn) {
      this.conn.on('data', (data) => {
        this.handleIncomingData(data, this.conn);
      });

      this.conn.on('close', () => {
        state.onlineConnected = false;
        const netBadge = document.getElementById('net-status-badge');
        if (netBadge) netBadge.innerText = 'انقطع الاتصال';
        showNotice('انقطع الاتصال مع المضيفة.');
        updateOnlineLobbyUI();
      });
    }
  },

  isActive() {
    if (state.mode !== 'online') return false;
    if (state.isHost) {
      return Object.values(this.conns).some(c => c && c.open);
    }
    return !!(this.conn && this.conn.open);
  },

  // Broadcast data to all guests (or all guests except one)
  broadcast(data, excludePeer = null) {
    if (state.isHost) {
      Object.keys(this.conns).forEach(pId => {
        if (pId !== excludePeer && this.conns[pId] && this.conns[pId].open) {
          try { this.conns[pId].send(data); } catch (e) {}
        }
      });
    }
  },

  // Send data: if host, broadcasts to all guests; if guest, sends to host
  send(data) {
    if (state.isHost) {
      this.broadcast(data);
    } else if (this.conn && this.conn.open) {
      try { this.conn.send(data); } catch (e) {}
    }
  },

  handleIncomingData(data, fromConn = null) {
    if (!data || !data.type) return;

    if (data.type === 'ASSIGN_SLOT') {
      // Guest receives their slot assignment (2..6)
      state.mySlot = data.slot;
      state.isHost = false;
      state.onlineConnected = true;

      // Update other players from Host
      if (data.players && Array.isArray(data.players)) {
        data.players.forEach((p, idx) => {
          if (idx !== state.mySlot - 1 && state.players[idx]) {
            state.players[idx].name = p.name;
            state.players[idx].charId = p.charId;
            state.players[idx].connected = p.connected;
          }
        });
      }

      // Guest pins their own local name to their assigned slot!
      const myP = state.players[state.mySlot - 1];
      myP.name = state.localPlayerName;
      myP.connected = true;
      if (state.selectedCharId) myP.charId = state.selectedCharId;

      // Send back player intro to host with HER real name and assigned slot
      this.send({
        type: 'PLAYER_INTRO',
        slot: state.mySlot,
        name: state.localPlayerName,
        charId: myP.charId
      });

      updateOnlineLobbyUI();

      // If host is already inside a running game, join directly!
      if (data.levelRunning) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        if (data.scene === 'party') {
          state.partyUnlocked = true;
          enterPartyRoom(false);
        } else {
          startLevel(data.currentLevelIndex || 0, false);
        }
      }
    } else if (data.type === 'PLAYER_JOINED') {
      // Notification that another guest joined
      if (data.slot && data.slot !== state.mySlot && state.players[data.slot - 1]) {
        state.players[data.slot - 1].connected = true;
        if (data.name) state.players[data.slot - 1].name = data.name;
        if (data.charId) state.players[data.slot - 1].charId = data.charId;
      }
      updateOnlineLobbyUI();
      sounds.playInteract();
    } else if (data.type === 'PLAYER_LEFT') {
      if (data.slot && data.slot !== state.mySlot && state.players[data.slot - 1]) {
        state.players[data.slot - 1].connected = false;
      }
      updateOnlineLobbyUI();
    } else if (data.type === 'PLAYER_INTRO') {
      const slot = data.slot;
      // Strictly update the exact slot only (never touch local client's slot!)
      if (slot && slot !== state.mySlot && state.players[slot - 1]) {
        state.players[slot - 1].connected = true;
        if (data.name) state.players[slot - 1].name = data.name;
        if (data.charId) state.players[slot - 1].charId = data.charId;
      }
      if (state.isHost) {
        this.broadcast(data, fromConn ? fromConn.peer : null);
      }
      updateOnlineLobbyUI();
    } else if (data.type === 'NAME_CHANGE') {
      const slot = data.slot;
      // Strictly update the exact slot only (never touch local client's slot!)
      if (slot && slot !== state.mySlot && state.players[slot - 1]) {
        if (data.name) state.players[slot - 1].name = data.name;
      }
      if (state.isHost) {
        this.broadcast(data, fromConn ? fromConn.peer : null);
      }
      updateOnlineLobbyUI();
    } else if (data.type === 'CHAR_CHANGE') {
      const slot = data.slot;
      if (slot && slot !== state.mySlot && state.players[slot - 1]) {
        if (data.charId) state.players[slot - 1].charId = data.charId;
      }
      if (state.isHost) {
        this.broadcast(data, fromConn ? fromConn.peer : null);
      }
      updateOnlineLobbyUI();
    } else if (data.type === 'POS') {
      const slot = data.slot;
      // POS ONLY updates position and animation, NEVER names or identities!
      if (slot && slot !== state.mySlot && state.players[slot - 1]) {
        const targetP = state.players[slot - 1];
        targetP.x = data.x;
        targetP.y = data.y;
        targetP.dir = data.dir;
        targetP.frame = data.frame;
        targetP.moving = data.moving;
        targetP.heldItems = data.heldItems || [];
        if (typeof data.dancing !== 'undefined') targetP.dancing = data.dancing;
      }
      if (state.isHost) {
        this.broadcast(data, fromConn ? fromConn.peer : null);
      }
    } else if (data.type === 'ACTION') {
      const slot = data.slot;
      if (slot && slot !== state.mySlot && state.players[slot - 1]) {
        handlePlayerAction(state.players[slot - 1]);
      }
      if (state.isHost) {
        this.broadcast(data, fromConn ? fromConn.peer : null);
      }
    } else if (data.type === 'SYNC_STATE' && !state.isHost) {
      state.timeRemaining = data.timeRemaining;
      state.coins = data.coins;
      state.servedCount = data.servedCount;
      state.currentLevelIndex = data.currentLevelIndex;

      if (data.tables) {
        data.tables.forEach((t, i) => { if (TABLES[i]) TABLES[i].customer = t.customer; });
      }
      if (data.stations) {
        data.stations.forEach((s, i) => {
          if (STATIONS[i]) {
            STATIONS[i].busy = s.busy;
            STATIONS[i].progress = s.progress;
          }
        });
      }

      updateHUD();
    } else if (data.type === 'START_LEVEL') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      startLevel(data.levelIndex, false);
    } else if (data.type === 'ENTER_PARTY_ROOM') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      state.partyUnlocked = true;
      localStorage.setItem('hiro_party_unlocked', 'true');
      updatePartyMenuButton();
      enterPartyRoom(false);
    } else if (data.type === 'PARTY_CANDLES') {
      partyState.candlesLit = data.lit;
      if (!data.lit) {
        sounds.playCandlesBlow();
        spawnSparks(partyState.cake.x, partyState.cake.y - 40, 30, '#ffd700');
        spawnFloatingText('تم إطفاء الشموع معاً! كل عام وأنتِ بخير يا هيرو!', partyState.cake.x, partyState.cake.y - 70, '#00ff88');
      } else {
        sounds.playInteract();
        spawnFloatingText('تم إشعال الشموع من جديد! تمنيا أمنية سعيدة', partyState.cake.x, partyState.cake.y - 70, '#ffd700');
      }
      if (state.isHost) this.broadcast(data, fromConn ? fromConn.peer : null);
    } else if (data.type === 'PARTY_GIFT') {
      const g = partyState.gifts.find(x => x.id === data.giftId);
      if (g) {
        g.opened = true;
        sounds.playMeow(g.pitch);
        sounds.playBoxPop();
        triggerPartyConfetti(g.x, g.y, false);
        spawnFloatingText('مياو!', g.x, g.y - 45, g.color);
      }
      if (state.isHost) this.broadcast(data, fromConn ? fromConn.peer : null);
    } else if (data.type === 'PARTY_CONFETTI') {
      triggerPartyConfetti(data.x, data.y, true);
      if (state.isHost) this.broadcast(data, fromConn ? fromConn.peer : null);
    } else if (data.type === 'PARTY_LIGHTS') {
      partyState.partyLights = data.lights;
      sounds.playInteract();
      spawnFloatingText(data.lights ? 'الإضاءة ساطعة!' : 'إضاءة هادئة', 840, 390, '#00e5ff');
      if (state.isHost) this.broadcast(data, fromConn ? fromConn.peer : null);
    } else if (data.type === 'PARTY_DANCE') {
      const slot = data.slot;
      if (slot && slot !== state.mySlot && state.players[slot - 1]) {
        state.players[slot - 1].dancing = data.dancing;
      }
      if (state.isHost) this.broadcast(data, fromConn ? fromConn.peer : null);
    }
  }
};

// Real-time Online Room Lobby UI & Permissions Updater (Supports 6 Players!)
function updateOnlineLobbyUI() {
  const codeVal = document.getElementById('lobby-code-val');
  if (codeVal) {
    codeVal.innerText = Net.myCode || '---';
  }

  const countBadge = document.getElementById('lobby-members-count-badge');
  const banner = document.getElementById('lobby-instruction-banner');
  const btnPlay = document.getElementById('btn-play-game');

  // Count active connected players
  let connectedCount = 1;
  if (state.mode === 'online') {
    connectedCount = state.players.filter((p, i) => i === 0 || p.connected).length;
  }

  if (countBadge) {
    countBadge.innerText = `اللاعبون: (${connectedCount}/6)`;
    if (connectedCount > 1) {
      countBadge.classList.add('connected');
    } else {
      countBadge.classList.remove('connected');
    }
  }

  // Update all 6 slots in the lobby card
  for (let i = 1; i <= 6; i++) {
    const pill = document.getElementById(`lobby-pill-p${i}`);
    const nameEl = document.getElementById(`lobby-name-p${i}`);
    const statusEl = document.getElementById(`lobby-status-p${i}`);
    const p = state.players[i - 1];

    if (!pill || !nameEl || !statusEl || !p) continue;

    if (i === 1) {
      // Host Slot
      nameEl.innerText = p.name || 'هيرو';
      statusEl.innerText = state.isHost ? 'أنتِ (المضيفة)' : 'المضيفة (جاهزة)';
      statusEl.className = 'pill-status ready';
    } else {
      // Guest Slots (2 to 6)
      if (state.mode === 'online' && p.connected) {
        pill.classList.add('connected');
        nameEl.innerText = p.name || `الضيفة ${i}`;
        statusEl.innerText = (i === state.mySlot) ? 'أنتِ (متصلة)' : 'متصلة وجاهزة';
        statusEl.className = 'pill-status ready';
      } else {
        pill.classList.remove('connected');
        nameEl.innerText = 'بانتظار الصديقة...';
        statusEl.innerText = 'شاغر';
        statusEl.className = 'pill-status waiting';
      }
    }
  }

  // Instruction Banner
  if (banner) {
    if (state.mode === 'online') {
      if (state.isHost) {
        if (connectedCount > 1) {
          banner.innerText = `انضمت ${connectedCount - 1} صديقات! أنتِ مضيفة الغرفة، اضغطي (بدء اللعب) للانطلاق معاً`;
          banner.className = 'lobby-instruction ready-to-play';
        } else {
          banner.innerText = 'شاركي رمز الغرفة مع صديقاتك لينضممن إليكِ (حتى 6 لاعبات)';
          banner.className = 'lobby-instruction';
        }
      } else {
        const hostName = state.players[0].name || 'هيرو';
        banner.innerText = `أنتِ متصلة بغرفة ${hostName}! بانتظار المضيفة لبدء اللعبة...`;
        banner.className = 'lobby-instruction guest-waiting';
      }
    } else {
      banner.innerText = 'شاركي رمز الغرفة مع صديقاتك لينضممن إليكِ (حتى 6 لاعبات)';
      banner.className = 'lobby-instruction';
    }
  }

  // Start Button Permissions: Guest CANNOT start, only Host can start!
  if (btnPlay) {
    if (state.mode === 'online' && !state.isHost) {
      btnPlay.classList.add('guest-waiting-btn');
      btnPlay.innerText = 'بانتظار المضيفة لبدء اللعبة...';
      btnPlay.title = 'فقط مضيفة الغرفة يمكنها بدء اللعبة';
    } else if (state.mode === 'online' && state.isHost) {
      btnPlay.classList.remove('guest-waiting-btn');
      if (connectedCount > 1) {
        btnPlay.innerText = `بدء اللعب مع الصديقات (${connectedCount} لاعبات)!`;
        btnPlay.title = 'انطلاق اللعبة للجميع معاً';
      } else {
        btnPlay.innerText = 'بدء اللعب';
        btnPlay.title = 'بدء اللعب';
      }
    } else {
      btnPlay.classList.remove('guest-waiting-btn');
      btnPlay.innerText = 'بدء اللعب';
      btnPlay.title = 'بدء اللعب';
    }
  }
}

// Input Handling
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  keys[e.key] = true;

  if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
    e.preventDefault();
    if (state.levelRunning && !state.isPaused) {
      const activeLocalPlayer = getLocalPlayer();
      handlePlayerAction(activeLocalPlayer);

      if (state.mode === 'online') {
        Net.send({ type: 'ACTION', slot: state.mySlot });
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
    const press = (e) => {
      e.preventDefault();
      keys[k] = true;
      btn.classList.add('pressed');
    };
    const release = (e) => {
      e.preventDefault();
      keys[k] = false;
      btn.classList.remove('pressed');
    };
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release);
    btn.addEventListener('touchcancel', release);
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
  });

  const actBtn = document.querySelector('.t-action-btn[data-key="Space"]');
  if (actBtn) {
    const triggerAction = (e) => {
      e.preventDefault();
      if (state.levelRunning && !state.isPaused) {
        const activeLocalPlayer = getLocalPlayer();
        handlePlayerAction(activeLocalPlayer);
        if (state.mode === 'online') {
          Net.send({ type: 'ACTION', slot: state.mySlot });
        }
      }
    };
    actBtn.addEventListener('touchstart', triggerAction, { passive: false });
    actBtn.addEventListener('click', triggerAction);
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
  const activePlayer = getLocalPlayer();

  let dx = 0, dy = 0;
  if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

  movePlayer(activePlayer, dx, dy);

  // Broadcast position of local player over Net if online
  const isNetActive = state.mode === 'online' && (state.isHost ? Object.keys(Net.conns).length > 0 : (Net.conn && Net.conn.open));
  if (isNetActive && state.tick % 2 === 0) {
    Net.send({
      type: 'POS',
      slot: state.mySlot,
      x: activePlayer.x,
      y: activePlayer.y,
      dir: activePlayer.dir,
      frame: activePlayer.frame,
      moving: activePlayer.moving,
      dancing: activePlayer.dancing,
      heldItems: activePlayer.heldItems
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
        spawnFloatingText('تم إطفاء الشموع! كل عام وأنتِ بخير يا هيرو!', partyState.cake.x, partyState.cake.y - 75, '#00ff88');
        triggerPartyConfetti(partyState.cake.x, partyState.cake.y, true);
      } else {
        partyState.candlesLit = true;
        sounds.playInteract();
        spawnFloatingText('تم إشعال الشموع من جديد! تمنيا أمنية سعيدة', partyState.cake.x, partyState.cake.y - 75, '#ffd700');
      }
      if (state.mode === 'online') {
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
      spawnFloatingText('مياو!', nearGift.x, nearGift.y - 45, nearGift.color);
      if (state.mode === 'online') {
        Net.send({ type: 'PARTY_GIFT', giftId: nearGift.id });
      }
      return;
    }

    // C. Confetti Cannon
    const nearCannon = partyState.confettiCannons.find(c => Math.hypot(player.x - c.x, player.y - c.y) < 58);
    if (nearCannon) {
      triggerPartyConfetti(nearCannon.x, nearCannon.y, true);
      if (state.mode === 'online') {
        Net.send({ type: 'PARTY_CONFETTI', x: nearCannon.x, y: nearCannon.y });
      }
      return;
    }

    // D. DJ Booth & Lights
    if (Math.hypot(player.x - partyState.djBooth.x, player.y - partyState.djBooth.y) < 60) {
      partyState.partyLights = !partyState.partyLights;
      sounds.playInteract();
      spawnFloatingText(partyState.partyLights ? 'الإضاءة ساطعة!' : 'إضاءة هادئة', 840, 390, '#00e5ff');
      if (state.mode === 'online') {
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
        spawnFloatingText('تم تفريغ يديك بنجاح', nearStation.x, nearStation.y - 15, '#ff4444');
        player.heldItems = [];
        updateInventoryHUD();
      } else {
        spawnFloatingText('اليدان فارغتان بالفعل', nearStation.x, nearStation.y - 15, '#999');
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
      spawnFloatingText('بدأ التحضير...', nearStation.x, nearStation.y - 20, '#00ff88');
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
        spawnFloatingText('اليدان ممتلئتان (3/3)! سلّمي الطلبات أولاً', nearStation.x, nearStation.y - 20, '#ffcc00');
      }
      return;
    }

    // Case C: Machine is still in progress
    if (nearStation.busy && nearStation.progress < nearStation.cookTime) {
      spawnFloatingText('الطلب قيد التحضير...', nearStation.x, nearStation.y - 20, '#ffcc00');
      return;
    }
  }

  // 2. Table Interaction (Serve items from hands to customer)
  const nearTable = TABLES.find(t => Math.hypot(player.x - t.x, player.y - t.y) < 54);

  if (nearTable && nearTable.customer) {
    if (player.heldItems.length === 0) {
      spawnFloatingText('اليدان فارغتان! أحضري الطلب أولاً', nearTable.x, nearTable.y - 35, '#aaa');
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

        spawnFloatingText(`+${baseReward + tip} عملة! تم تسليم الطلب بنجاح`, nearTable.x, nearTable.y - 45, '#ffd700');
        spawnSparks(nearTable.x, nearTable.y - 20, 25, '#39ff14');

        nearTable.customer = null;
        updateHUD();
        checkWinCondition();
      } else {
        const remaining = cust.orderItems.length - cust.deliveredItems.length;
        // Give customer a patience refill bonus since they received part of their food!
        cust.patience = Math.min(cust.maxPatience, cust.patience + 900);
        spawnFloatingText(`تم تسليم جزء! المتبقي: ${remaining}`, nearTable.x, nearTable.y - 35, '#00ff88');
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
      spawnFloatingText(`-${penalty} عملة (طلب غير مطابق)`, nearTable.x, nearTable.y - 45, '#ff3333');
      spawnSparks(nearTable.x, nearTable.y - 20, 15, '#ff3333');

      if (cust.patience <= 0) {
        spawnFloatingText('غادر الزبون لنفاد الصبر!', nearTable.x, nearTable.y - 40, '#ff3333');
        nearTable.customer = null;
      }
    }
  }
}

// Update HUD for player inventory text (Visible both on character, bottom bar, and top screen pill)
function updateInventoryHUD() {
  const activeLocalPlayer = getLocalPlayer();
  const items = activeLocalPlayer.heldItems;

  const itemData = {
    burger: { name: 'برجر' },
    shake: { name: 'عصير' },
    fries: { name: 'بطاطس' },
    tea: { name: 'شاي' },
    cupcake: { name: 'كعكة' }
  };

  // 1. Bottom footer text
  const invElem = document.getElementById('hud-inventory-text');
  if (invElem) {
    if (items.length === 0) {
      invElem.innerText = 'فارغة (0/3)';
      invElem.style.color = '#98a5b8';
    } else {
      const names = items.map(k => (itemData[k] ? itemData[k].name : k)).join(' + ');
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
      chipsContainer.innerHTML = '<span class="empty-chip">اليدان فارغتان</span>';
      if (pill) pill.classList.remove('has-items');
    } else {
      if (pill) pill.classList.add('has-items');
      chipsContainer.innerHTML = items.map(k => {
        const info = itemData[k] || { name: k };
        return `<span class="held-chip ${k}"><span class="chip-text">${info.name}</span></span>`;
      }).join('');
    }
  }

  // 3. Mobile touch action button text
  const touchActionBtn = document.querySelector('.t-action-btn span:nth-child(2)');
  if (touchActionBtn) {
    if (items.length === 0) {
      touchActionBtn.innerText = 'تشغيل / التقاط';
    } else if (items.length < 3) {
      const last = items[items.length - 1];
      const name = (itemData[last] && itemData[last].name) || 'الطلب';
      touchActionBtn.innerText = `تقديم (${name}) / تشغيل`;
    } else {
      touchActionBtn.innerText = 'تقديم الطلبات';
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
        spawnFloatingText('جاهز للتقديم!', s.x, s.y - 55, '#00ff88');
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
      const activeCharIds = state.players.filter(p => p.connected).map(p => p.charId);
      const freeCustTypes = CUSTOMER_TYPES.filter(t => !activeCharIds.includes(t));
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
        spawnFloatingText('غادر الزبون لنفاد الصبر!', tbl.x, tbl.y - 40, '#ff3333');
        tbl.customer = null;
      }
    }
  });

  // Broadcast state to guest every 6 ticks
  if (state.mode === 'online' && state.isHost && state.tick % 6 === 0) {
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

  const cafeSpawns = [
    { x: 340, y: 200 },
    { x: 420, y: 200 },
    { x: 500, y: 200 },
    { x: 580, y: 200 },
    { x: 380, y: 250 },
    { x: 540, y: 250 }
  ];

  state.players.forEach((p, idx) => {
    p.heldItems = [];
    p.dancing = false;
    p.moving = false;
    if (cafeSpawns[idx]) {
      p.x = cafeSpawns[idx].x;
      p.y = cafeSpawns[idx].y;
    }
  });

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

  if (notifyRemote && state.mode === 'online') {
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
  updateOnlineLobbyUI();

    // Finished all levels (Level 4 completed)!
    if (state.currentLevelIndex === 3) {
      state.partyUnlocked = true;
      localStorage.setItem('hiro_party_unlocked', 'true');
      updatePartyMenuButton();
      const modal = document.getElementById('birthday-bash-modal');
      modal.classList.remove('hidden');
    } else {
      const modal = document.getElementById('level-win-modal');
      document.getElementById('win-coins').innerText = `${state.coins}`;

      const winNotice = document.getElementById('win-next-notice');
      if (winNotice) {
        if (unlockedNew) {
          winNotice.innerText = `خلصتي المرحلة! تم فتح المرحلة ${nextLvlIndex + 1}!`;
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
    btn.innerText = 'غرفة الاحتفال والرقص';
    btn.title = 'دخول غرفة الاحتفال والرقص!';
  } else {
    btn.classList.add('locked');
    btn.innerText = 'غرفة الاحتفال (مقفلة)';
    btn.title = 'تفتح فقط بعد إكمال جميع المراحل الـ 4!';
  }
}

function enterPartyRoom(notifyRemote = true) {
  if (!state.partyUnlocked) {
    sounds.playBoxPop();
    showNotice('غرفة الاحتفال مقفلة! يجب إكمال جميع المراحل الـ 4 أولاً لفتح قاعة الاحتفال.');
    return;
  }
  state.scene = 'party';
  state.levelRunning = true;
  state.isPaused = false;
  if (state.timerInterval) clearInterval(state.timerInterval);

  // Close all modals
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));

  // Position all 6 players nicely across the Dance Floor
  const partySpawns = [
    { x: 340, y: 350 },
    { x: 400, y: 350 },
    { x: 460, y: 350 },
    { x: 520, y: 350 },
    { x: 580, y: 350 },
    { x: 640, y: 350 }
  ];

  state.players.forEach((p, idx) => {
    p.dancing = false;
    p.moving = false;
    p.heldItems = [];
    if (partySpawns[idx]) {
      p.x = partySpawns[idx].x;
      p.y = partySpawns[idx].y;
    }
  });

  // Reset party state
  partyState.candlesLit = true;
  partyState.partyLights = true;
  partyState.gifts.forEach(g => g.opened = false);

  updatePartyHUD();

  sounds.init();
  sounds.playCelebrationFanfare();
  sounds.startPartyBGM();

  spawnFloatingText('أهلاً بكم في حفلة ميلاد هيرو الكبرى!', 480, 160, '#00ff88');
  triggerPartyConfetti(480, 220, false);
  triggerPartyConfetti(200, 200, false);
  triggerPartyConfetti(760, 200, false);

  if (notifyRemote && state.mode === 'online') {
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
    spawnFloatingText('حان وقت الاحتفال والرقص!', player.x, player.y - 35, '#00ff88');
    const notes = ['♪', '♫', '✦', '★'];
    for (let i = 0; i < 5; i++) {
      spawnFloatingText(notes[i % notes.length], player.x + (Math.random() * 40 - 20), player.y - 45 - Math.random() * 20, '#ffd700');
    }
  } else {
    spawnFloatingText('توقف الرقص', player.x, player.y - 35, '#aaa');
  }
  if (state.mode === 'online') {
    Net.send({ type: 'PARTY_DANCE', slot: state.mySlot, dancing: player.dancing });
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
  document.getElementById('hud-timer').innerText = 'حفلة';
  document.getElementById('hud-level-title').innerText = 'قاعة الاحتفال';
  document.getElementById('hud-coins').innerText = '9999';
  document.getElementById('target-count').innerText = 'عيد ميلاد هيرو السعيد!';

  // Floating inventory pill: change to dance prompt in party room
  const pill = document.getElementById('floating-inventory-pill');
  if (pill) {
    pill.classList.add('has-items');
    const capBadge = document.getElementById('inv-capacity-badge');
    const chipsContainer = document.getElementById('floating-items-chips');
    if (capBadge) capBadge.innerText = 'حفلة';
    if (chipsContainer) {
      chipsContainer.innerHTML = '<span class="held-chip cupcake"><span class="chip-text">ارقصي واحتفلي!</span></span>';
    }
  }

  // Update touch buttons
  const touchActionBtn = document.querySelector('.t-action-btn span:nth-child(2)');
  if (touchActionBtn) {
    touchActionBtn.innerText = 'تفاعل';
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

// Render Drawing Function
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.scene === 'party') {
    // 1. Party Room Environment
    Sprites.drawPartyRoom(ctx, canvas.width, canvas.height, state.tick, partyState);

    // 2. Draw all active players on the dance floor (up to 6 players!)
    state.players.forEach((p, idx) => {
      if (idx === 0 || (state.mode === 'online' && p.connected)) {
        const isOnlineFriend = (idx !== (state.mySlot - 1));
        Sprites.drawCharacter(ctx, p.x, p.y, p.charId || 'danny', p.frame, p.dir, p.heldItems || [], isOnlineFriend, p.name, p.dancing);
      }
    });
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

    // 4. Draw all active players in the cafe (up to 6 players!)
    state.players.forEach((p, idx) => {
      if (idx === 0 || (state.mode === 'online' && p.connected)) {
        const isOnlineFriend = (idx !== (state.mySlot - 1));
        Sprites.drawCharacter(ctx, p.x, p.y, p.charId || 'danny', p.frame, p.dir, p.heldItems || [], isOnlineFriend, p.name, p.dancing);
      }
    });
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
}

// Fixed 60 FPS Game Loop Engine (Locks game physics & speed equally across 60Hz, 120Hz, 144Hz & 240Hz screens)
let lastFrameTime = performance.now();
const FIXED_STEP_MS = 1000 / 60; // Exact 60 FPS timestep (16.6667ms)
let frameAccumulator = 0;

function gameLoop(currentTime) {
  if (!currentTime) currentTime = performance.now();
  const delta = Math.min(currentTime - lastFrameTime, 100);
  lastFrameTime = currentTime;
  frameAccumulator += delta;

  // Run game updates at strictly 60 ticks per second regardless of screen refresh rate
  while (frameAccumulator >= FIXED_STEP_MS) {
    state.tick++;
    if (state.levelRunning && !state.isPaused) {
      updatePlayers();
      if (state.scene !== 'party') {
        updateCustomers();
      }
      updateEffects();
    }
    frameAccumulator -= FIXED_STEP_MS;
  }

  // Render smooth graphics on every screen refresh
  render();

  requestAnimationFrame(gameLoop);
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
      statusHtml = `<div class="lvl-status locked-tag">مقفلة</div>`;
    } else if (idx < state.maxUnlockedLevel) {
      statusHtml = `<div class="lvl-status done-tag">مكتملة</div>`;
    } else {
      statusHtml = `<div class="lvl-status current-tag">جاهزة للبدء</div>`;
    }

    card.innerHTML = `
      <div class="lvl-num">LVL ${lvl.id}</div>
      <div class="lvl-name">${lvl.title.split(':')[1] || lvl.title}</div>
      ${statusHtml}
    `;

    card.addEventListener('click', () => {
      if (state.mode === 'online' && !state.isHost) {
        sounds.playBoxPop();
        showNotice(`مضيفة الغرفة (${state.p1.name || 'هيرو'}) هي من تختار المرحلة!`);
        return;
      }
      if (!isUnlocked) {
        sounds.playBoxPop();
        card.classList.add('shake-anim');
        setTimeout(() => card.classList.remove('shake-anim'), 400);
        showNotice(`المرحلة ${lvl.id} مقفلة! يجب إكمال المرحلة ${lvl.id - 1} أولاً.`);
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
    const savedName = localStorage.getItem('hiro_player_name');
    if (savedName) {
      state.localPlayerName = savedName;
      nameInput.value = savedName;
    } else {
      state.localPlayerName = state.isHost ? 'هيرو' : 'صديقة';
      nameInput.value = state.localPlayerName;
    }

    const localP = getLocalPlayer();
    if (localP) localP.name = state.localPlayerName;

    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim() || (state.isHost ? 'هيرو' : `صديقة ${state.mySlot}`);
      state.localPlayerName = val;
      localStorage.setItem('hiro_player_name', val);

      const lp = getLocalPlayer();
      if (lp) lp.name = val;

      updateOnlineLobbyUI();
      if (state.mode === 'online') {
        Net.send({ type: 'NAME_CHANGE', slot: state.mySlot, name: val });
      }
    });
  }

  // Fullscreen / Rotate Toggle (Bypasses phone orientation locks)
  const toggleRotate = () => {
    document.body.classList.toggle('force-landscape-mode');
    const isRot = document.body.classList.contains('force-landscape-mode');
    const btnHud = document.getElementById('btn-toggle-rotate');
    const btnQuick = document.getElementById('btn-quick-rotate');
    if (btnHud) btnHud.innerHTML = isRot ? '<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>' : '<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
    if (btnQuick) btnQuick.innerText = isRot ? 'العودة للوضع الرأسي' : 'تكبير الشاشة بالعرض (وضع ملء الشاشة)';

    if (isRot) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      showNotice('تم تكبير الشاشة بالعرض لتجربة أوضح وأكبر');
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      showNotice('تم الرجوع للوضع الرأسي');
    }
  };

  const btnHudRotate = document.getElementById('btn-toggle-rotate');
  if (btnHudRotate) btnHudRotate.addEventListener('click', toggleRotate);

  const btnQuickRotate = document.getElementById('btn-quick-rotate');
  if (btnQuickRotate) btnQuickRotate.addEventListener('click', toggleRotate);

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
      updateOnlineLobbyUI();
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
    state.isHost = true;
    state.mySlot = 1;
    if (!localStorage.getItem('hiro_player_name')) {
      state.localPlayerName = 'هيرو';
      if (nameInput) nameInput.value = 'هيرو';
      state.players[0].name = 'هيرو';
    }
    updateOnlineLobbyUI();
  });

  tabJoin.addEventListener('click', () => {
    tabJoin.classList.add('active');
    tabHost.classList.remove('active');
    joinView.classList.remove('hidden');
    hostView.classList.add('hidden');
    state.isHost = false;
    if (!localStorage.getItem('hiro_player_name') || state.localPlayerName === 'هيرو') {
      state.localPlayerName = 'صديقة';
      if (nameInput) nameInput.value = 'صديقة';
    }
    updateOnlineLobbyUI();
  });

  // Copy Room Code Button
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    navigator.clipboard.writeText(Net.myCode);
    const btn = document.getElementById('btn-copy-code');
    btn.innerText = 'تم النسخ بنجاح';
    setTimeout(() => { btn.innerText = 'نسخ الرمز'; }, 2000);
  });

  // Join Room by Code Button & Enter Key
  const handleJoinAction = () => {
    const codeInput = document.getElementById('input-room-code');
    const code = codeInput ? codeInput.value : '';
    if (code) {
      Net.connectTo(code);
    } else {
      showNotice('يرجى إدخال رمز الغرفة أولاً');
    }
  };
  document.getElementById('btn-join-room').addEventListener('click', handleJoinAction);
  const inputCodeElem = document.getElementById('input-room-code');
  if (inputCodeElem) {
    inputCodeElem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJoinAction();
    });
  }

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

  // Play button on menu (Enforce: only Host can start in online mode!)
  document.getElementById('btn-play-game').addEventListener('click', () => {
    if (state.mode === 'online' && !state.isHost) {
      sounds.playBoxPop();
      showNotice(`فقط مضيفة الغرفة (${state.p1.name || 'هيرو'}) يمكنها بدء اللعبة، بانتظار انطلاق اللعبة!`);
      return;
    }
    startLevel(state.currentLevelIndex, true);
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
      if (state.mode === 'online' && !state.isHost) {
        sounds.playBoxPop();
        showNotice(`فقط مضيفة الغرفة (${state.p1.name || 'هيرو'}) يمكنها الانتقال لقاعة الاحتفال!`);
        return;
      }
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
        spawnFloatingText('تم إطفاء الشموع! كل عام وأنتِ بخير يا هيرو!', partyState.cake.x, partyState.cake.y - 70, '#00ff88');
      } else {
        sounds.playInteract();
        spawnFloatingText('تم إشعال الشموع من جديد!', partyState.cake.x, partyState.cake.y - 70, '#ffd700');
      }
      if (state.mode === 'online') {
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
      if (state.mode === 'online') {
        Net.send({ type: 'PARTY_CONFETTI', x: 480, y: 220 });
      }
    });
  }

  const btnPartyLights = document.getElementById('btn-party-lights-footer');
  if (btnPartyLights) {
    btnPartyLights.addEventListener('click', () => {
      partyState.partyLights = !partyState.partyLights;
      sounds.playInteract();
      spawnFloatingText(partyState.partyLights ? 'الإضاءة ساطعة!' : 'إضاءة هادئة', 480, 200, '#00e5ff');
      if (state.mode === 'online') {
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
      showNotice('تمت إعادة ضبط تقدم المراحل بنجاح');
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
    btnSound.innerHTML = unmuted ? '<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"/></svg>' : '<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  });

  const btnPause = document.getElementById('btn-pause');
  btnPause.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    btnPause.innerHTML = state.isPaused ? '<svg viewBox="0 0 24 24" class="ui-icon" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' : '<svg viewBox="0 0 24 24" class="ui-icon" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  });
}

window.addEventListener('load', () => {
  setupUI();
  requestAnimationFrame(gameLoop);
});
