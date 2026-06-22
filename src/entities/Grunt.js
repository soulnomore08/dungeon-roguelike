import Phaser from 'phaser';

export default class Grunt {
  constructor(scene, x, y, player, difficulty = { enemyHpMult: 1, enemyDmgMult: 1 }) {
    this.scene = scene;
    this.player = player;
    this.hp = Math.round(30 * difficulty.enemyHpMult);
    this.maxHp = this.hp;
    this.atk = Math.round(9 * difficulty.enemyDmgMult);
    this.attackCooldown = 0;
    this.attackWindup = 0;
    this.state = 'chase';

    this.sprite = scene.physics.add.sprite(x, y, 'grunt_sheet', 0);
    this.sprite.setData('ref', this);
    this.sprite.setSize(20, 26);
    this.sprite.setOffset(6, 2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.play('grunt_idle');
    scene.enemies.add(this.sprite);

    this.hitbox = scene.physics.add.image(0, 0, null);
    this.hitbox.setVisible(false);
    this.hitbox.body.setSize(30, 24);
    this.hitbox.body.enable = false;

    scene.physics.add.overlap(
      this.hitbox, player.sprite,
      () => {
        if (this.hitbox.body.enable) {
          player.takeDamage(this.atk, this.sprite.x);
          this.hitbox.body.enable = false;
        }
      },
      null, scene
    );
  }

  update(time, delta) {
    const dt = delta / 1000;
    const dx = this.player.sprite.x - this.sprite.x;
    const dist = Math.abs(dx);
    this.sprite.setFlipX(dx < 0);

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    const attackRange = 34;

    if (this.state === 'chase') {
      if (dist > attackRange) {
        const dir = Math.sign(dx);
        if (this.canWalk(dir)) {
          this.sprite.setVelocityX(dir * 80);
          this.sprite.anims.play('grunt_walk', true);
        } else {
          this.sprite.setVelocityX(0);
          this.sprite.anims.play('grunt_idle', true);
        }
      } else {
        this.sprite.setVelocityX(0);
        this.sprite.anims.play('grunt_idle', true);
        if (this.attackCooldown <= 0) this.startWindup();
      }
    } else if (this.state === 'windup') {
      this.sprite.setVelocityX(0);
      this.attackWindup -= dt;
      if (this.attackWindup <= 0) this.swing();
    }
  }

  /** Returns false if walking in `dir` would walk the enemy off a platform edge. */
  canWalk(dir) {
    if (!this.sprite.body.blocked.down) return true; // already airborne, let gravity/collision handle it
    const checkX = this.sprite.x + dir * 18;
    const checkY = this.sprite.y + 20;
    const platforms = this.scene.floorManager?.platforms;
    if (!platforms) return true;
    let hasGroundAhead = false;
    platforms.getChildren().forEach(p => {
      if (Math.abs(p.x - checkX) < 18 && Math.abs(p.y - checkY) < 20) hasGroundAhead = true;
    });
    return hasGroundAhead;
  }

  startWindup() {
    this.state = 'windup';
    this.attackWindup = 0.35;
    this.sprite.anims.play('grunt_telegraph', true);
    this.sprite.setTintFill(0xffaa55);
    this.scene.time.delayedCall(350, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
  }

  swing() {
    this.state = 'swing';
    this.sprite.anims.play('grunt_attack', true);
    const facing = this.sprite.flipX ? -1 : 1;
    this.hitbox.setPosition(this.sprite.x + facing * 26, this.sprite.y);
    this.hitbox.body.enable = true;

    const fx = this.scene.add.image(this.sprite.x + facing * 26, this.sprite.y, 'sword_fx');
    fx.setFlipX(facing < 0);
    fx.setTint(0xff8866);
    this.scene.tweens.add({ targets: fx, alpha: 0, duration: 150, onComplete: () => fx.destroy() });

    this.scene.time.delayedCall(150, () => {
      this.hitbox.body.enable = false;
      if (this.sprite.active) {
        this.state = 'chase';
        this.attackCooldown = 1.1;
      }
    });
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
    this.player.gainXP(Math.round(12 * (this.scene.difficulty?.xpMult || 1)));
    this.scene.spawnDeathParticles?.(this.sprite.x, this.sprite.y, 0x8b0000);
    this.hitbox.destroy();
    this.sprite.destroy();
  }
}
