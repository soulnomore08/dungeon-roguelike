import Phaser from 'phaser';

export default class Mage {
  constructor(scene, x, y, player, difficulty = { enemyHpMult: 1, enemyDmgMult: 1 }) {
    this.scene = scene;
    this.player = player;
    this.hp = Math.round(20 * difficulty.enemyHpMult);
    this.maxHp = this.hp;
    this.dmg = Math.round(11 * difficulty.enemyDmgMult);
    this.shootTimer = 1;

    this.sprite = scene.physics.add.sprite(x, y, 'mage_sheet', 0);
    this.sprite.setData('ref', this);
    this.sprite.setSize(18, 28);
    this.sprite.setOffset(7, 2);
    this.sprite.body.setAllowGravity(false); // mage floats
    this.sprite.setCollideWorldBounds(true);
    this.sprite.play('mage_float');
    scene.enemies.add(this.sprite);

    this.projectiles = scene.physics.add.group();
    scene.physics.add.overlap(
      player.sprite, this.projectiles,
      (_p, proj) => { player.takeDamage(this.dmg, proj.x); proj.destroy(); },
      null, scene
    );
  }

  update(time, delta) {
    const dt = delta / 1000;
    const dx = this.player.sprite.x - this.sprite.x;
    const dist = Math.abs(dx);

    if (dist < 140) {
      this.sprite.setVelocityX(-Math.sign(dx) * 90);
    } else if (dist > 260) {
      this.sprite.setVelocityX(Math.sign(dx) * 60);
    } else {
      this.sprite.setVelocityX(0);
    }
    this.sprite.setFlipX(dx < 0);

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && dist < 320) {
      this.shootTimer = 2.3;
      this.castSpell(dx);
    } else if (this.sprite.anims.currentAnim?.key !== 'mage_cast') {
      this.sprite.anims.play('mage_float', true);
    }
  }

  castSpell(dx) {
    this.sprite.anims.play('mage_cast', true);
    this.sprite.setFlipX(dx < 0);
    const p = this.projectiles.create(this.sprite.x, this.sprite.y, 'projectile');
    p.body.allowGravity = false;
    p.setVelocityX(Math.sign(dx) * 220);
    this.scene.time.delayedCall(2200, () => p.destroy());
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
    this.player.gainXP(Math.round(18 * (this.scene.difficulty?.xpMult || 1)));
    this.scene.spawnDeathParticles?.(this.sprite.x, this.sprite.y, 0x9b59b6);
    this.projectiles.clear(true, true);
    this.sprite.destroy();
  }
}
