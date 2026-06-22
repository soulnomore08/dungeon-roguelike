export const UPGRADES = [
  {
    id: 'hp',
    label: '❤ Fortify — +30 max HP, full heal',
    apply: p => { p.maxHp += 30; p.hp = p.maxHp; }
  },
  {
    id: 'atk',
    label: '⚔ Sharpen — +8 attack damage',
    apply: p => { p.atk += 8; }
  },
  {
    id: 'spd',
    label: '💨 Haste — +30 move speed',
    apply: p => { p.speed += 30; }
  },
  {
    id: 'dash',
    label: '🌀 Shadowstep — -0.5s dash cooldown',
    apply: p => { p.dashCooldownMax = Math.max(0.4, p.dashCooldownMax - 0.5); }
  },
  {
    id: 'crit',
    label: '🎯 Precision — +10% crit chance',
    apply: p => { p.critChance = Math.min(0.75, p.critChance + 0.1); }
  },
];

export function pickRandomUpgrades(count = 3) {
  const pool = [...UPGRADES];
  const chosen = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}
