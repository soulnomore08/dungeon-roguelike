import Phaser from 'phaser';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    this.hp = 100; this.maxHp = 100;
    this.xp = 0;   this.xpNext = 30;
    this.level = 1; this.atk = 10;
    this.speed = 200; this.kills = 0;
    this.critChance = 0.05;

    this.attackCooldown = 0;
    this.iframes = 0;
    this.facing = 1;
    this.isAttacking = false;

    this.weapon = 'sword';

    this.dashCooldownMax = 1.6;
    this.dashCooldown = 0;
    this.dashDuration = 0;
    this.dashSpeed = 550;

    this.sprite = scene.physics.add.sprite(x, y, 'player_sheet', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(18, 30);
    this.sprite.setOffset(7, 1);
    this.sprite.play('player_idle');

    // melee hitbox
    this.attackHitbox = scene.physics.add.image(0, 0, null);
    this.attackHitbox.setVisible(false);
    this.attackHitbox.body.setSize(36, 28);
    this.attackHitbox.body.enable = false;

    this.arrows = scene.physics.add.group();

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D,Q,SHIFT');
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.sprite.on('animationcomplete', (anim) => {
      if (anim.key === 'player_attack' || anim.key === 'player_jump_attack') {
        this.isAttacking = false;
      }
    });
  }

  update(time, delta) {
    const dt = delta / 1000;
    const { sprite, cursors, wasd } = this;

    this.attackCooldown -= dt;
    this.iframes = Math.max(0, this.iframes - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);

    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.weapon = this.weapon === 'sword' ? 'bow' : 'sword';
      this.scene.events.emit('weaponswitch', this.weapon);
    }

    const left  = cursors.left.isDown  || wasd.A.isDown;
    const right = cursors.right.isDown || wasd.D.isDown;
    const jump  = cursors.up.isDown    || wasd.W.isDown;
    const inAir = !sprite.body.blocked.down;

    // Dash
    if (this.dashDuration > 0) {
      this.dashDuration -= dt;
      sprite.setVelocityX(this.dashDir * this.dashSpeed);
    } else {
      if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.dashCooldown <= 0) {
        this.dashDuration = 0.18;
        this.dashCooldown = this.dashCooldownMax;
        this.dashDir = this.facing;
        this.iframes = Math.max(this.iframes, 0.2);
        this.spawnDashTrail();
      } else if (!this.isAttacking) {
        if (left)       { sprite.setVelocityX(-this.speed); this.facing = -1; }
        else if (right) { sprite.setVelocityX(this.speed);  this.facing = 1;  }
        else            { sprite.setVelocityX(0); }
      }
    }

    if (jump && sprite.body.blocked.down) sprite.setVelocityY(-560);

    sprite.setFlipX(this.facing < 0);

    // Attack (works on ground or in air now)
    const cooldownTime = this.weapon === 'sword' ? 0.4 : 0.65;
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.attackCooldown <= 0) {
      this.attackCooldown = cooldownTime;
      if (this.weapon === 'sword') this.meleeAttack(inAir);
      else this.rangedAttack(inAir);
    }

    this.updateAnimation(inAir, left || right);

    this.arrows.getChildren().forEach(a => {
      if (a.x < -20 || a.x > 980) a.destroy();
    });
  }

  updateAnimation(inAir, isMoving) {
    if (this.isAttacking) return; // let attack anim finish
    const { sprite } = this;
    if (inAir) {
      sprite.anims.play('player_jump', true);
    } else if (this.dashDuration > 0 || isMoving) {
      sprite.anims.play('player_walk', true);
    } else {
      sprite.anims.play('player_idle', true);
    }
  }

  meleeAttack(inAir = false) {
    const { sprite } = this;
    this.isAttacking = true;
    sprite.anims.play(inAir ? 'player_jump_attack' : 'player_attack', true);

    this.attackHitbox.body.enable = true;
    const ox = this.facing === 1 ? 38 : -38;
    this.attackHitbox.setPosition(sprite.x + ox, sprite.y);
    this.scene.time.delayedCall(120, () => { this.attackHitbox.body.enable = false; });

    const fx = this.scene.add.image(sprite.x + ox, sprite.y, 'sword_fx');
    fx.setFlipX(this.facing < 0);
    fx.setAlpha(0.9);
    this.scene.tweens.add({ targets: fx, alpha: 0, duration: 150, onComplete: () => fx.destroy() });
  }

  rangedAttack(inAir = false) {
    const { sprite } = this;
    this.isAttacking = true;
    sprite.anims.play(inAir ? 'player_jump_attack' : 'player_attack', true);

    const arrow = this.arrows.create(sprite.x + this.facing * 16, sprite.y + 4, 'arrow');
    arrow.setFlipX(this.facing < 0);
    arrow.body.allowGravity = false;
    arrow.setVelocityX(this.facing * 480);
    arrow.setData('dmg', this.atk * 0.8);
    this.scene.time.delayedCall(2000, () => arrow.destroy());
  }

  spawnDashTrail() {
    const trail = this.scene.add.image(this.sprite.x, this.sprite.y, 'dash_trail');
    trail.setAlpha(0.5);
    this.scene.tweens.add({ targets: trail, alpha: 0, duration: 200, onComplete: () => trail.destroy() });
  }

  rollDamage(base) {
    const isCrit = Math.random() < this.critChance;
    return { dmg: isCrit ? base * 2 : base, isCrit };
  }

  takeDamage(amount, sourceX = null) {
    if (this.iframes > 0) return;
    this.hp -= amount;
    this.iframes = 0.8;
    this.scene.cameras.main.shake(80, 0.003);

    if (sourceX !== null) {
      const dir = this.sprite.x < sourceX ? -1 : 1;
      this.sprite.setVelocityX(dir * 260);
      this.sprite.setVelocityY(-180);
    }

    this.sprite.setTintFill(0xff3030);
    this.scene.time.delayedCall(140, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
    this.scene.spawnDeathParticles?.(this.sprite.x, this.sprite.y, 0xff3030, 6);
    this.scene.showDamageNumber?.(this.sprite.x, this.sprite.y - 20, Math.round(amount), '#ff5050');
  }

  gainXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.xpNext = Math.floor(this.xpNext * 1.4);
      this.level++;
      this.scene.events.emit('levelup');
    }
  }
}
