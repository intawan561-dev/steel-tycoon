/* ============================================================
   STEEL TYCOON — Complete Game Engine
   From Steel Factory to Industrial Empire
   ============================================================ */

// ═══════════════════════════════════════════════════════════════
//  SECTION 1: CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CFG = {
  CELL: 58,
  INIT_W: 10,
  INIT_H: 7,
  MAX_W: 26,
  MAX_H: 18,
  START_CASH: 600,
  ITEM_SPEED: 1.8,       // cells per second (base)
  PARTICLE_MAX: 120,
  FLOAT_TEXT_MAX: 30,
  AUTOSAVE_INTERVAL: 30,  // seconds
  INCOME_WINDOW: 5,       // seconds for income averaging
};

// Building type IDs
const B = {
  EMPTY:      0,
  ORE_MINE:   1,
  CONVEYOR:   2,
  SMELTER:    3,
  COLLECTOR:  4,
  STORAGE:    5,
  CARGO_DEPOT:6,
  ROAD:       7,
  POWER_PLANT:8,
  STEEL_MILL: 9,
  REFINERY:   10,
  TRADE_CENTER:11,
  RESEARCH_LAB:12,
  LUCKY_WHEEL: 13,
};

// Direction IDs
const DIR = { RIGHT: 0, DOWN: 1, LEFT: 2, UP: 3 };
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
const DIR_ARROWS = ['→', '↓', '←', '↑'];
const DIR_NAMES = ['ขวา', 'ล่าง', 'ซ้าย', 'บน'];

// ═══════════════════════════════════════════════════════════════
//  SECTION 2: BUILDING & STAGE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const BLDG = {
  [B.ORE_MINE]: {
    name: 'เหมืองแร่', icon: '⛏', category: 'production',
    desc: 'ขุดแร่เหล็กดิบจากใต้ดิน',
    baseCost: 100, costScale: 1.35,
    colors: { base: '#4a3a28', top: '#5e4a34', border: '#8b6914', glow: 'rgba(139,105,20,0.3)' },
    unlockStage: 0, maxLevel: 5,
    stats: lv => ({ prodInterval: [3, 2.4, 1.8, 1.2, 0.7][lv-1] }),
    statLabels: { prodInterval: 'ช่วงเวลาการผลิต (วินาที)' },
  },
  [B.CONVEYOR]: {
    name: 'สายพานลำเลียง', icon: '⇒', category: 'logistics',
    desc: 'ขนส่งไอเทมไปยังทิศทางที่กำหนด',
    baseCost: 25, costScale: 1.05,
    colors: { base: '#28282e', top: '#353540', border: '#555', glow: 'rgba(85,85,85,0.2)' },
    unlockStage: 0, maxLevel: 3, directional: true,
    stats: lv => ({ speed: [1.8, 3.0, 5.0][lv-1] }),
    statLabels: { speed: 'ความเร็ว (ช่อง/วินาที)' },
  },
  [B.SMELTER]: {
    name: 'เตาหลอมเหล็ก', icon: '🔥', category: 'processing',
    desc: 'หลอมแร่เหล็กดิบให้เป็นเหล็กเส้น',
    baseCost: 200, costScale: 1.45,
    colors: { base: '#3a1a08', top: '#522810', border: '#e06000', glow: 'rgba(224,96,0,0.25)' },
    unlockStage: 0, maxLevel: 5,
    stats: lv => ({ processTime: [5, 4, 3, 2, 1.2][lv-1] }),
    statLabels: { processTime: 'เวลาหลอมเหล็ก (วินาที)' },
  },
  [B.COLLECTOR]: {
    name: 'จุดเก็บเงิน', icon: '💰', category: 'economy',
    desc: 'เปลี่ยนสินค้าเหล็กแปรรูปเป็นเงินสด',
    baseCost: 150, costScale: 1.45,
    colors: { base: '#2e2818', top: '#3e3820', border: '#c9a84c', glow: 'rgba(201,168,76,0.25)' },
    unlockStage: 0, maxLevel: 5,
    stats: lv => ({ cashPerItem: [10, 25, 60, 150, 400][lv-1] }),
    statLabels: { cashPerItem: 'รายได้ต่อชิ้น' },
  },
  [B.STORAGE]: {
    name: 'คลังเก็บสินค้า', icon: '📦', category: 'logistics',
    desc: 'พักเก็บและสำรองไอเทมระหว่างขนส่ง',
    baseCost: 100, costScale: 1.3,
    colors: { base: '#282830', top: '#343440', border: '#777', glow: 'rgba(119,119,119,0.2)' },
    unlockStage: 1, maxLevel: 3,
    stats: lv => ({ capacity: [4, 8, 16][lv-1] }),
    statLabels: { capacity: 'ความจุสูงสุด' },
  },
  [B.CARGO_DEPOT]: {
    name: 'สถานีขนส่งสินค้า', icon: '🚛', category: 'economy',
    desc: 'เพิ่มรายได้ของจุดเก็บเงินในระยะทำงาน',
    baseCost: 700, costScale: 1.6,
    colors: { base: '#1a2a1a', top: '#243824', border: '#4a8a5c', glow: 'rgba(74,138,92,0.2)' },
    unlockStage: 2, maxLevel: 3,
    stats: lv => ({ incomeBoost: [1.5, 2.0, 3.0][lv-1], range: 3 }),
    statLabels: { incomeBoost: 'ตัวคูณรายได้', range: 'ระยะการทำงาน (ช่อง)' },
  },
  [B.ROAD]: {
    name: 'ถนน', icon: '═', category: 'infrastructure',
    desc: 'เชื่อมต่อโซนโรงงานและช่วยให้การเดินทางเป็นระบบ',
    baseCost: 35, costScale: 1.0,
    colors: { base: '#1a1a1c', top: '#242426', border: '#3a3a3c', glow: 'rgba(60,60,60,0.15)' },
    unlockStage: 2, maxLevel: 1,
    stats: () => ({}), statLabels: {},
  },
  [B.POWER_PLANT]: {
    name: 'โรงไฟฟ้า', icon: '⚡', category: 'infrastructure',
    desc: 'เพิ่มความเร็วการทำงานของสิ่งก่อสร้างในระยะ',
    baseCost: 1400, costScale: 1.7,
    colors: { base: '#1a1a38', top: '#242450', border: '#4466ee', glow: 'rgba(68,102,238,0.2)' },
    unlockStage: 3, maxLevel: 3,
    stats: lv => ({ speedBoost: [1.2, 1.5, 2.0][lv-1], range: 3 }),
    statLabels: { speedBoost: 'ตัวคูณความเร็ว', range: 'ระยะการทำงาน (ช่อง)' },
  },
  [B.STEEL_MILL]: {
    name: 'โรงงานเหล็กกล้า', icon: '🏭', category: 'processing',
    desc: 'โรงหลอมขั้นสูง — ผลิตเหล็ก 2 เท่าต่อรอบการผลิต',
    baseCost: 2200, costScale: 1.55,
    colors: { base: '#2a1010', top: '#3a1818', border: '#cc3030', glow: 'rgba(204,48,48,0.2)' },
    unlockStage: 3, maxLevel: 5,
    stats: lv => ({ processTime: [4, 3, 2.2, 1.5, 0.9][lv-1], outputCount: 2 }),
    statLabels: { processTime: 'เวลาหลอมเหล็ก (วินาที)', outputCount: 'ผลผลิตต่อรอบ' },
  },
  [B.REFINERY]: {
    name: 'โรงกลั่นเหล็ก', icon: '🏗', category: 'processing',
    desc: 'แปรรูปเหล็กให้เป็นสินค้าพรีเมียม (มูลค่า 3 เท่า)',
    baseCost: 5000, costScale: 1.65,
    colors: { base: '#162030', top: '#1e2e42', border: '#0088ff', glow: 'rgba(0,136,255,0.2)' },
    unlockStage: 4, maxLevel: 3,
    stats: lv => ({ processTime: [5, 3.5, 2][lv-1], valueMultiplier: 3 }),
    statLabels: { processTime: 'เวลาแปรรูป (วินาที)', valueMultiplier: 'ตัวคูณมูลค่าสินค้า' },
  },
  [B.TRADE_CENTER]: {
    name: 'ศูนย์การค้าส่ง', icon: '🏢', category: 'economy',
    desc: 'เพิ่มโบนัสรายได้สะสมทั่วโลกให้กับจุดเก็บเงินทั้งหมด',
    baseCost: 10000, costScale: 2.0,
    colors: { base: '#1e1e20', top: '#2a2a2e', border: '#ffaa00', glow: 'rgba(255,170,0,0.2)' },
    unlockStage: 4, maxLevel: 3,
    stats: lv => ({ globalBoost: [1.5, 2.0, 3.0][lv-1] }),
    statLabels: { globalBoost: 'โบนัสรายได้ทั่วโลก ×' },
  },
  [B.RESEARCH_LAB]: {
    name: 'ห้องวิจัย', icon: '🔬', category: 'infrastructure',
    desc: 'ผลิตคะแนนวิจัย (RP) เพื่อใช้อัปเกรดเทคโนโลยีพาสซีฟ',
    baseCost: 800, costScale: 1.6,
    colors: { base: '#102e2a', top: '#18423c', border: '#10b981', glow: 'rgba(16,185,129,0.25)' },
    unlockStage: 1, maxLevel: 3,
    stats: lv => ({ rpInterval: [5, 3.5, 2.0][lv-1] }),
    statLabels: { rpInterval: 'เวลาผลิตวิจัย (วินาที)' },
  },
  [B.LUCKY_WHEEL]: {
    name: 'วงล้อเสี่ยงโชค', icon: '🎡', category: 'infrastructure',
    desc: 'วงล้อเสี่ยงโชคอุตสาหกรรม: 1 ช่องชนะรางวัลใหญ่ (เงิน + RP), อีก 6 ช่องบทลงโทษหักเงินและทำลายเครื่องจักร!',
    baseCost: 500, costScale: 1.0,
    colors: { base: '#3b2f11', top: '#524116', border: '#ffaa00', glow: 'rgba(255,170,0,0.25)' },
    unlockStage: 1, maxLevel: 1,
    stats: () => ({}), statLabels: {},
  },
};

const STAGES = [
  { name: 'โรงงานผลิตเหล็ก',       cashReq: 0,      gridW: 10, gridH: 7,
    desc: 'จุดเริ่มต้นเล็กๆ — ขุดแร่ หลอมเหล็กเส้น และเก็บเงินสด' },
  { name: 'ขยายพื้นที่อุตสาหกรรม', cashReq: 1500,   gridW: 14, gridH: 9,
    desc: 'เพิ่มตารางแผนที่ คลังเก็บสินค้า และผลิตสินค้าได้เร็วขึ้น' },
  { name: 'ศูนย์ขนส่งโลจิสติกส์',       cashReq: 12000,  gridW: 18, gridH: 12,
    desc: 'สถานีขนส่งสินค้า ถนน และขยายระบบการขนถ่ายสินค้าเต็มตัว' },
  { name: 'เมืองอุตสาหกรรม',     cashReq: 60000,  gridW: 22, gridH: 14,
    desc: 'โรงไฟฟ้า โรงงานเหล็กกล้า และสร้างโครงสร้างพื้นฐานเมือง' },
  { name: 'อาณาจักรอุตสาหกรรม',   cashReq: 400000, gridW: 26, gridH: 18,
    desc: 'โรงกลั่นเหล็ก ศูนย์การค้าส่ง และสร้างความมั่งคั่งสูงสุด' },
];

const TECH = {
  conveyor_speed: {
    name: 'สายพานความเร็วสูง',
    desc: 'เพิ่มความเร็วการเคลื่อนที่ของสายพาน +30% ต่อเลเวล',
    icon: '⇒',
    cost: [5, 12, 30],
    maxLevel: 3
  },
  smelter_speed: {
    name: 'เตาหลอมไฟฟ้าอินดักชั่น',
    desc: 'ลดระยะเวลาดำเนินการเตาหลอม/โรงเหล็ก -15% ต่อเลเวล',
    icon: '🔥',
    cost: [8, 20, 45],
    maxLevel: 3
  },
  mine_speed: {
    name: 'หัวเจาะขยายความจุ',
    desc: 'ลดเวลาดำเนินการของเหมืองแร่ -15% ต่อเลเวล',
    icon: '⛏',
    cost: [6, 15, 35],
    maxLevel: 3
  },
  collector_income: {
    name: 'ใบอนุญาตการค้าระดับสูง',
    desc: 'เพิ่มเงินที่ได้จากการส่งออกขายวัตถุดิบและเหล็กทั้งหมด +20% ต่อเลเวล',
    icon: '💰',
    cost: [10, 25, 60],
    maxLevel: 3
  }
};

const CATEGORIES = [
  { id: 'production', label: 'ส่วนการผลิต' },
  { id: 'logistics', label: 'ส่วนโลจิสติกส์' },
  { id: 'processing', label: 'ส่วนแปรรูป' },
  { id: 'economy', label: 'ส่วนการเงิน' },
  { id: 'infrastructure', label: 'โครงสร้างพื้นฐาน' },
];

// ═══════════════════════════════════════════════════════════════
//  SECTION 3: GAME STATE
// ═══════════════════════════════════════════════════════════════

let S = null; // game state — initialized in init()

function createState() {
  return {
    cash: CFG.START_CASH,
    totalEarned: 0,
    totalProduced: 0,
    incomePerSec: 0,
    incomeLog: [],      // timestamps of cash earned for rate calc
    stage: 0,
    gridW: CFG.INIT_W,
    gridH: CFG.INIT_H,
    grid: null,
    // Tools / UI
    selectedTool: null,     // building type ID or null
    selectedCell: null,     // {x,y} for upgrade panel
    activeTool: 'select',   // 'select' or 'demolish'
    convDir: DIR.RIGHT,
    speed: 1,               // 1 or 2
    // Effects
    particles: [],
    floatTexts: [],
    // Timing
    lastTime: 0,
    tickAccum: 0,
    autosaveAccum: 0,
    gameTime: 0,
    // Counts per building type placed
    buildCounts: {},
    rp: 0,
    research: {
      conveyor_speed: 0,
      smelter_speed: 0,
      mine_speed: 0,
      collector_income: 0
    },
    overdriveTimer: 0,
    goldenOreSpawnTimer: 30,
    goldenOre: { active: false }
  };
}

function createCell(type) {
  return {
    type: type || B.EMPTY,
    level: 1,
    dir: DIR.RIGHT,
    // Mine
    prodTimer: 0,
    buffer: 0,
    // Smelter / processing
    processing: false,
    processTimer: 0,
    outputBuffer: 0, // number of items ready to output
    inputType: null,
    // Conveyor
    item: null,      // 'ore', 'steel', 'product' or null
    itemProgress: 0, // 0..1
    // Storage
    stored: 0,
    storedType: null,
  };
}

function createGrid(w, h) {
  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) row.push(createCell());
    grid.push(row);
  }
  return grid;
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 4: HELPERS
// ═══════════════════════════════════════════════════════════════

function inBounds(x, y) {
  return x >= 0 && x < S.gridW && y >= 0 && y < S.gridH;
}

function getCell(x, y) {
  return inBounds(x, y) ? S.grid[y][x] : null;
}

function dirFromDelta(dx, dy) {
  if (dx === 1 && dy === 0) return DIR.RIGHT;
  if (dx === -1 && dy === 0) return DIR.LEFT;
  if (dx === 0 && dy === 1) return DIR.DOWN;
  if (dx === 0 && dy === -1) return DIR.UP;
  return -1;
}

function oppDir(d) { return (d + 2) % 4; }

function getCost(typeId, count) {
  const def = BLDG[typeId];
  if (!def) return 0;
  const n = count || (S.buildCounts[typeId] || 0);
  return Math.floor(def.baseCost * Math.pow(def.costScale, n));
}

function getUpgradeCost(typeId, currentLevel) {
  const def = BLDG[typeId];
  return Math.floor(def.baseCost * (1.5 + currentLevel) * Math.pow(1.6, currentLevel));
}

function formatCash(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e4) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + Math.floor(n).toLocaleString();
}

function dist(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ═══════════════════════════════════════════════════════════════
//  SECTION 5: BUILDING SYSTEM
// ═══════════════════════════════════════════════════════════════

function canPlace(x, y, typeId) {
  if (!inBounds(x, y)) return false;
  if (S.grid[y][x].type !== B.EMPTY) return false;
  const def = BLDG[typeId];
  if (!def) return false;
  if (def.unlockStage > S.stage) return false;
  if (S.cash < getCost(typeId)) return false;
  return true;
}

function placeBuilding(x, y, typeId) {
  if (!canPlace(x, y, typeId)) return false;
  const cost = getCost(typeId);
  S.cash -= cost;
  S.buildCounts[typeId] = (S.buildCounts[typeId] || 0) + 1;

  const cell = S.grid[y][x];
  cell.type = typeId;
  cell.level = 1;
  cell.dir = S.convDir;
  cell.prodTimer = 0;
  cell.buffer = 0;
  cell.processing = false;
  cell.processTimer = 0;
  cell.outputBuffer = 0;
  cell.item = null;
  cell.itemProgress = 0;
  cell.stored = 0;
  cell.storedType = null;

  // Init storage capacity
  if (typeId === B.STORAGE) {
    cell.stored = 0;
  }

  spawnParticles(x * CFG.CELL + CFG.CELL / 2, y * CFG.CELL + CFG.CELL / 2, '#c9a84c', 8);
  notify('🔨', `สร้าง ${BLDG[typeId].name} แล้ว`, 'info');
  updateUI();
  return true;
}

function removeBuilding(x, y) {
  if (!inBounds(x, y)) return;
  const cell = S.grid[y][x];
  if (cell.type === B.EMPTY) return;

  const def = BLDG[cell.type];
  const refund = Math.floor(getCost(cell.type, Math.max(0, (S.buildCounts[cell.type] || 1) - 1)) * 0.5);
  S.cash += refund;
  
  spawnParticles(x * CFG.CELL + CFG.CELL / 2, y * CFG.CELL + CFG.CELL / 2, '#c04848', 6);
  notify('🗑️', `ทำลาย ${def.name} (+${formatCash(refund)})`, 'warning');

  // Reset cell
  Object.assign(cell, createCell());
  S.selectedCell = null;
  updateUI();
}

function upgradeBuilding(x, y) {
  if (!inBounds(x, y)) return false;
  const cell = S.grid[y][x];
  const def = BLDG[cell.type];
  if (!def || cell.level >= def.maxLevel) return false;
  
  const cost = getUpgradeCost(cell.type, cell.level);
  if (S.cash < cost) return false;

  S.cash -= cost;
  cell.level++;

  spawnParticles(x * CFG.CELL + CFG.CELL / 2, y * CFG.CELL + CFG.CELL / 2, '#5aad6e', 10);
  notify('⬆️', `${def.name} อัปเกรดเป็น Lv.${cell.level} แล้ว`, 'success');
  updateUI();
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 6: CONVEYOR & ITEM SYSTEM
// ═══════════════════════════════════════════════════════════════

function conveyorCanAccept(cell, sideOfEntry) {
  // A conveyor accepts items from any side EXCEPT its output side
  if (!cell || cell.type !== B.CONVEYOR) return false;
  if (cell.item !== null) return false;
  return sideOfEntry !== cell.dir;
}

function getConveyorSpeed(cell) {
  const def = BLDG[B.CONVEYOR];
  let base = def.stats(cell.level).speed;
  if (S.research && S.research.conveyor_speed) {
    base *= (1.0 + S.research.conveyor_speed * 0.3);
  }
  return base * getPowerBoost(cell._gx, cell._gy);
}

function updateConveyors(dt) {
  // Process conveyors: move items, transfer to next cell
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type !== B.CONVEYOR || cell.item === null) continue;

      cell._gx = x; cell._gy = y;
      const speed = getConveyorSpeed(cell);
      cell.itemProgress += speed * dt;

      if (cell.itemProgress >= 1.0) {
        // Try to transfer to next cell
        const nx = x + DX[cell.dir];
        const ny = y + DY[cell.dir];
        const next = getCell(nx, ny);
        const side = oppDir(cell.dir);

        if (!next) {
          cell.itemProgress = 1.0;
          continue;
        }

        let transferred = false;

        switch (next.type) {
          case B.CONVEYOR:
            if (conveyorCanAccept(next, side)) {
              next.item = cell.item;
              next.itemProgress = cell.itemProgress - 1.0;
              cell.item = null;
              cell.itemProgress = 0;
              transferred = true;
            }
            break;

          case B.SMELTER:
          case B.STEEL_MILL:
          case B.REFINERY:
            if (!next.processing && next.outputBuffer <= 0) {
              next.processing = true;
              next.processTimer = 0;
              next.inputType = cell.item;
              cell.item = null;
              cell.itemProgress = 0;
              transferred = true;
            }
            break;

          case B.COLLECTOR:
            collectItem(cell.item, next, nx, ny);
            cell.item = null;
            cell.itemProgress = 0;
            transferred = true;
            break;

          case B.STORAGE:
            const cap = BLDG[B.STORAGE].stats(next.level).capacity;
            if (next.stored < cap) {
              next.stored++;
              next.storedType = cell.item;
              cell.item = null;
              cell.itemProgress = 0;
              transferred = true;
            }
            break;
        }

        if (!transferred) {
          cell.itemProgress = 1.0; // Wait
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 7: PRODUCTION SYSTEM
// ═══════════════════════════════════════════════════════════════

function getPowerBoost(x, y) {
  let boost = 1.0;
  for (let cy = 0; cy < S.gridH; cy++) {
    for (let cx = 0; cx < S.gridW; cx++) {
      const c = S.grid[cy][cx];
      if (c.type === B.POWER_PLANT) {
        const stats = BLDG[B.POWER_PLANT].stats(c.level);
        if (dist(x, y, cx, cy) <= stats.range) {
          boost *= stats.speedBoost;
        }
      }
    }
  }
  return boost;
}

function updateMines(dt) {
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type !== B.ORE_MINE) continue;

      const stats = BLDG[B.ORE_MINE].stats(cell.level);
      let interval = stats.prodInterval / getPowerBoost(x, y);
      if (S.research && S.research.mine_speed) {
        interval *= (1.0 - S.research.mine_speed * 0.15);
      }

      cell.prodTimer += dt;
      if (cell.prodTimer >= interval && cell.buffer < 3) {
        cell.buffer++;
        cell.prodTimer -= interval;
        S.totalProduced++;
      }
      if (cell.buffer >= 3) cell.prodTimer = Math.min(cell.prodTimer, interval);

      // Try to output to adjacent conveyor
      if (cell.buffer > 0) {
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d];
          const ny = y + DY[d];
          const neighbor = getCell(nx, ny);
          const side = oppDir(d);
          if (neighbor && conveyorCanAccept(neighbor, side)) {
            neighbor.item = 'ore';
            neighbor.itemProgress = 0;
            cell.buffer--;
            break;
          }
        }
      }
    }
  }
}

function updateSmelters(dt) {
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      const isSmelt = cell.type === B.SMELTER;
      const isMill = cell.type === B.STEEL_MILL;
      const isRefinery = cell.type === B.REFINERY;
      if (!isSmelt && !isMill && !isRefinery) continue;

      const def = BLDG[cell.type];
      const stats = def.stats(cell.level);
      let pTime = stats.processTime / getPowerBoost(x, y);
      if (S.research && S.research.smelter_speed) {
        pTime *= (1.0 - S.research.smelter_speed * 0.15);
      }

      // Process
      if (cell.processing) {
        cell.processTimer += dt;
        if (cell.processTimer >= pTime) {
          cell.processing = false;
          cell.processTimer = 0;
          const outCount = stats.outputCount || 1;
          cell.outputBuffer += outCount;
          // Determine output type
          if (isRefinery) {
            cell.inputType = 'product';
          } else {
            cell.inputType = 'steel';
          }
        }
      }

      // Output to adjacent conveyor
      if (cell.outputBuffer > 0) {
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d];
          const ny = y + DY[d];
          const neighbor = getCell(nx, ny);
          const side = oppDir(d);
          if (neighbor && conveyorCanAccept(neighbor, side)) {
            const outType = isRefinery ? 'product' : 'steel';
            neighbor.item = outType;
            neighbor.itemProgress = 0;
            cell.outputBuffer--;
            break;
          }
        }
      }
    }
  }
}

function updateStorage(dt) {
  // Storage outputs to adjacent conveyors
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type !== B.STORAGE || cell.stored <= 0) continue;

      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d];
        const ny = y + DY[d];
        const neighbor = getCell(nx, ny);
        const side = oppDir(d);
        if (neighbor && conveyorCanAccept(neighbor, side)) {
          neighbor.item = cell.storedType || 'ore';
          neighbor.itemProgress = 0;
          cell.stored--;
          break;
        }
      }
    }
  }
}

function updateResearchLabs(dt) {
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type !== B.RESEARCH_LAB) continue;

      const stats = BLDG[B.RESEARCH_LAB].stats(cell.level);
      const interval = stats.rpInterval / getPowerBoost(x, y);

      cell.prodTimer += dt;
      if (cell.prodTimer >= interval) {
        cell.prodTimer -= interval;
        S.rp += 1;
        spawnFloatText(x * CFG.CELL + CFG.CELL / 2, y * CFG.CELL, '+1 RP', '#10b981');
        spawnParticles(x * CFG.CELL + CFG.CELL / 2, y * CFG.CELL + CFG.CELL / 2, '#10b981', 3);
        updateUI();
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 8: ECONOMY SYSTEM
// ═══════════════════════════════════════════════════════════════

function getCargoBoost(x, y) {
  let boost = 1.0;
  for (let cy = 0; cy < S.gridH; cy++) {
    for (let cx = 0; cx < S.gridW; cx++) {
      const c = S.grid[cy][cx];
      if (c.type === B.CARGO_DEPOT) {
        const stats = BLDG[B.CARGO_DEPOT].stats(c.level);
        if (dist(x, y, cx, cy) <= stats.range) {
          boost *= stats.incomeBoost;
        }
      }
    }
  }
  return boost;
}

function getGlobalIncomeMultiplier() {
  let mult = 1.0;
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const c = S.grid[y][x];
      if (c.type === B.TRADE_CENTER) {
        mult *= BLDG[B.TRADE_CENTER].stats(c.level).globalBoost;
      }
    }
  }
  return mult;
}

function collectItem(itemType, collectorCell, cx, cy) {
  const stats = BLDG[B.COLLECTOR].stats(collectorCell.level);
  let value = stats.cashPerItem;

  // Item type bonus
  if (itemType === 'ore') value *= 0.4; // 60% penalty for raw ore
  else if (itemType === 'steel') value *= 1.0;
  else if (itemType === 'product') value *= 3.0;

  // Apply research bonus
  if (S.research && S.research.collector_income) {
    value *= (1.0 + S.research.collector_income * 0.2);
  }

  // Cargo depot boost
  value *= getCargoBoost(cx, cy);
  // Global boost
  value *= getGlobalIncomeMultiplier();

  value = Math.floor(value);
  S.cash += value;
  S.totalEarned += value;
  S.incomeLog.push({ time: S.gameTime, amount: value });

  // Floating text
  spawnFloatText(cx * CFG.CELL + CFG.CELL / 2, cy * CFG.CELL, `+$${value}`, '#f0d060');
  // Particles
  spawnParticles(cx * CFG.CELL + CFG.CELL / 2, cy * CFG.CELL + CFG.CELL / 2, '#f0d060', 4);
}

function updateIncomeRate() {
  const now = S.gameTime;
  // Remove old entries
  S.incomeLog = S.incomeLog.filter(e => now - e.time < CFG.INCOME_WINDOW);
  const total = S.incomeLog.reduce((sum, e) => sum + e.amount, 0);
  S.incomePerSec = total / CFG.INCOME_WINDOW;
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 9: PROGRESSION SYSTEM
// ═══════════════════════════════════════════════════════════════

function canAdvanceStage() {
  if (S.stage >= STAGES.length - 1) return false;
  return S.totalEarned >= STAGES[S.stage + 1].cashReq;
}

function advanceStage() {
  if (!canAdvanceStage()) return;
  S.stage++;
  const stage = STAGES[S.stage];

  // Expand grid
  if (stage.gridW > S.gridW || stage.gridH > S.gridH) {
    expandGrid(stage.gridW, stage.gridH);
  }

  spawnParticles(canvas.width / 2, canvas.height / 2, '#f0d060', 30);
  notify('🏆', `ปลดล็อกระดับโรงงานใหม่: ${stage.name}!`, 'gold');
  updateUI();
}

function expandGrid(newW, newH) {
  const oldW = S.gridW;
  const oldH = S.gridH;
  const newGrid = createGrid(newW, newH);

  // Copy old grid
  for (let y = 0; y < oldH; y++) {
    for (let x = 0; x < oldW; x++) {
      newGrid[y][x] = S.grid[y][x];
    }
  }

  S.grid = newGrid;
  S.gridW = newW;
  S.gridH = newH;
  resizeCanvas();
}

function getUnlockedTypes() {
  const types = [];
  for (const [id, def] of Object.entries(BLDG)) {
    if (def.unlockStage <= S.stage) types.push(parseInt(id));
  }
  return types;
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 10: PARTICLES & EFFECTS
// ═══════════════════════════════════════════════════════════════

function spawnParticles(px, py, color, count) {
  for (let i = 0; i < count; i++) {
    if (S.particles.length >= CFG.PARTICLE_MAX) S.particles.shift();
    S.particles.push({
      x: px, y: py,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100 - 40,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 0.6 + Math.random() * 0.4,
      color: color,
      size: 2 + Math.random() * 3,
    });
  }
}

function spawnFloatText(px, py, text, color) {
  if (S.floatTexts.length >= CFG.FLOAT_TEXT_MAX) S.floatTexts.shift();
  S.floatTexts.push({
    x: px, y: py,
    text: text,
    color: color,
    life: 1.2,
    maxLife: 1.2,
    vy: -40,
  });
}

function updateParticles(dt) {
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const p = S.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 80 * dt; // gravity
    p.life -= dt;
    if (p.life <= 0) S.particles.splice(i, 1);
  }
  for (let i = S.floatTexts.length - 1; i >= 0; i--) {
    const ft = S.floatTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) S.floatTexts.splice(i, 1);
  }
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 10.5: GOLDEN ORE & OVERDRIVE SYSTEM
// ═══════════════════════════════════════════════════════════════

function spawnGoldenOre() {
  const isOverdrive = Math.random() < 0.4; // 40% chance for overdrive, 60% for cash
  const type = isOverdrive ? 'overdrive' : 'cash';
  
  const side = Math.random() < 0.5 ? 'left' : 'right';
  const margin = 50;
  const canvasW = canvas.width;
  const canvasH = canvas.height;
  
  let x, y, vx, vy;
  if (side === 'left') {
    x = -20;
    y = margin + Math.random() * (canvasH - margin * 2);
    vx = 30 + Math.random() * 30; // 30-60 px/sec
    vy = (Math.random() - 0.5) * 20; // slow vertical drift
  } else {
    x = canvasW + 20;
    y = margin + Math.random() * (canvasH - margin * 2);
    vx = -(30 + Math.random() * 30);
    vy = (Math.random() - 0.5) * 20;
  }
  
  S.goldenOre = {
    active: true,
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    size: 18,
    type: type,
    pulse: 0
  };
}

function updateGoldenOre(dt) {
  // Spawn logic
  if (!S.goldenOre || !S.goldenOre.active) {
    if (S.goldenOreSpawnTimer === undefined) S.goldenOreSpawnTimer = 45;
    S.goldenOreSpawnTimer -= dt;
    if (S.goldenOreSpawnTimer <= 0) {
      spawnGoldenOre();
      S.goldenOreSpawnTimer = 45 + Math.random() * 30; // next spawn in 45-75 seconds
    }
    return;
  }
  
  const ore = S.goldenOre;
  ore.x += ore.vx * dt;
  ore.y += ore.vy * dt;
  ore.pulse += dt * 5;
  
  // Trail particles
  if (Math.random() < 0.25) {
    const color = ore.type === 'overdrive' ? '#ff9c1a' : '#fbbf24';
    spawnParticles(ore.x, ore.y, color, 1);
  }
  
  // Boundary check
  const canvasW = canvas.width;
  const canvasH = canvas.height;
  if (ore.x < -40 || ore.x > canvasW + 40 || ore.y < -40 || ore.y > canvasH + 40) {
    ore.active = false;
  }
}

function collectGoldenOre() {
  if (!S.goldenOre || !S.goldenOre.active) return;
  const ore = S.goldenOre;
  ore.active = false;
  
  // Spawn explosion particles
  const color = ore.type === 'overdrive' ? '#ff9c1a' : '#fbbf24';
  spawnParticles(ore.x, ore.y, color, 15);
  
  if (ore.type === 'overdrive') {
    // Activate Overdrive
    S.overdriveTimer = 15.0; // 15 seconds
    spawnFloatText(ore.x, ore.y - 10, 'เร่งกำลัง OVERDRIVE! ⚡', '#ff9c1a');
    
    // Show HUD immediately
    const hud = document.getElementById('overdrive-hud');
    if (hud) {
      hud.classList.remove('hidden');
    }
  } else {
    // Reward cash
    const baseReward = 150 * (S.stage + 1);
    const scaleReward = S.incomePerSec * 15; // 15 seconds of income
    const reward = Math.floor(Math.max(baseReward, scaleReward));
    
    S.cash += reward;
    spawnFloatText(ore.x, ore.y - 10, `+${formatCash(reward)} 🪙`, '#fbbf24');
    updateUI();
  }
}

function drawGoldenOre(ctx) {
  if (!S.goldenOre || !S.goldenOre.active) return;
  
  const ore = S.goldenOre;
  const size = ore.size;
  const pulse = Math.sin(ore.pulse) * 3;
  const totalSize = size + pulse;
  
  // Outer glow
  const grad = ctx.createRadialGradient(ore.x, ore.y, size * 0.2, ore.x, ore.y, totalSize * 1.5);
  if (ore.type === 'overdrive') {
    grad.addColorStop(0, '#ff9c1a');
    grad.addColorStop(0.5, 'rgba(255,156,26,0.3)');
    grad.addColorStop(1, 'rgba(255,156,26,0)');
  } else {
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(0.5, 'rgba(251,191,36,0.3)');
    grad.addColorStop(1, 'rgba(251,191,36,0)');
  }
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(ore.x, ore.y, totalSize * 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner solid core
  ctx.fillStyle = ore.type === 'overdrive' ? '#ff9c1a' : '#fbbf24';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ore.x, ore.y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Icon emoji
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.9}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = ore.type === 'overdrive' ? '⚡' : '🪙';
  ctx.fillText(icon, ore.x, ore.y);
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 10.6: INDUSTRIAL LUCKY WHEEL & CASINO SYSTEM
// ═══════════════════════════════════════════════════════════════

let isSpinning = false;
let currentWheelAngle = 0;
let lastSpinResultIdx = null;

function openLuckyWheelModal(x, y) {
  const modal = document.getElementById('modal-wheel');
  if (!modal) return;
  
  // Set spin cost
  const cost = 200 * (S.stage + 1);
  const costEl = document.getElementById('spin-cost-val');
  if (costEl) costEl.textContent = `$${cost}`;
  
  // Clear result message
  const resultMsg = document.getElementById('wheel-result-msg');
  if (resultMsg) {
    resultMsg.textContent = '';
    resultMsg.className = 'wheel-result-msg';
  }
  
  // Reset wheel canvas rotation
  const wheelCanvas = document.getElementById('wheel-canvas');
  if (wheelCanvas) {
    wheelCanvas.style.transition = 'none';
    wheelCanvas.style.transform = 'rotate(0deg)';
    currentWheelAngle = 0;
  }
  
  modal.classList.remove('hidden');
  
  // Draw wheel sectors
  setTimeout(() => {
    drawLuckyWheel();
  }, 50);
}

function drawLuckyWheel() {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = canvas.width / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const sectors = [
    { label: "รางวัลใหญ่! 👑", color: "#10b981" },
    { label: "หักเงิน 30% 💀", color: "#b91c1c" },
    { label: "หักเงิน 50% 💀", color: "#991b1b" },
    { label: "เครื่องระเบิด 💥", color: "#7f1d1d" },
    { label: "เหมืองถล่ม ⛏️", color: "#b91c1c" },
    { label: "สายพานขาด ⛓️", color: "#991b1b" },
    { label: "ภัยพิบัติโรงงาน 💀", color: "#7f1d1d" }
  ];
  
  const numSectors = sectors.length;
  const arcSize = (Math.PI * 2) / numSectors;
  
  for (let i = 0; i < numSectors; i++) {
    const angle = i * arcSize;
    
    // Draw sector pie slice
    ctx.fillStyle = sectors[i].color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + arcSize);
    ctx.closePath();
    ctx.fill();
    
    // Stroke line separator
    ctx.strokeStyle = '#0f111a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Text label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + arcSize / 2);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px Kanit, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(sectors[i].label, r - 15, 0);
    ctx.restore();
  }
  
  // Center cap decoration
  ctx.fillStyle = '#0f111a';
  ctx.beginPath();
  ctx.arc(cx, cy, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ff9c1a';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function spinLuckyWheel() {
  if (isSpinning) return;
  
  const cost = 200 * (S.stage + 1);
  if (S.cash < cost) {
    notify('❌', 'เงินสดของคุณไม่เพียงพอสำหรับหมุนวงล้อ!', 'error');
    return;
  }
  
  // Deduct cost
  S.cash -= cost;
  updateUI();
  
  isSpinning = true;
  
  const resultMsg = document.getElementById('wheel-result-msg');
  if (resultMsg) {
    resultMsg.textContent = 'กำลังเสี่ยงโชค... 🎰';
    resultMsg.className = 'wheel-result-msg';
  }
  
  const wheelCanvas = document.getElementById('wheel-canvas');
  if (wheelCanvas) {
    // 1 in 7 sectors. Sector 0 is win, 1-6 are lose.
    const targetIdx = Math.floor(Math.random() * 7);
    lastSpinResultIdx = targetIdx;
    
    // Calculate exact rotation target in degrees
    const targetAngle = 1800 + (270 - (targetIdx + 0.5) * (360 / 7));
    currentWheelAngle = targetAngle;
    
    wheelCanvas.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)';
    wheelCanvas.style.transform = `rotate(${targetAngle}deg)`;
  }
}

function resolveSpinOutcome() {
  isSpinning = false;
  const targetIdx = lastSpinResultIdx;
  if (targetIdx === null) return;
  
  const resultMsg = document.getElementById('wheel-result-msg');
  
  if (targetIdx === 0) {
    // WIN!
    const cashReward = Math.floor(Math.max(1500, S.incomePerSec * 60) * (1.0 + S.stage * 0.5));
    const rpReward = 5;
    
    S.cash += cashReward;
    S.rp += rpReward;
    updateUI();
    
    if (resultMsg) {
      resultMsg.textContent = `ยินดีด้วย! คุณได้รับเงินสด $${cashReward.toLocaleString()} และ +5 RP! 👑`;
      resultMsg.className = 'wheel-result-msg win';
    }
    
    // Sparkle explosion in center of canvas
    spawnParticles(canvas.width / 2, canvas.height / 2, '#10b981', 30);
    spawnFloatText(canvas.width / 2, canvas.height / 2 - 20, `รางวัลใหญ่! +$${cashReward.toLocaleString()} 👑`, '#10b981');
    notify('🎉', 'สปินชนะรางวัลใหญ่!', 'success');
  } else {
    // LOSE!
    let penaltyDesc = '';
    let flatDeduct = 0;
    
    switch (targetIdx) {
      case 1: // Lose 30% of cash
        const loss1 = Math.floor(S.cash * 0.30);
        S.cash -= loss1;
        penaltyDesc = `โชคร้าย! สูญเสียเงินสด 30% (-$${loss1.toLocaleString()}) 💀`;
        break;
      case 2: // Lose 50% of cash
        const loss2 = Math.floor(S.cash * 0.50);
        S.cash -= loss2;
        penaltyDesc = `โชคร้ายมาก! สูญเสียเงินสด 50% (-$${loss2.toLocaleString()}) 💀`;
        break;
      case 3: // Demolish 1 processing building + lose $200
        flatDeduct = Math.min(S.cash, 200);
        S.cash -= flatDeduct;
        const bType3 = demolishRandomBuilding([B.SMELTER, B.STEEL_MILL, B.REFINERY]);
        penaltyDesc = `เตาหลอมระเบิด! หักเงิน $200 ${bType3 ? `และทำลาย ${BLDG[bType3].name} 1 หลัง` : '(ไม่พบตึกเตาหลอม)'} 💥`;
        break;
      case 4: // Demolish 1 production/research building + lose $150
        flatDeduct = Math.min(S.cash, 150);
        S.cash -= flatDeduct;
        const bType4 = demolishRandomBuilding([B.ORE_MINE, B.RESEARCH_LAB]);
        penaltyDesc = `เหมือง/แล็บถล่ม! หักเงิน $150 ${bType4 ? `และทำลาย ${BLDG[bType4].name} 1 หลัง` : '(ไม่พบตึกดังกล่าว)'} ⛏️`;
        break;
      case 5: // Demolish 3 conveyors
        const countConveyors = demolishConveyors(3);
        penaltyDesc = `สายพานขาดสะบั้น! ทำลายสายพานสุ่ม ${countConveyors} ช่องในโรงงาน ⛓️`;
        break;
      case 6: // Demolish 1 random building + lose 20% cash
        const loss6 = Math.floor(S.cash * 0.20);
        S.cash -= loss6;
        const bType6 = demolishRandomBuilding(null); // null means any building
        penaltyDesc = `ภัยพิบัติโรงงาน! หักเงิน 20% (-$${loss6.toLocaleString()}) ${bType6 ? `และทำลาย ${BLDG[bType6].name} 1 หลัง` : ''} 💀`;
        break;
    }
    
    updateUI();
    if (resultMsg) {
      resultMsg.textContent = penaltyDesc;
      resultMsg.className = 'wheel-result-msg lose';
    }
    notify('💀', 'คุณหมุนได้ช่องบทลงโทษ!', 'error');
  }
}

function demolishRandomBuilding(typesArray) {
  // Find all coordinates containing building types in typesArray
  const matches = [];
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type === B.EMPTY || cell.type === B.ROAD || cell.type === B.CONVEYOR || cell.type === B.LUCKY_WHEEL) continue;
      if (!typesArray || typesArray.includes(cell.type)) {
        matches.push({ x, y, type: cell.type });
      }
    }
  }
  
  if (matches.length === 0) return null;
  
  const choice = matches[Math.floor(Math.random() * matches.length)];
  
  // Demolish it!
  const cell = S.grid[choice.y][choice.x];
  // Reduce count
  if (S.buildCounts[cell.type] > 0) S.buildCounts[cell.type]--;
  
  // Explode particles
  const px = choice.x * CFG.CELL + CFG.CELL / 2;
  const py = choice.y * CFG.CELL + CFG.CELL / 2;
  spawnParticles(px, py, '#ef4444', 15);
  spawnParticles(px, py, '#555555', 10);
  spawnFloatText(px, py - 10, 'ตูม! 💥', '#ef4444');
  
  // Reset cell
  S.grid[choice.y][choice.x] = createCell(B.EMPTY);
  
  // Auto-save silently to persist destruction
  saveGameSilent();
  return choice.type;
}

function demolishConveyors(count) {
  const matches = [];
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type === B.CONVEYOR) {
        matches.push({ x, y });
      }
    }
  }
  
  if (matches.length === 0) return 0;
  
  // Shuffle matches
  for (let i = matches.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [matches[i], matches[j]] = [matches[j], matches[i]];
  }
  
  const toDemolish = matches.slice(0, Math.min(count, matches.length));
  for (const choice of toDemolish) {
    const cell = S.grid[choice.y][choice.x];
    if (S.buildCounts[B.CONVEYOR] > 0) S.buildCounts[B.CONVEYOR]--;
    
    // Explode particles
    const px = choice.x * CFG.CELL + CFG.CELL / 2;
    const py = choice.y * CFG.CELL + CFG.CELL / 2;
    spawnParticles(px, py, '#777777', 6);
    
    S.grid[choice.y][choice.x] = createCell(B.EMPTY);
  }
  
  saveGameSilent();
  return toDemolish.length;
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 11: CANVAS RENDERER
// ═══════════════════════════════════════════════════════════════

let canvas, ctx;
let canvasContainer;

function initCanvas() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  canvasContainer = document.getElementById('canvas-container');
  resizeCanvas();
}

function resizeCanvas() {
  canvas.width = S.gridW * CFG.CELL;
  canvas.height = S.gridH * CFG.CELL;
}

function render(time) {
  const C = CFG.CELL;
  const W = canvas.width;
  const H = canvas.height;

  // Clear
  ctx.fillStyle = '#0a0b0e';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= S.gridW; x++) {
    ctx.beginPath();
    ctx.moveTo(x * C + 0.5, 0);
    ctx.lineTo(x * C + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= S.gridH; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * C + 0.5);
    ctx.lineTo(W, y * C + 0.5);
    ctx.stroke();
  }

  // Draw cells
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type !== B.EMPTY) {
        drawBuilding(ctx, cell, x, y, time);
      }
    }
  }

  // Draw items on conveyors
  for (let y = 0; y < S.gridH; y++) {
    for (let x = 0; x < S.gridW; x++) {
      const cell = S.grid[y][x];
      if (cell.type === B.CONVEYOR && cell.item) {
        drawItem(ctx, cell, x, y);
      }
    }
  }

  // Draw particles
  for (const p of S.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Draw floating texts
  for (const ft of S.floatTexts) {
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = `bold 13px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  // Draw golden ore
  drawGoldenOre(ctx);

  // Hover highlight
  if (hoveredCell && inBounds(hoveredCell.x, hoveredCell.y)) {
    const hx = hoveredCell.x * C;
    const hy = hoveredCell.y * C;

    if (S.selectedTool !== null && S.activeTool === 'select') {
      // Placement preview
      const canDo = canPlace(hoveredCell.x, hoveredCell.y, S.selectedTool);
      ctx.strokeStyle = canDo ? 'rgba(90,173,110,0.6)' : 'rgba(192,72,72,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(hx + 1, hy + 1, C - 2, C - 2);
      ctx.setLineDash([]);

      // Show direction preview for conveyors
      if (BLDG[S.selectedTool] && BLDG[S.selectedTool].directional) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(DIR_ARROWS[S.convDir], hx + C / 2, hy + C / 2);
      }
    } else if (S.activeTool === 'demolish') {
      ctx.strokeStyle = 'rgba(192,72,72,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(hx + 1, hy + 1, C - 2, C - 2);
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hx + 0.5, hy + 0.5, C - 1, C - 1);
    }
  }

  // Selection highlight
  if (S.selectedCell) {
    const sx = S.selectedCell.x * C;
    const sy = S.selectedCell.y * C;
    ctx.strokeStyle = 'rgba(201,168,76,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, C - 2, C - 2);

    // Corner accents
    const corner = 8;
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath(); ctx.moveTo(sx + 1, sy + corner); ctx.lineTo(sx + 1, sy + 1); ctx.lineTo(sx + corner, sy + 1); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(sx + C - corner, sy + 1); ctx.lineTo(sx + C - 1, sy + 1); ctx.lineTo(sx + C - 1, sy + corner); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(sx + 1, sy + C - corner); ctx.lineTo(sx + 1, sy + C - 1); ctx.lineTo(sx + corner, sy + C - 1); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(sx + C - corner, sy + C - 1); ctx.lineTo(sx + C - 1, sy + C - 1); ctx.lineTo(sx + C - 1, sy + C - corner); ctx.stroke();
  }
}

function drawBuilding(ctx, cell, gx, gy, time) {
  const C = CFG.CELL;
  const px = gx * C;
  const py = gy * C;
  const def = BLDG[cell.type];
  if (!def) return;

  const m = 2; // margin
  const w = C - m * 2;
  
  // Flat check: Conveyors and Roads are rendered flat on the ground
  const isFlat = cell.type === B.CONVEYOR || cell.type === B.ROAD;
  const depth = isFlat ? 0 : 5; // 5px 3D extrusion depth
  const h = C - m * 2 - depth;

  // Drop Shadow
  if (!isFlat) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(px + m + 2, py + m + depth, w, h);
  }

  // 3D Front Wall (extrusion)
  if (!isFlat) {
    ctx.fillStyle = def.colors.base;
    ctx.fillRect(px + m, py + m + h, w, depth);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; // Dark shading overlay
    ctx.fillRect(px + m, py + m + h, w, depth);
  }

  // Top Face Base
  const grad = ctx.createLinearGradient(px + m, py + m, px + m, py + m + h);
  grad.addColorStop(0, def.colors.top);
  grad.addColorStop(1, def.colors.base);
  ctx.fillStyle = grad;
  ctx.fillRect(px + m, py + m, w, h);

  // Top Face Border
  ctx.strokeStyle = def.colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + m + 0.5, py + m + 0.5, w - 1, h - 1);

  // Glow for active buildings (renders on the top face)
  if (cell.type === B.SMELTER || cell.type === B.STEEL_MILL || cell.type === B.REFINERY) {
    if (cell.processing) {
      const pulse = 0.4 + Math.sin(time * 4) * 0.2;
      ctx.shadowColor = def.colors.border;
      ctx.shadowBlur = 12 * pulse;
      ctx.strokeStyle = def.colors.border;
      ctx.strokeRect(px + m + 0.5, py + m + 0.5, w - 1, h - 1);
      ctx.shadowBlur = 0;
    }
  }

  if (cell.type === B.COLLECTOR) {
    const pulse = 0.5 + Math.sin(time * 2) * 0.15;
    ctx.shadowColor = '#f0d060';
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = 'rgba(240,208,96,0.4)';
    ctx.strokeRect(px + m + 0.5, py + m + 0.5, w - 1, h - 1);
    ctx.shadowBlur = 0;
  }

  // Translate context upwards to center inner contents on the 3D top face!
  if (!isFlat) {
    ctx.translate(0, -depth / 2);
  }

  // Draw type-specific content
  if (cell.type === B.CONVEYOR) {
    drawConveyorBelt(ctx, cell, px, py, C, time);
  } else if (cell.type === B.ORE_MINE) {
    drawMineContent(ctx, cell, px, py, C, time);
  } else if (cell.type === B.SMELTER || cell.type === B.STEEL_MILL || cell.type === B.REFINERY) {
    drawProcessorContent(ctx, cell, px, py, C, time);
  } else if (cell.type === B.STORAGE) {
    drawStorageContent(ctx, cell, px, py, C);
  } else if (cell.type === B.RESEARCH_LAB) {
    drawResearchLabContent(ctx, cell, px, py, C, gx, gy);
  } else {
    // Generic: draw icon
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `${C * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.icon, px + C / 2, py + C / 2);
  }

  // Level badge
  if (cell.level > 1) {
    const bx = px + C - 14;
    const by = py + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.arc(bx + 5, by + 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cell.level, bx + 5, by + 5);
  }

  // Restore translation
  if (!isFlat) {
    ctx.translate(0, depth / 2);
  }
}

function drawConveyorBelt(ctx, cell, px, py, C, time) {
  const m = 6;
  const dir = cell.dir;
  const speed = BLDG[B.CONVEYOR].stats(cell.level).speed;

  // Belt track
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  if (dir === DIR.RIGHT || dir === DIR.LEFT) {
    ctx.fillRect(px + m, py + C * 0.35, C - m * 2, C * 0.3);
  } else {
    ctx.fillRect(px + C * 0.35, py + m, C * 0.3, C - m * 2);
  }

  // Animated dashes
  const dashLen = 6;
  const gap = 8;
  const offset = ((time * speed * 30) % (dashLen + gap));
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;

  if (dir === DIR.RIGHT || dir === DIR.LEFT) {
    const sign = dir === DIR.RIGHT ? 1 : -1;
    const startX = dir === DIR.RIGHT ? px + m - offset : px + C - m + offset;
    for (let i = -1; i < C / (dashLen + gap) + 1; i++) {
      const dx = startX + i * (dashLen + gap) * sign;
      ctx.beginPath();
      ctx.moveTo(dx, py + C / 2);
      ctx.lineTo(dx + dashLen * sign, py + C / 2);
      ctx.stroke();
    }
  } else {
    const sign = dir === DIR.DOWN ? 1 : -1;
    const startY = dir === DIR.DOWN ? py + m - offset : py + C - m + offset;
    for (let i = -1; i < C / (dashLen + gap) + 1; i++) {
      const dy = startY + i * (dashLen + gap) * sign;
      ctx.beginPath();
      ctx.moveTo(px + C / 2, dy);
      ctx.lineTo(px + C / 2, dy + dashLen * sign);
      ctx.stroke();
    }
  }

  // Direction arrow
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(DIR_ARROWS[dir], px + C / 2, py + C / 2);
}

function drawMineContent(ctx, cell, px, py, C, time) {
  // Mine icon
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `${C * 0.38}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⛏', px + C / 2, py + C / 2 - 4);

  // Buffer indicator
  if (cell.buffer > 0) {
    for (let i = 0; i < cell.buffer; i++) {
      ctx.fillStyle = '#8b6914';
      ctx.beginPath();
      ctx.arc(px + 10 + i * 8, py + C - 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Production progress bar
  const stats = BLDG[B.ORE_MINE].stats(cell.level);
  const interval = stats.prodInterval;
  const prog = clamp(cell.prodTimer / interval, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(px + 4, py + C - 6, C - 8, 3);
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(px + 4, py + C - 6, (C - 8) * prog, 3);
}

function drawProcessorContent(ctx, cell, px, py, C, time) {
  const def = BLDG[cell.type];

  // Icon
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${C * 0.38}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.icon, px + C / 2, py + C / 2 - 4);

  // Processing progress
  if (cell.processing) {
    const stats = def.stats(cell.level);
    const prog = clamp(cell.processTimer / stats.processTime, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 4, py + C - 6, C - 8, 3);
    ctx.fillStyle = def.colors.border;
    ctx.fillRect(px + 4, py + C - 6, (C - 8) * prog, 3);

    // Fire particles
    if (Math.random() < 0.15) {
      spawnParticles(
        px + C / 2 + (Math.random() - 0.5) * 10,
        py + C * 0.3,
        def.colors.border, 1
      );
    }
  }

  // Output buffer indicator
  if (cell.outputBuffer > 0) {
    ctx.fillStyle = cell.type === B.REFINERY ? '#0088ff' : '#aaa';
    for (let i = 0; i < Math.min(cell.outputBuffer, 3); i++) {
      ctx.beginPath();
      ctx.arc(px + 10 + i * 8, py + 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStorageContent(ctx, cell, px, py, C) {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `${C * 0.3}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📦', px + C / 2, py + C / 2 - 6);

  // Count
  const cap = BLDG[B.STORAGE].stats(cell.level).capacity;
  ctx.fillStyle = cell.stored >= cap ? '#c04848' : 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText(`${cell.stored}/${cap}`, px + C / 2, py + C - 10);
}

function drawResearchLabContent(ctx, cell, px, py, C, gx, gy) {
  // Icon
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${C * 0.38}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔬', px + C / 2, py + C / 2 - 4);

  // Progress Bar
  const stats = BLDG[B.RESEARCH_LAB].stats(cell.level);
  const interval = stats.rpInterval / getPowerBoost(gx, gy);
  const prog = clamp(cell.prodTimer / interval, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(px + 4, py + C - 6, C - 8, 3);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(px + 4, py + C - 6, (C - 8) * prog, 3);

  // Little particles occasionally
  if (Math.random() < 0.05) {
    spawnParticles(
      px + C / 2 + (Math.random() - 0.5) * 8,
      py + C / 2 + (Math.random() - 0.5) * 8,
      '#10b981', 1
    );
  }
}

function drawItem(ctx, cell, gx, gy) {
  const C = CFG.CELL;
  const prog = clamp(cell.itemProgress, 0, 1);
  const dir = cell.dir;

  // Calculate position
  const ix = (gx + 0.5 + DX[dir] * (prog - 0.5)) * C;
  const iy = (gy + 0.5 + DY[dir] * (prog - 0.5)) * C;

  // Item appearance
  let color, glowColor, size;
  switch (cell.item) {
    case 'ore':
      color = '#8b6914';
      glowColor = 'rgba(139,105,20,0.4)';
      size = 5;
      break;
    case 'steel':
      color = '#9aa0b0';
      glowColor = 'rgba(154,160,176,0.4)';
      size = 5;
      break;
    case 'product':
      color = '#4a7acc';
      glowColor = 'rgba(74,122,204,0.4)';
      size = 6;
      break;
    default:
      color = '#888';
      glowColor = 'rgba(136,136,136,0.3)';
      size = 4;
  }

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 6;
  ctx.fillStyle = color;
  ctx.fillRect(ix - size, iy - size, size * 2, size * 2);
  ctx.shadowBlur = 0;

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(ix - size + 1, iy - size + 1, size * 2 - 2, size - 1);
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 12: UI SYSTEM
// ═══════════════════════════════════════════════════════════════

function updateUI() {
  updateDashboard();
  populateBuildTab();
  populateExpandTab();
  populateCodex();
  populateResearchTab();
  if (S.selectedCell) updateUpgradeTab();
}

function updateDashboard() {
  document.getElementById('cash-value').textContent = formatCash(S.cash);
  document.getElementById('income-value').textContent = formatCash(S.incomePerSec) + '/s';
  document.getElementById('produced-value').textContent = S.totalProduced.toLocaleString();
  document.getElementById('stage-value').textContent = STAGES[S.stage].name;
}

function populateBuildTab() {
  const container = document.getElementById('tab-build');
  const unlocked = getUnlockedTypes();
  const fragment = document.createDocumentFragment();

  for (const cat of CATEGORIES) {
    const catBuildings = Object.entries(BLDG)
      .filter(([id, def]) => def.category === cat.id)
      .map(([id, def]) => ({ id: parseInt(id), def }));

    if (catBuildings.length === 0) continue;

    const section = document.createElement('div');
    section.className = 'build-category';
    section.innerHTML = `<div class="build-category-title">${cat.label}</div>`;

    for (const { id, def } of catBuildings) {
      const isLocked = !unlocked.includes(id);
      const cost = getCost(id);
      const tooExpensive = S.cash < cost;
      const isActive = S.selectedTool === id;

      const btn = document.createElement('button');
      btn.className = 'build-btn' + (isActive ? ' active' : '') + (isLocked ? ' locked' : '');
      btn.innerHTML = `
        <span class="b-icon">${def.icon}</span>
        <span class="b-info">
          <span class="b-name">${def.name}${isLocked ? ' 🔒' : ''}</span>
          <span class="b-desc">${def.desc}</span>
        </span>
        <span class="b-cost ${tooExpensive && !isLocked ? 'too-expensive' : ''}">${isLocked ? 'ระดับ ' + (def.unlockStage + 1) : formatCash(cost)}</span>
      `;

      if (!isLocked) {
        btn.addEventListener('click', () => {
          S.selectedTool = (S.selectedTool === id) ? null : id;
          S.activeTool = S.selectedTool !== null ? 'select' : 'select';
          S.selectedCell = null;
          updateToolbarButtons();
          populateBuildTab();
          clearUpgradeTab();
          updateHint();
        });
      }

      section.appendChild(btn);
    }

    fragment.appendChild(section);
  }

  container.innerHTML = '';
  container.appendChild(fragment);
}

function populateExpandTab() {
  const container = document.getElementById('tab-expand');
  container.innerHTML = '';

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const isCurrent = i === S.stage;
    const isCompleted = i < S.stage;
    const isLocked = i > S.stage;
    const isNext = i === S.stage + 1;

    const card = document.createElement('div');
    card.className = 'expand-card' + (isCurrent ? ' current' : '') + (isLocked && !isNext ? ' locked' : '');

    let badge = '';
    if (isCurrent) badge = '<span class="stage-badge active">ปัจจุบัน</span>';
    else if (isCompleted) badge = '<span class="stage-badge completed">สำเร็จแล้ว</span>';
    else badge = '<span class="stage-badge locked-badge">ล็อกอยู่</span>';

    let progressHtml = '';
    if (isNext) {
      const progress = clamp(S.totalEarned / stage.cashReq, 0, 1);
      progressHtml = `
        <div class="stage-req">ต้องการรายได้รวม <strong>${formatCash(stage.cashReq)}</strong> (${Math.floor(progress * 100)}%)</div>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${progress * 100}%"></div></div>
        <button class="expand-btn" id="expand-btn-${i}" ${canAdvanceStage() ? '' : 'disabled'}>
          ${canAdvanceStage() ? '🔓 ปลดล็อก ' + stage.name : '🔒 สะสมรายได้เพิ่ม...'}
        </button>
      `;
    } else if (isLocked) {
      progressHtml = `<div class="stage-req">ต้องการรายได้รวม <strong>${formatCash(stage.cashReq)}</strong></div>`;
    }

    card.innerHTML = `
      <h3>${stage.name} ${badge}</h3>
      <div class="stage-desc">${stage.desc}</div>
      <div class="stage-desc" style="color:var(--text-muted)">ขนาดแผนที่: ${stage.gridW}×${stage.gridH}</div>
      ${progressHtml}
    `;

    container.appendChild(card);
  }
}

let activeCodexTab = 'items';

function populateCodex() {
  const container = document.getElementById('codex-list');
  if (!container) return;
  container.innerHTML = '';

  if (activeCodexTab === 'items') {
    const items = [
      {
        id: 'ore',
        name: 'แร่เหล็กดิบ',
        icon: '🪨',
        desc: 'แร่เหล็กดิบที่ขุดได้จากใต้ดิน มีน้ำหนักมากและยังไม่ผ่านกระบวนการ ต้องนำไปหลอมในเตาหลอมก่อนจึงจะนำไปใช้ผลิตต่อหรือขายได้เต็มราคา',
        source: 'เหมืองแร่ ⛏️',
        value: '$4 - $12 (40% ของราคาดิบ)',
        recipe: ['เหมืองแร่', 'เตาหลอม'],
        class: 'ore'
      },
      {
        id: 'steel',
        name: 'เหล็กเส้น',
        icon: '🔩',
        desc: 'โลหะผสมที่ผ่านการหลอมเหลวและขึ้นรูป มีความแข็งแรงทนทาน เป็นเสาหลักของเศรษฐกิจโรงงานของคุณ พร้อมส่งออกขายทำกำไรหรือนำไปแปรรูปขั้นสูงต่อ',
        source: 'เตาหลอม 🔥 หรือ โรงงานเหล็กกล้า 🏭',
        value: '$10 - $30 (100% ของราคาเต็ม)',
        recipe: ['แร่เหล็ก', 'เตาหลอม', 'เหล็กเส้น'],
        class: 'steel'
      },
      {
        id: 'product',
        name: 'สินค้าเหล็กแปรรูป',
        icon: '💎',
        desc: 'ชิ้นส่วนเหล็กความแม่นยำสูงและสินค้าสำเร็จรูปที่หรูหรา แม้จะผลิตได้ยากแต่มีมูลค่าสูงมากในตลาดคู่ค้า ช่วยสร้างรายได้มหาศาลให้กับโรงงานของคุณ',
        source: 'โรงกลั่นเหล็ก 🏗️',
        value: '$30 - $90 (300% ของราคาพรีเมียม)',
        recipe: ['เหล็กเส้น', 'โรงกลั่น', 'สินค้าแปรรูป'],
        class: 'product'
      }
    ];

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `item-card ${item.class}`;

      const recipeHtml = item.recipe.map((step, idx) => {
        if (idx === item.recipe.length - 1) {
          return `<span class="item-recipe-step" style="color:var(--gold)">${step}</span>`;
        }
        return `<span class="item-recipe-step">${step}</span>`;
      }).join(' <span class="item-recipe-arrow">→</span> ');

      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-card-icon">${item.icon}</span>
          <span class="item-card-title">${item.name}</span>
        </div>
        <div class="item-card-desc">${item.desc}</div>
        
        <div class="item-meta-row">
          <span class="item-meta-label">แหล่งผลิต</span>
          <span class="item-meta-value">${item.source}</span>
        </div>
        <div class="item-meta-row">
          <span class="item-meta-label">มูลค่าส่งออก</span>
          <span class="item-meta-value ${item.id === 'product' ? 'value-premium' : (item.id === 'steel' ? 'value-good' : '')}">${item.value}</span>
        </div>
        <div class="item-recipe-chain">
          ${recipeHtml}
        </div>
      `;
      container.appendChild(card);
    });
  } else {
    // Render Buildings
    const bldgs = Object.entries(BLDG).map(([id, b]) => ({
      id: parseInt(id),
      ...b
    }));

    // Sort by unlockStage first
    bldgs.sort((a, b) => a.unlockStage - b.unlockStage);

    bldgs.forEach(b => {
      const isUnlocked = S.stage >= b.unlockStage;
      const card = document.createElement('div');
      card.className = 'bldg-card';
      if (!isUnlocked) {
        card.style.opacity = '0.5';
      }

      // Border matching building theme
      card.style.borderLeft = `3px solid ${b.colors.border}`;

      // Stats explanation if unlocked
      let statsHtml = '';
      if (isUnlocked && b.stats) {
        const lv1 = b.stats(1);
        const lvMax = b.stats(b.maxLevel);
        for (const [k, v] of Object.entries(lv1)) {
          const label = (b.statLabels && b.statLabels[k]) || k;
          const maxVal = lvMax[k];
          if (maxVal !== undefined && maxVal !== v) {
            statsHtml += `
              <div class="bldg-meta-row">
                <span class="bldg-meta-label">${label}</span>
                <span class="bldg-meta-value">${v} <span style="color:var(--green)">→ ${maxVal}</span></span>
              </div>
            `;
          } else {
            statsHtml += `
              <div class="bldg-meta-row">
                <span class="bldg-meta-label">${label}</span>
                <span class="bldg-meta-value">${v}</span>
              </div>
            `;
          }
        }
      }

      card.innerHTML = `
        <div class="bldg-card-header">
          <span class="bldg-card-icon" style="color:${b.colors.border}; background:${b.colors.base}">${b.icon}</span>
          <span class="bldg-card-title">${b.name} ${isUnlocked ? '' : '🔒'}</span>
        </div>
        <div class="bldg-card-desc">${b.desc}</div>
        <div class="bldg-card-meta">
          <div class="bldg-meta-row">
            <span class="bldg-meta-label">ราคาเริ่มต้น</span>
            <span class="bldg-meta-value value-cost">${formatCash(b.baseCost)}</span>
          </div>
          <div class="bldg-meta-row">
            <span class="bldg-meta-label">ระดับสูงสุด</span>
            <span class="bldg-meta-value">${b.maxLevel}</span>
          </div>
          <div class="bldg-meta-row">
            <span class="bldg-meta-label">ระดับที่ปลดล็อก</span>
            <span class="bldg-meta-value">${STAGES[b.unlockStage].name}</span>
          </div>
          ${statsHtml}
        </div>
      `;
      container.appendChild(card);
    });
  }
}

function populateResearchTab() {
  const container = document.getElementById('research-list');
  if (!container) return;
  container.innerHTML = '';

  // Update RP label
  const rpValueEl = document.getElementById('rp-value');
  if (rpValueEl) {
    rpValueEl.textContent = S.rp + ' RP';
  }

  const techs = Object.entries(TECH);
  techs.forEach(([id, tech]) => {
    const currentLevel = S.research[id] || 0;
    const isMax = currentLevel >= tech.maxLevel;
    const cost = isMax ? 0 : tech.cost[currentLevel];
    const canAfford = S.rp >= cost;

    const card = document.createElement('div');
    card.className = 'tech-card';

    let footerHtml = '';
    if (isMax) {
      footerHtml = `
        <div class="tech-card-footer">
          <span class="tech-card-cost">วิจัยสำเร็จแล้ว</span>
          <button class="tech-btn completed" disabled>วิจัยเสร็จสิ้น</button>
        </div>
      `;
    } else {
      footerHtml = `
        <div class="tech-card-footer">
          <span class="tech-card-cost">ราคา: <strong>${cost} RP</strong></span>
          <button class="tech-btn" id="tech-btn-${id}" ${canAfford ? '' : 'disabled'}>
            🔬 วิจัย (Lv.${currentLevel + 1})
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="tech-card-header">
        <div class="tech-card-title-group">
          <span class="tech-card-icon">${tech.icon}</span>
          <span class="tech-card-title">${tech.name}</span>
        </div>
        <span class="tech-card-level">Lv. ${currentLevel} / ${tech.maxLevel}</span>
      </div>
      <div class="tech-card-desc">${tech.desc}</div>
      ${footerHtml}
    `;

    container.appendChild(card);

    if (!isMax && canAfford) {
      document.getElementById(`tech-btn-${id}`).addEventListener('click', () => {
        buyResearch(id, cost);
      });
    }
  });
}

function buyResearch(id, cost) {
  if (S.rp < cost) return;
  S.rp -= cost;
  S.research[id] = (S.research[id] || 0) + 1;
  notify('🔬', `วิจัยสำเร็จ: ${TECH[id].name} (Lv.${S.research[id]})`, 'success');
  
  // Re-render
  updateUI();
}

function updateUpgradeTab() {
  if (!S.selectedCell) return;
  const { x, y } = S.selectedCell;
  const cell = getCell(x, y);
  if (!cell || cell.type === B.EMPTY) {
    clearUpgradeTab();
    return;
  }

  const def = BLDG[cell.type];
  const stats = def.stats(cell.level);
  const isMaxLevel = cell.level >= def.maxLevel;
  const upgradeCost = isMaxLevel ? 0 : getUpgradeCost(cell.type, cell.level);
  const canAfford = S.cash >= upgradeCost;

  document.getElementById('upgrade-empty').classList.add('hidden');
  const content = document.getElementById('upgrade-content');
  content.classList.remove('hidden');

  let statsHtml = '';
  for (const [key, value] of Object.entries(stats)) {
    const label = (def.statLabels && def.statLabels[key]) || key;
    let nextVal = '';
    if (!isMaxLevel) {
      const nextStats = def.stats(cell.level + 1);
      if (nextStats[key] !== undefined && nextStats[key] !== value) {
        nextVal = `<span class="stat-next">→ ${nextStats[key]}</span>`;
      }
    }
    statsHtml += `
      <div class="upgrade-stat-row">
        <span class="stat-name">${label}</span>
        <span><span class="stat-val">${value}</span>${nextVal}</span>
      </div>
    `;
  }

  // Direction control for conveyors
  let dirHtml = '';
  if (def.directional) {
    dirHtml = `
      <div class="upgrade-stat-row" style="cursor:pointer" id="rotate-btn">
        <span class="stat-name">ทิศทาง</span>
        <span class="stat-val">${DIR_ARROWS[cell.dir]} ${DIR_NAMES[cell.dir]} (คลิกเพื่อหมุน)</span>
      </div>
    `;
  }

  content.innerHTML = `
    <div class="upgrade-card">
      <div class="upgrade-header">
        <span class="upgrade-icon">${def.icon}</span>
        <div class="upgrade-title">
          <h3>${def.name}</h3>
          <span class="upgrade-level">เลเวล ${cell.level} / ${def.maxLevel}</span>
        </div>
      </div>
      <div class="upgrade-stats">
        ${statsHtml}
        ${dirHtml}
      </div>
      ${isMaxLevel ?
        '<button class="upgrade-btn max-level" disabled>ระดับสูงสุด</button>' :
        `<button class="upgrade-btn" id="do-upgrade" ${canAfford ? '' : 'disabled'}>
          ⬆️ อัปเกรดเป็น Lv.${cell.level + 1} — ${formatCash(upgradeCost)}
        </button>`
      }
      <button class="demolish-btn" id="do-demolish">🗑️ ทำลาย (รับเงินคืน 50%)</button>
    </div>
  `;

  // Event listeners
  const upgradeBtn = document.getElementById('do-upgrade');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      upgradeBuilding(x, y);
      updateUpgradeTab();
    });
  }

  const demolishBtn = document.getElementById('do-demolish');
  if (demolishBtn) {
    demolishBtn.addEventListener('click', () => {
      removeBuilding(x, y);
      clearUpgradeTab();
    });
  }

  const rotateBtn = document.getElementById('rotate-btn');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      cell.dir = (cell.dir + 1) % 4;
      updateUpgradeTab();
    });
  }
}

function clearUpgradeTab() {
  document.getElementById('upgrade-empty').classList.remove('hidden');
  document.getElementById('upgrade-content').classList.add('hidden');
  document.getElementById('upgrade-content').innerHTML = '';
}

function switchTab(tabName) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabName));
  
  if (tabName === 'build') {
    populateBuildTab();
  } else if (tabName === 'expand') {
    populateExpandTab();
  } else if (tabName === 'upgrade') {
    updateUpgradeTab();
  } else if (tabName === 'codex') {
    populateCodex();
  } else if (tabName === 'research') {
    populateResearchTab();
  }
}

function updateToolbarButtons() {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === S.activeTool);
  });
}

function updateHint() {
  const hint = document.getElementById('toolbar-hint');
  if (S.selectedTool !== null) {
    const def = BLDG[S.selectedTool];
    let extra = '';
    if (def.directional) extra = ` | คลิกขวาเพื่อหมุน (${DIR_NAMES[S.convDir]})`;
    hint.textContent = `วาง ${def.name} — ${formatCash(getCost(S.selectedTool))}${extra}`;
  } else if (S.activeTool === 'demolish') {
    hint.textContent = 'คลิกสิ่งก่อสร้างเพื่อทำลาย (รับคืน 50%)';
  } else {
    hint.textContent = 'เลือกสิ่งก่อสร้างจากแผงเมนู หรือคลิกสิ่งก่อสร้างบนแผนที่เพื่อดูตัวเลือกการอัปเกรด';
  }
}

// Notifications
function notify(icon, message, type) {
  const container = document.getElementById('notifs');
  const el = document.createElement('div');
  el.className = 'notif ' + (type || 'info');
  el.innerHTML = `<span class="notif-icon">${icon}</span><span class="notif-text">${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 13: INPUT SYSTEM
// ═══════════════════════════════════════════════════════════════

let hoveredCell = null;

function setupInput() {
  // Canvas mouse events
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor(mx / CFG.CELL);
    const gy = Math.floor(my / CFG.CELL);
    hoveredCell = inBounds(gx, gy) ? { x: gx, y: gy } : null;
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredCell = null;
  });

  canvas.addEventListener('click', (e) => {
    if (S.goldenOre && S.goldenOre.active) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      
      const dx = mx - S.goldenOre.x;
      const dy = my - S.goldenOre.y;
      const distVal = Math.sqrt(dx * dx + dy * dy);
      
      if (distVal <= S.goldenOre.size + 12) {
        collectGoldenOre();
        return;
      }
    }

    if (!hoveredCell) return;
    const { x, y } = hoveredCell;

    if (S.activeTool === 'demolish') {
      removeBuilding(x, y);
      return;
    }

    if (S.selectedTool !== null) {
      // Place building
      if (placeBuilding(x, y, S.selectedTool)) {
        // Keep tool selected for rapid placement
        populateBuildTab();
      }
      return;
    }

    // Select building for upgrade
    const cell = getCell(x, y);
    if (cell && cell.type === B.LUCKY_WHEEL) {
      openLuckyWheelModal(x, y);
      return;
    }
    if (cell && cell.type !== B.EMPTY) {
      S.selectedCell = { x, y };
      switchTab('upgrade');
      updateUpgradeTab();
    } else {
      S.selectedCell = null;
      clearUpgradeTab();
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Rotate conveyor direction
    S.convDir = (S.convDir + 1) % 4;
    updateHint();

    // If hovering over a placed conveyor, rotate it too
    if (hoveredCell) {
      const cell = getCell(hoveredCell.x, hoveredCell.y);
      if (cell && cell.type === B.CONVEYOR) {
        cell.dir = (cell.dir + 1) % 4;
        if (S.selectedCell && S.selectedCell.x === hoveredCell.x && S.selectedCell.y === hoveredCell.y) {
          updateUpgradeTab();
        }
      }
    }
  });

  // Toolbar buttons
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.activeTool = btn.dataset.tool;
      if (btn.dataset.tool === 'demolish') {
        S.selectedTool = null;
      }
      updateToolbarButtons();
      populateBuildTab();
      updateHint();
    });
  });

  // Panel tabs
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      S.convDir = (S.convDir + 1) % 4;
      updateHint();
      // Rotate hovered conveyor
      if (hoveredCell) {
        const cell = getCell(hoveredCell.x, hoveredCell.y);
        if (cell && cell.type === B.CONVEYOR) {
          cell.dir = (cell.dir + 1) % 4;
        }
      }
    }
    if (e.key === 'Escape') {
      S.selectedTool = null;
      S.selectedCell = null;
      S.activeTool = 'select';
      updateToolbarButtons();
      populateBuildTab();
      clearUpgradeTab();
      updateHint();
    }
    if (e.key === 'x' || e.key === 'X') {
      S.activeTool = S.activeTool === 'demolish' ? 'select' : 'demolish';
      S.selectedTool = null;
      updateToolbarButtons();
      populateBuildTab();
      updateHint();
    }
    if (e.key === ' ') {
      e.preventDefault();
      toggleSpeed();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveGame();
    }

    // Number keys for quick building select
    const numKeys = ['1','2','3','4','5','6','7','8','9'];
    const idx = numKeys.indexOf(e.key);
    if (idx >= 0) {
      const unlocked = getUnlockedTypes();
      if (idx < unlocked.length) {
        const typeId = unlocked[idx];
        S.selectedTool = (S.selectedTool === typeId) ? null : typeId;
        S.activeTool = 'select';
        updateToolbarButtons();
        populateBuildTab();
        updateHint();
      }
    }
  });

  // Dashboard buttons
  document.getElementById('btn-save').addEventListener('click', saveGame);
  document.getElementById('btn-load').addEventListener('click', loadGame);
  document.getElementById('btn-speed').addEventListener('click', toggleSpeed);
  document.getElementById('btn-reset').addEventListener('click', resetGame);

  // Expand tab buttons (via event delegation)
  document.getElementById('tab-expand').addEventListener('click', (e) => {
    const btn = e.target.closest('.expand-btn');
    if (btn && canAdvanceStage()) {
      advanceStage();
    }
  });

  // Modal
  document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
  });

  // Codex toggles
  document.getElementById('toggle-codex-items').addEventListener('click', () => {
    activeCodexTab = 'items';
    document.getElementById('toggle-codex-items').classList.add('active');
    document.getElementById('toggle-codex-buildings').classList.remove('active');
    populateCodex();
  });
  document.getElementById('toggle-codex-buildings').addEventListener('click', () => {
    activeCodexTab = 'buildings';
    document.getElementById('toggle-codex-items').classList.remove('active');
    document.getElementById('toggle-codex-buildings').classList.add('active');
    populateCodex();
  });

  // Lucky Wheel Modal
  document.getElementById('btn-spin-wheel').addEventListener('click', spinLuckyWheel);
  document.getElementById('btn-close-wheel').addEventListener('click', () => {
    if (!isSpinning) {
      document.getElementById('modal-wheel').classList.add('hidden');
    }
  });
  document.getElementById('wheel-canvas').addEventListener('transitionend', resolveSpinOutcome);
}

function toggleSpeed() {
  S.speed = S.speed === 1 ? 2 : (S.speed === 2 ? 3 : 1);
  const btn = document.getElementById('btn-speed');
  btn.textContent = S.speed === 1 ? '▶ 1×' : (S.speed === 2 ? '⏩ 2×' : '⏩ 3×');
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 14: SAVE / LOAD SYSTEM
// ═══════════════════════════════════════════════════════════════

function saveGame() {
  const data = {
    version: 2,
    cash: S.cash,
    totalEarned: S.totalEarned,
    totalProduced: S.totalProduced,
    stage: S.stage,
    gridW: S.gridW,
    gridH: S.gridH,
    buildCounts: S.buildCounts,
    rp: S.rp,
    research: S.research,
    overdriveTimer: S.overdriveTimer,
    grid: S.grid.map(row => row.map(cell => ({
      t: cell.type,
      l: cell.level,
      d: cell.dir,
      pt: cell.prodTimer,
      bu: cell.buffer,
      pr: cell.processing ? 1 : 0,
      prt: cell.processTimer,
      ob: cell.outputBuffer,
      it: cell.inputType,
      ci: cell.item,
      cp: cell.itemProgress,
      st: cell.stored,
      stt: cell.storedType,
    }))),
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem('steelTycoon_save', JSON.stringify(data));
    notify('💾', 'บันทึกเกมสำเร็จแล้ว!', 'success');
  } catch (e) {
    notify('❌', 'บันทึกเกมล้มเหลว: ' + e.message, 'error');
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('steelTycoon_save');
    if (!raw) {
      notify('📂', 'ไม่พบข้อมูลบันทึกเกมเก่า', 'warning');
      return false;
    }
    const data = JSON.parse(raw);

    S.cash = data.cash || CFG.START_CASH;
    S.totalEarned = data.totalEarned || 0;
    S.totalProduced = data.totalProduced || 0;
    S.stage = data.stage || 0;
    S.gridW = data.gridW || CFG.INIT_W;
    S.gridH = data.gridH || CFG.INIT_H;
    S.buildCounts = data.buildCounts || {};
    S.rp = data.rp || 0;
    S.research = data.research || {
      conveyor_speed: 0,
      smelter_speed: 0,
      mine_speed: 0,
      collector_income: 0
    };
    S.overdriveTimer = data.overdriveTimer || 0;

    S.grid = createGrid(S.gridW, S.gridH);
    if (data.grid) {
      for (let y = 0; y < S.gridH && y < data.grid.length; y++) {
        for (let x = 0; x < S.gridW && x < data.grid[y].length; x++) {
          const d = data.grid[y][x];
          const cell = S.grid[y][x];
          cell.type = d.t || B.EMPTY;
          cell.level = d.l || 1;
          cell.dir = d.d || 0;
          cell.prodTimer = d.pt || 0;
          cell.buffer = d.bu || 0;
          cell.processing = d.pr === 1;
          cell.processTimer = d.prt || 0;
          cell.outputBuffer = d.ob || 0;
          cell.inputType = d.it || null;
          cell.item = d.ci || null;
          cell.itemProgress = d.cp || 0;
          cell.stored = d.st || 0;
          cell.storedType = d.stt || null;
        }
      }
    }

    resizeCanvas();
    S.selectedCell = null;
    S.selectedTool = null;
    updateUI();
    notify('📂', 'โหลดข้อมูลเกมเก่าสำเร็จแล้ว!', 'success');
    document.getElementById('modal-overlay').classList.add('hidden');
    return true;
  } catch (e) {
    notify('❌', 'โหลดเกมล้มเหลว: ' + e.message, 'error');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 15: GAME LOOP
// ═══════════════════════════════════════════════════════════════

let lastFrameTime = 0;
let uiUpdateAccum = 0;

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (lastFrameTime === 0) { lastFrameTime = timestamp; return; }

  let rawDt = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;

  // Cap delta to prevent spiral
  rawDt = Math.min(rawDt, 0.1);

  // Update overdrive timer (real-time seconds, not sped up)
  if (S.overdriveTimer > 0) {
    S.overdriveTimer = Math.max(0, S.overdriveTimer - rawDt);
    
    // Update overdrive HUD
    const hud = document.getElementById('overdrive-hud');
    if (hud) {
      hud.classList.remove('hidden');
      const timeVal = document.getElementById('overdrive-time-val');
      if (timeVal) {
        timeVal.textContent = S.overdriveTimer.toFixed(1);
      }
      const progress = document.getElementById('overdrive-progress');
      if (progress) {
        const pct = (S.overdriveTimer / 15.0) * 100;
        progress.style.width = `${pct}%`;
      }
    }
  } else {
    const hud = document.getElementById('overdrive-hud');
    if (hud && !hud.classList.contains('hidden')) {
      hud.classList.add('hidden');
    }
  }

  const speedMult = (S.overdriveTimer > 0) ? 2.0 : 1.0;
  const dt = rawDt * S.speed * speedMult;
  const time = timestamp / 1000;

  S.gameTime += dt;

  // Update systems
  updateMines(dt);
  updateSmelters(dt);
  updateConveyors(dt);
  updateStorage(dt);
  updateResearchLabs(dt);
  updateGoldenOre(rawDt); // Update golden ore position in real-time, not sped up by overdrive
  updateParticles(dt);
  updateIncomeRate();

  // Periodic UI update
  uiUpdateAccum += rawDt;
  if (uiUpdateAccum >= 0.5) {
    uiUpdateAccum = 0;
    updateDashboard();
    
    // Periodically update expand tab progress if it's currently active
    const expandTab = document.getElementById('tab-expand');
    if (expandTab && expandTab.classList.contains('active')) {
      populateExpandTab();
    }
    
    // Periodically update research tab if it's currently active
    const researchTab = document.getElementById('tab-research');
    if (researchTab && researchTab.classList.contains('active')) {
      populateResearchTab();
    }
    
    // Flash cash
    const el = document.getElementById('cash-value');
    if (S.incomePerSec > 0 && !el.classList.contains('cash-flash')) {
      el.classList.add('cash-flash');
      setTimeout(() => el.classList.remove('cash-flash'), 500);
    }
  }

  // Autosave
  S.autosaveAccum += rawDt;
  if (S.autosaveAccum >= CFG.AUTOSAVE_INTERVAL) {
    S.autosaveAccum = 0;
    saveGameSilent();
  }

  // Render
  render(time);
}

function saveGameSilent() {
  const data = {
    version: 2,
    cash: S.cash,
    totalEarned: S.totalEarned,
    totalProduced: S.totalProduced,
    stage: S.stage,
    gridW: S.gridW,
    gridH: S.gridH,
    buildCounts: S.buildCounts,
    rp: S.rp,
    research: S.research,
    overdriveTimer: S.overdriveTimer,
    grid: S.grid.map(row => row.map(cell => ({
      t: cell.type, l: cell.level, d: cell.dir,
      pt: cell.prodTimer, bu: cell.buffer,
      pr: cell.processing ? 1 : 0, prt: cell.processTimer,
      ob: cell.outputBuffer, it: cell.inputType,
      ci: cell.item, cp: cell.itemProgress,
      st: cell.stored, stt: cell.storedType,
    }))),
    timestamp: Date.now(),
  };
  try { localStorage.setItem('steelTycoon_save', JSON.stringify(data)); } catch(e) {}
}

function resetGame() {
  if (!confirm('คุณต้องการรีเซ็ตเกมจริงๆ ใช่ไหม? ความก้าวหน้าทั้งหมดของคุณจะสูญหาย!')) return;
  localStorage.removeItem('steelTycoon_save');
  S = createState();
  S.grid = createGrid(S.gridW, S.gridH);
  S.selectedCell = null;
  S.selectedTool = null;
  S.activeTool = 'select';
  S.speed = 1;
  document.getElementById('btn-speed').textContent = '▶ 1×';
  resizeCanvas();
  updateToolbarButtons();
  clearUpgradeTab();
  updateUI();
  updateHint();
  notify('🔄', 'รีเซ็ตเกมสำเร็จแล้ว — เริ่มต้นสร้างโรงงานใหม่กันเลย!', 'warning');
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 16: INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function init() {
  S = createState();
  S.grid = createGrid(S.gridW, S.gridH);

  initCanvas();
  setupInput();

  // Try to load saved game
  const hasLoad = localStorage.getItem('steelTycoon_save');
  if (hasLoad) {
    if (loadGame()) {
      // Loaded successfully
    } else {
      updateUI();
    }
  } else {
    updateUI();
  }

  updateHint();

  // Start game loop
  requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);
