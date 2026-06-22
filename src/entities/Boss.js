import Phaser from 'phaser';

export default class Boss {
  constructor(scene, x, y, player, difficulty = { enemyHpMult: 1, enemyDmgMult: 1 }, name = 'The Boss') {
    this.scene = scene;
    this.player = player;
    this.name = name;
    this.hp = Math.round((220 + (scene.levelNumber * 12)) * difficulty.enemyHpMult);
    this.maxHp = this.hp;
    this.atk = Math.round(14 * difficulty.enemyDmgMult);
    this.phase = 1;
    this.attackTimer = 2;
    this.contactTimer = 0;
    this.state = 'idle';

    this.sprite = scene.physics.add.sprite(x, y, 'boss_sheet', 0);
    this.sprite.setData('ref', this);
    this.sprite.setSize(58, 60);
    this.sprite.setOffset(3, 4);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.play('boss_idle');
    scene.enemies.add(this.sprite);

    this.projectiles = scene.physics.add.group();
    scene.physics.add.overlap(
      player.sprite, this.projectiles,
      (_p, proj) => { player.takeDamage(16, proj.x); proj.destroy(); },
      null, scene
    );

    scene.events.emit('bossspawn', this);
  }

  anim(key) {
    return this.phase === 2 ? `boss_${key}_enraged` : `boss_${key}`;
  }

  update(time, delta) {
    const dt = delta / 1000;
    const dx = this.player.sprite.x - this.sprite.x;

    if (this.phase === 1 && this.hp < this.maxHp * 0.5) {
      this.phase = 2;
      this.sprite.setTintFill(0xff6060);
      this.scene.time.delayedCall(200, () => this.sprite.clearTint());
    }

    this.contactTimer -= dt;
    if (this.contactTimer <= 0 && Phaser.Geom.Intersects.RectangleToRectangle(
      this.sprite.getBounds(), this.player.sprite.getBounds()
    )) {
      this.player.takeDamage(this.atk, this.sprite.x);
      this.contactTimer = 0.7;
    }

    if (this.state === 'idle') {
      this.sprite.setVelocityX(Math.sign(dx) * (this.phase === 2 ? 70 : 45));
      this.sprite.setFlipX(dx < 0);
      this.sprite.anims.play(this.anim('walk'), true);

      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.attackTimer = this.phase === 2 ? 1.8 : 2.6;
        this.startAttack(dx);
      }
    } else if (this.state === 'telegraph') {
      this.sprite.setVelocityX(0);
    }
  }

  startAttack(dx) {
    const roll = Math.random();
    this.state = 'telegraph';
    this.sprite.anims.play(this.anim('telegraph'), true);
    this.sprite.setTintFill(0xffaa00);

    this.scene.time.delayedCall(450, () => {
      this.sprite.clearTint();
      this.state = 'idle';
      if (roll < 0.5) this.tripleShot(dx);
      else this.lungeAttack(dx);
    });
  }

  tripleShot(dx) {
    this.sprite.anims.play(this.anim('slam'), true);
    const dir = Math.sign(dx) || 1;
    for (let i = -1; i <= 1; i++) {
      const p = this.projectiles.create(this.sprite.x, this.sprite.y - 10, 'boss_projectile');
      p.body.allowGravity = false;
      p.setVelocityX(dir * 200);
      p.setVelocityY(i * 80);
      this.scene.time.delayedCall(2500, () => { if (p.active) p.destroy(); });
    }
  }

  lungeAttack(dx) {
    this.sprite.anims.play(this.anim('slam'), true);
    const dir = Math.sign(dx) || 1;
    this.sprite.setVelocityX(dir * 380);
    this.scene.time.delayedCall(350, () => {
      if (this.sprite.active) this.sprite.setVelocityX(0);
    });
  }

  onHit(dmg, isCrit) {
    this.hp -= dmg;
    this.flashHit(isCrit);
    this.scene.events.emit('bosshp', this.hp, this.maxHp);
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
    this.player.gainXP(Math.round(80 * (this.scene.difficulty?.xpMult || 1)));
    this.sprite.anims.play('boss_death', true);
    this.scene.spawnDeathParticles?.(this.sprite.x, this.sprite.y, 0xff3030, 20);
    this.projectiles.clear(true, true);
    this.scene.events.emit('bossdefeat');
    this.scene.time.delayedCall(500, () => this.sprite.destroy());
  }
}
