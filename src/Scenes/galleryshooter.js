class GalleryShooterGame extends Phaser.Scene {
    curve;
    path;
    constructor() {
        super("galleryShooterGame");
    }

    preload() {
        this.load.image("player", "assets/player.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("bullet2", "assets/bullet2.png");
        this.load.image("enemy", "assets/enemyone.png");
        this.load.image("boss", "assets/enemytwo.png");
        this.load.image("enemyshooter", "assets/enemythree.png");
        this.load.image("background", "assets/whitepuff00.png");
        this.load.image("boom1", "assets/boom1.png");
        this.load.image("boom2", "assets/boom2.png");
        this.load.image("boom3", "assets/boom3.png");
        this.load.image("boom4", "assets/boom4.png");
        this.load.audio("pew", "assets/jingles_NES15.ogg");
        this.load.audio("ow!", "assets/jingles_NES06.ogg");
    }

    create() {
        this.background=this.add.image(400, 300, "background").setScale(1.5);
        this.tweens.add({
            targets: this.background,
            angle: 360, 
            duration: 40000, 
            repeat: -1, // Repeat indefinitely
            yoyo: false 
        });

        this.anims.create({
            key: "boom",
            frames: [
                { key: "boom1" },
                { key: "boom2" },
                { key: "boom3" },
                { key: "boom4" },
            ],
            frameRate: 20,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });

        // Set up player
        this.player = this.add.sprite(400, 500, "player").setOrigin(0.5);
        this.player.setScale(0.85);
        this.playerHealth = 10;
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.playerSpeed = 10;

        // Set up boss
        this.points = [
            50, 50,
            800, 100,
            50, 200,
            800, 400,
            50, 600
        ];

        this.targetXIndex = 0;
        this.targetXPositions = [0, game.config.width];

        this.curve = new Phaser.Curves.Spline(this.points);
        //this.boss = this.add.sprite(-100, -100, "boss").setScale(0.5);
        this.boss = this.add.follower(this.curve, 10, 10, "boss").setScale(0.5);
        this.lonewolf = this.add.sprite(game.config.width, 50, "enemyshooter").setScale(0.25);
        this.bossHealth = 5; 
        this.boss.setActive(false);
        this.boss.setVisible(false);

        // Set up bullets
        this.bullets = this.add.group({
            defaultKey: "bullet",
            maxSize: 10,
            createCallback: (bullet) => {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });

        // Set up enemies
        this.enemies = this.add.group({
            defaultKey: "enemy",
            maxSize: 20,
            createCallback: (enemy) => {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
        // Set up enemy bullets
        this.badbullets = this.add.group({
            defaultKey: "bullet2",
            maxSize: 1,
            createCallback: (badbullet) => {
                badbullet.setActive(false);
                badbullet.setVisible(false);
                badbullet.setFlipY(true);
            }
        });
        // Set up level
        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", fill: "#fff" });
        this.healthText = this.add.text(600, 16, `Health: ${this.playerHealth}`, { fontSize: "32px", fill: "#f00" });
        this.level = 1;
        this.enemyCount = 5;
        this.spawnTimer = 0;
        this.levelText = this.add.text(300, 16, `LVL: ${this.level}`, { fontSize: "32px", fill: "#fff" });
        this.spawnEnemies();
    }

    update() {
        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (this.player.x > (this.player.displayWidth/2)) {
                this.player.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (this.player.x < (game.config.width - (this.player.displayWidth/2))) {
                this.player.x += this.playerSpeed;
            }
        }
        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
           let bullet = this.bullets.get();
        if (bullet) {
       bullet.setActive(true);
       bullet.setVisible(true);
        bullet.setPosition(this.player.x, this.player.y);
        this.sound.play("pew", {
            volume: .25   // Can adjust volume using this, goes from 0 to 1
        });
          }
        }

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("end");
        }

        this.bullets.getChildren().forEach((bullet) => {
            if (bullet.active) {
                bullet.y -= 10; 
                if (bullet.y < 0) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            }
        });
        this.badbullets.getChildren().forEach((badbullet) => {
            if (badbullet.active) {
                badbullet.y += 10; 
                if (badbullet.y > 600) {
                    badbullet.setActive(false);
                    badbullet.setVisible(false);
                }
            }
        });
        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.active) {
                enemy.y += 5; 
                if (enemy.y > 600) {
                    enemy.setActive(false);
                    enemy.setVisible(false);
                }
            }
        });
        // Bullet-enemy collision
        this.bullets.getChildren().forEach((bullet) => {
            this.enemies.getChildren().forEach((enemy) => {
                if (this.collides(enemy, bullet)) {
                    this.bulletHitEnemy(bullet, enemy);
                    enemy.x=-100;
                }
            });
        });

        // Enemy-player collision
        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.active) {
            if (this.collides(enemy, this.player)) {
                this.enemyHitPlayer(enemy);
                enemy.x=-100;
                this.sound.play("ow!", {
                    volume: .25   // Can adjust volume using this, goes from 0 to 1
                });
            }
        }
        });
        // Enemybullet-player collision
        this.badbullets.getChildren().forEach((bullet) => {
            if (bullet.active) {
            if (this.collides(bullet, this.player)) {
                this.enemyHitPlayer(bullet);
                bullet.x=-100;
                this.sound.play("ow!", {
                    volume: .25   // Can adjust volume using this, goes from 0 to 1
                });
            }
        }
        });

        // Bullet-lonewolf collision
        this.bullets.getChildren().forEach((bullet) => {
            if (this.lonewolf.active) {
            if (this.collides(this.lonewolf, bullet)) {
                this.boom = this.add.sprite(this.lonewolf.x, this.lonewolf.y, "boom1").setScale(0.45).play("boom");
                this.bulletHitWolf(bullet);
            }
        }
        });

         // Bullet-boss collision
         this.bullets.getChildren().forEach((bullet) => {
            if (this.boss.active) {
            if (this.collides(this.boss, bullet)) {
                this.bulletHitBoss(bullet);
            }
        }
        });

        // Boss-player collision
        if (this.collides(this.boss, this.player)) {
            this.boss.setActive(false);
            this.boss.setVisible(false);
            this.enemyHitPlayer(this.boss);
            this.enemyHitPlayer(this.boss);
            this.sound.play("ow!", {
                volume: .25   // Can adjust volume using this, goes from 0 to 1
            });
        }
        // Check for boss spawn
        if ((this.enemies.countActive(true) === 0)&&!this.boss.active&&!this.lonewolf.active) {
            this.level++;
            this.enemyCount++;
            if ((this.level % 5) === 0)
                {
                this.boss.setActive(true);
                this.boss.setVisible(true);
                    let object = {from: 0,to:1,delay:0,duration: 4000,ease: 'Sine.easeInOut',repeat: -1,yoyo: true,rotateToPath: true,rotationOffset: -90};
                    this.boss.setPosition(this.curve.points[0].x, this.curve.points[0].y);
                    this.boss.startFollow(object);
                this.spawnEnemies();
                }
            if ((this.level % 3) === 0)
                {
                    this.lonewolf.setActive(true);
                    this.lonewolf.setVisible(true);
                 }
            this.spawnEnemies();
            this.levelText.setText(`LVL: ${this.level}`);
        }

        // Lonewolf shooting
    if (this.lonewolf.active) {
    let bullet = this.badbullets.get();
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(this.lonewolf.x, this.lonewolf.y);
    }
    }
    // lonewolf ducky movement
    if (this.targetXIndex < this.targetXPositions.length) {
        let targetX = this.targetXPositions[this.targetXIndex];
        if (this.lonewolf.x < targetX-10) {
            this.lonewolf.x += 5;
        } else if (this.lonewolf.x > targetX+10) {
            this.lonewolf.x -= 5;
        } else {
            this.targetXIndex = (this.targetXIndex + 1) % this.targetXPositions.length;
        }
    }

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>GalleryShooter.js</h2><br>A: left // D: right // Space: fire/emit // S: Stop the game'

    }

    spawnEnemies() {
            for (let i = 0; i < this.enemyCount; i++) {
                let enemy = this.enemies.get(Phaser.Math.Between(50, 750), 0);
                if (enemy) {
                    enemy.setActive(true);
                    enemy.setVisible(true);
                    enemy.setScale(0.35);
                }
            }
    }

    bulletHitEnemy(bullet, enemy) {
        bullet.setActive(false);
        bullet.setVisible(false);
        enemy.setActive(false);
        enemy.setVisible(false);
        this.boom2 = this.add.sprite(enemy.x, enemy.y, "boom1").setScale(1).play("boom");
        bullet.x=-200;
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    bulletHitBoss(bullet) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.x=-200;
        this.bossHealth--;
        this.spawnEnemies();
        if (this.bossHealth <= 0) {
            this.boss.setActive(false);
            this.boss.setVisible(false);
            this.score += 100;
            this.boom3 = this.add.sprite(this.boss.x, this.boss.y, "boom1").setScale(1.5).play("boom");
            this.bossDefeated();
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }
    bulletHitWolf(bullet) 
    {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.x=-200;
        this.lonewolf.setActive(false);
        this.lonewolf.setVisible(false);
        this.score += 50;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    enemyHitPlayer(enemy) {
        enemy.setActive(false);
        enemy.setVisible(false);
        this.playerHealth--;
        this.healthText.setText(`Health: ${this.playerHealth}`);
        if (this.playerHealth === 0) {
            this.gameOver();
        }
    }

    bossDefeated() {
        this.bossHealth = 5;
        this.playerHealth += 2;
        this.healthText.setText(`Health: ${this.playerHealth}`);
    }

    gameOver() {
        // It's game over man
        this.scene.restart();
        this.score = 0;
        this.playerHealth = 10;
        this.bossHealth = 5;
        this.level = 1;
        this.enemyCount = 5;
        this.scene.start("end");
    }
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}