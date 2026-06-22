// Each level defines: theme (color palette), platform layout, enemy composition, isBoss
// Platform format: [x, y, tileCount]

export const LEVELS = [
  // 1 — Entrance Hall
  {
    name: 'The Entrance Hall',
    bg: 'level_1_entrance_hall',
    theme: { bg: 0x0a0a0f, tile: 0x2c1f3a, tileEdge: 0x4a3060, fog: 0x16162a },
    platforms: [
      [80, 430, 4], [240, 370, 3], [420, 420, 3],
      [580, 340, 4], [160, 280, 3], [380, 250, 3], [620, 200, 3]
    ],
    enemies: { grunt: 2, mage: 1, archer: 1 },
    isBoss: false,
  },
  // 2 — Crumbling Stairs
  {
    name: 'Crumbling Stairs',
    bg: 'level_2_crumbling_stairs',
    theme: { bg: 0x0c0a12, tile: 0x33203f, tileEdge: 0x563468, fog: 0x1a1424 },
    platforms: [
      [60, 460, 3], [220, 410, 3], [380, 360, 3],
      [540, 310, 3], [700, 260, 3], [500, 180, 3], [260, 150, 3]
    ],
    enemies: { grunt: 2, mage: 2, archer: 1 },
    isBoss: false,
  },
  // 3 — Sunken Library
  {
    name: 'The Sunken Library',
    bg: 'level_3_sunken_library',
    theme: { bg: 0x080d12, tile: 0x1f3a3a, tileEdge: 0x346060, fog: 0x142424 },
    platforms: [
      [50, 440, 4], [260, 400, 2], [350, 320, 4],
      [600, 380, 3], [700, 280, 3], [180, 250, 3], [450, 180, 4]
    ],
    enemies: { grunt: 3, mage: 2, archer: 1 },
    isBoss: false,
  },
  // 4 — BOSS: The Warden
  {
    name: "The Warden's Chamber",
    bg: 'level_4_warden_chamber',
    theme: { bg: 0x120505, tile: 0x3a1f1f, tileEdge: 0x602e2e, fog: 0x241010 },
    platforms: [
      [150, 390, 1], [180, 390, 1],
      [810, 390, 1], [778, 390, 1]
    ],
    enemies: {},
    isBoss: true,
    bossName: 'The Warden',
  },
  // 5 — Frozen Vault
  {
    name: 'The Frozen Vault',
    bg: 'level_5_frozen_vault',
    theme: { bg: 0x0a1018, tile: 0x1f2f3a, tileEdge: 0x345268, fog: 0x14202c },
    platforms: [
      [70, 450, 3], [250, 390, 3], [420, 440, 3],
      [580, 360, 3], [700, 280, 3], [380, 220, 3], [180, 170, 3]
    ],
    enemies: { grunt: 3, mage: 3, archer: 1 },
    isBoss: false,
  },
  // 6 — Blood Cisterns
  {
    name: 'The Blood Cisterns',
    bg: 'level_6_blood_cisterns',
    theme: { bg: 0x140808, tile: 0x3a1f24, tileEdge: 0x60303a, fog: 0x241014 },
    platforms: [
      [60, 430, 3], [230, 470, 2], [340, 380, 3],
      [520, 420, 3], [650, 330, 3], [450, 240, 3], [700, 170, 3]
    ],
    enemies: { grunt: 4, mage: 3, archer: 1 },
    isBoss: false,
  },
  // 7 — Whispering Halls
  {
    name: 'The Whispering Halls',
    bg: 'level_7_whispering_halls',
    theme: { bg: 0x0d0a14, tile: 0x281f3a, tileEdge: 0x423468, fog: 0x181024 },
    platforms: [
      [50, 460, 3], [200, 400, 3], [380, 440, 2],
      [480, 340, 3], [650, 400, 3], [750, 260, 3], [400, 180, 4]
    ],
    enemies: { grunt: 3, mage: 4, archer: 2 },
    isBoss: false,
  },
  // 8 — BOSS: The Hollow Knight
  {
    name: "The Hollow Knight's Lair",
    bg: 'level_8_hollow_knight_lair',
    theme: { bg: 0x080808, tile: 0x2a2a2a, tileEdge: 0x484848, fog: 0x161616 },
    platforms: [
      [150, 390, 1], [180, 390, 1],
      [810, 390, 1], [778, 390, 1]
    ],
    enemies: {},
    isBoss: true,
    bossName: 'The Hollow Knight',
  },
  // 9 — The Abyss Approach
  {
    name: 'The Abyss Approach',
    bg: 'level_9_abyss_approach',
    theme: { bg: 0x05050a, tile: 0x1a1a2e, tileEdge: 0x2e2e50, fog: 0x0e0e1a },
    platforms: [
      [60, 470, 2], [200, 420, 2], [320, 360, 2],
      [460, 420, 2], [600, 350, 2], [720, 280, 2], [500, 200, 3], [250, 170, 3]
    ],
    enemies: { grunt: 4, mage: 4, archer: 2 },
    isBoss: false,
  },
  // 10 — BOSS: The Dread Sovereign (final)
  {
    name: "The Dread Sovereign's Throne",
    bg: 'level_10_dread_sovereign_throne',
    theme: { bg: 0x100308, tile: 0x40101f, tileEdge: 0x701a35, fog: 0x200814 },
    platforms: [
      [150, 390, 1], [180, 390, 1],
      [810, 390, 1], [778, 390, 1],
      [460, 320, 2]
    ],
    enemies: {},
    isBoss: true,
    bossName: 'The Dread Sovereign',
    isFinalBoss: true,
  },
];

export function getLevel(num) {
  // 1-indexed
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, num - 1))];
}

export const TOTAL_LEVELS = LEVELS.length;
