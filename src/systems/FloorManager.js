import Grunt from '../entities/Grunt.js';
import Mage from '../entities/Mage.js';
import Archer from '../entities/Archer.js';
import Boss from '../entities/Boss.js';
import { getLevel, TOTAL_LEVELS } from './LevelData.js';

export default class FloorManager {
  constructor(scene) {
    this.scene = scene;
    this.platforms = scene.physics.add.staticGroup();
    this.decorations = scene.add.group();
    this.currentLevelData = null;
    this.bgImage = null;
  }

  buildFloor() {
    this.platforms.clear(true, true);
    this.decorations.clear(true, true);
    if (this.bgImage) { this.bgImage.destroy(); this.bgImage = null; }

    const levelData = getLevel(this.scene.levelNumber);
    this.currentLevelData = levelData;
    const W = 960, H = 540;

    // Background image (painted level art)
    this.bgImage = this.scene.add.image(W / 2, H / 2, levelData.bg);
    this.bgImage.setDisplaySize(W, H);
    this.bgImage.setDepth(-10);

    // Ground (collision tiles, drawn invisible-ish since bg has its own floor art)
    for (let x = 0; x < W; x += 32) {
      const tile = this.platforms.create(x + 16, H - 10, 'tile');
      tile.setAlpha(0); // background art already shows floor; keep collision only
    }

    levelData.platforms.forEach(([x, y, count]) => {
      for (let i = 0; i < count; i++) {
        const tile = this.platforms.create(x + i * 32 + 16, y, 'tile');
        tile.setTint(levelData.theme.tile);
        tile.setAlpha(0.92);
      }
    });

    this.platforms.refresh();
    this.scatterDecorations(levelData);
  }

  scatterDecorations(levelData) {
    const decoPool = ['skull', 'crate', 'rubble', 'blood_splat', 'chain'];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const type = decoPool[Math.floor(Math.random() * decoPool.length)];
      const x = 40 + Math.random() * 880;
      const y = type === 'chain' ? 60 + Math.random() * 100 : 505;
      const img = this.scene.add.image(x, y, type);
      img.setAlpha(0.55);
      img.setDepth(-5);
      this.decorations.add(img);
    }
  }

  spawnEnemies(group, player) {
    const levelData = this.currentLevelData;
    const diff = this.scene.difficulty;

    if (levelData.isBoss) {
      new Boss(this.scene, 480, 400, player, diff, levelData.bossName);
      return;
    }

    const points = this.getSpawnPoints(levelData);
    let i = 0;

    for (let g = 0; g < (levelData.enemies.grunt || 0); g++) {
      const [x, y] = points[i % points.length]; i++;
      new Grunt(this.scene, x, y, player, diff);
    }
    for (let m = 0; m < (levelData.enemies.mage || 0); m++) {
      const [x, y] = points[i % points.length]; i++;
      new Mage(this.scene, x, y, player, diff);
    }
    for (let a = 0; a < (levelData.enemies.archer || 0); a++) {
      const [x, y] = points[i % points.length]; i++;
      new Archer(this.scene, x, y, player, diff);
    }
  }

  getSpawnPoints(levelData) {
    return levelData.platforms.map(([x, y, count]) => [x + (count * 32) / 2, y - 40]);
  }

  isLastLevel() {
    return this.scene.levelNumber >= TOTAL_LEVELS;
  }
}
