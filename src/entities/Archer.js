import Phaser from 'phaser';

export default class Archer {
  constructor(scene, x, y, player, difficulty = { enemyHpMult: 1, enemyDmgMult: 1 }) {
    this.scene = scene;
    this.player = player;
    this.hp = Math.round(18 * difficulty.enemyHpMult);
    this.maxHp = this.hp;
    this.dmg = Math.round(7 * difficulty.enemyDmgMult);
    this.shootTimer = 0.8;

    this.sprite = scene.physics.add.sprite(x, y, 'archer_sheet', 0);
    this.sprite.setData('ref', this);
    this.sprite.setSize(18, 26);
    this.sprite.setOffset(7, 3);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.play('archer_idle');
    scene.enemies.add(this.sprite);

    this.arrows = scene.physics.add.group();
    scene.physics.add.overlap(
      player.sprite, this.arrows,
      (_p, arrow) => { player.takeDamage(this.dmg, arrow.x); arrow.destroy(); },
      null, scene
    );
  }

  update(time, delta) {
    const dt = delta / 1000;
    const dx = this.player.sprite.x - this.sprite.x;
    const dist = Math.abs(dx);
    this.sprite.setFlipX(dx < 0);

    // archers reposition often, staying mid-range
    if (dist < 180) {
      const dir = -Math.sign(dx);
      if (this.canWalk(dir)) {
        this.sprite.setVelocityX(dir * 100);
        this.sprite.anims.play('archer_walk', true);
      } else {
        this.sprite.setVelocityX(0);
      }
    } else if (dist > 320) {
      const dir = Math.sign(dx);
      if (this.canWalk(dir)) {
        this.sprite.setVelocityX(dir * 90);
        this.sprite.anims.play('archer_walk', true);
      } else {
        this.sprite.setVelocityX(0);
      }
    } else {
      this.sprite.setVelocityX(0);
      if (this.sprite.anims.currentAnim?.key !== 'archer_shoot') {
        this.sprite.anims.play('archer_idle', true);
      }
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && dist < 360 && dist > 60) {
      this.shootTimer = 1.6;
      this.fireArrow(dx);
    }
  }

  /** Returns false if walking in `dir` would walk the archer off a platform edge. */
  canWalk(dir) {
    if (!this.sprite.body.blocked.down) return true;
    const checkX = this.sprite.x + dir * 16;
    const checkY = this.sprite.y + 20;
    const platforms = this.scene.floorManager?.platforms;
    if (!platforms) return true;
    let hasGroundAhead = false;
    platforms.getChildren().forEach(p => {
      if (Math.abs(p.x - checkX) < 18 && Math.abs(p.y - checkY) < 20) hasGroundAhead = true;
    });
    return hasGroundAhead;
  }

  fireArrow(dx) {
    this.sprite.anims.play('archer_shoot', true);
    const arrow = this.arrows.create(this.sprite.x, this.sprite.y, 'enemy_arrow');
    arrow.setFlipX(dx < 0);
    arrow.body.allowGravity = false;
    arrow.setVelocityX(Math.sign(dx) * 320);
    this.scene.time.delayedCall(2000, () => { if (arrow.active) arrow.destroy(); });
  }

  onHit(dmg, isCrit) {
    this.hp -= dmg;
    this.flashHit(isCrit);
    if (this.hp <= 0) this.die();
  }

  flashHit(isCrit) {
    this.sprite.setTintFill(isCrit ? 0xffff00 : 0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
  }

  die() {
    this.player.kills++;
    this.player.gainXP(Math.round(15 * (this.scene.difficulty?.xpMult || 1)));
    this.scene.spawnDeathParticles?.(this.sprite.x, this.sprite.y, 0x2e8b57);
    this.arrows.clear(true, true);
    this.sprite.destroy();
  }
}
