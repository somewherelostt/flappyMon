"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface PhaserGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

export default function PhaserGame({
  onGameOver,
  onScoreUpdate,
}: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    class GameScene extends Phaser.Scene {
      private alien!: Phaser.Physics.Arcade.Sprite;
      private obstacles!: Phaser.Physics.Arcade.Group;
      private ground!: Phaser.GameObjects.TileSprite;
      private background!: Phaser.GameObjects.TileSprite;
      private stars!: Phaser.GameObjects.TileSprite;
      private score: number = 0;
      private isGameOver: boolean = false;
      private spaceKey!: Phaser.Input.Keyboard.Key;
      private obstacleTimer?: Phaser.Time.TimerEvent;
      private scoredPairs: Set<number> = new Set();

      constructor() {
        super({ key: "GameScene" });
      }

      preload() {
        // Create pixel alien sprite
        const alienGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        alienGraphics.fillStyle(0xa855f7, 1);
        alienGraphics.fillRect(4, 0, 24, 8);
        alienGraphics.fillRect(0, 8, 32, 24);
        alienGraphics.fillRect(4, 32, 24, 8);
        alienGraphics.fillStyle(0xffffff, 1);
        alienGraphics.fillRect(8, 12, 6, 6);
        alienGraphics.fillRect(18, 12, 6, 6);
        alienGraphics.generateTexture("alien", 32, 40);
        alienGraphics.destroy();

        // Create obstacle sprite
        const obstacleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        obstacleGraphics.fillStyle(0x4f46e5, 1);
        obstacleGraphics.fillRect(0, 0, 50, 300);
        obstacleGraphics.fillStyle(0x312e81, 1);
        obstacleGraphics.fillRect(5, 5, 40, 290);
        obstacleGraphics.generateTexture("obstacle", 50, 300);
        obstacleGraphics.destroy();

        // Create ground sprite
        const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        groundGraphics.fillStyle(0x1e1b4b, 1);
        groundGraphics.fillRect(0, 0, 64, 64);
        groundGraphics.fillStyle(0x312e81, 1);
        groundGraphics.fillRect(0, 0, 64, 8);
        groundGraphics.generateTexture("ground", 64, 64);
        groundGraphics.destroy();
      }

      create() {
        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3a8a, 0x1e3a8a, 0x1e1b4b, 0x1e1b4b, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);

        // Parallax stars
        this.stars = this.add
          .tileSprite(0, 0, this.scale.width, this.scale.height, "ground")
          .setOrigin(0, 0)
          .setAlpha(0.2)
          .setTint(0x06b6d4);

        // Background
        this.background = this.add
          .tileSprite(0, 0, this.scale.width, this.scale.height, "ground")
          .setOrigin(0, 0)
          .setAlpha(0.1);

        // Ground
        this.ground = this.add
          .tileSprite(0, this.scale.height - 80, this.scale.width, 80, "ground")
          .setOrigin(0, 0);

        // Physics
        this.physics.world.setBounds(
          0,
          0,
          this.scale.width,
          this.scale.height - 80
        );

        // Alien
        this.alien = this.physics.add.sprite(100, 200, "alien");
        this.alien.setCollideWorldBounds(true);
        this.alien.setGravityY(1000);
        this.alien.setBounce(0);

        // Obstacles group
        this.obstacles = this.physics.add.group();

        // Collisions
        this.physics.add.overlap(
          this.alien,
          this.obstacles,
          this.handleCollision,
          undefined,
          this
        );

        // Input
        this.spaceKey = this.input.keyboard!.addKey(
          Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.input.on("pointerdown", () => this.jump());

        // Spawn obstacles
        this.obstacleTimer = this.time.addEvent({
          delay: 2000,
          callback: this.spawnObstacle,
          callbackScope: this,
          loop: true,
        });

        // Initial obstacles
        this.time.delayedCall(1500, () => this.spawnObstacle());
      }

      update() {
        if (this.isGameOver) return;

        // Scroll background
        this.stars.tilePositionX += 0.5;
        this.background.tilePositionX += 1;
        this.ground.tilePositionX += 3;

        // Jump on space
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.jump();
        }

        // Check if alien hit ground
        if (this.alien.y >= this.scale.height - 120) {
          this.gameOver();
        }

        // Score when alien passes the obstacle (once per pair)
        this.obstacles.children.entries.forEach((obstacle: any) => {
          const pairId = obstacle.getData("pairId");

          // Score when the obstacle passes behind the alien
          if (obstacle.x + 25 < this.alien.x && !this.scoredPairs.has(pairId)) {
            this.scoredPairs.add(pairId);
            this.score++;
            onScoreUpdate(this.score);
            this.cameras.main.flash(100);
          }

          // Clean up obstacles that are off-screen
          if (obstacle.x < -50) {
            obstacle.destroy();
          }
        });
      }

      jump() {
        if (this.isGameOver) return;
        this.alien.setVelocityY(-400);
      }

      spawnObstacle() {
        if (this.isGameOver) return;

        const gap = 180;
        const minHeight = 50;
        const maxHeight = this.scale.height - 80 - gap - minHeight;
        const topHeight = Phaser.Math.Between(minHeight, maxHeight);

        // Create a unique pair ID for this obstacle pair
        const pairId = Date.now() + Math.random();

        // Top obstacle
        const topObstacle = this.obstacles.create(
          this.scale.width + 25, // Spawn off-screen to the right
          topHeight / 2,
          "obstacle"
        );
        topObstacle.setDisplaySize(50, topHeight);
        topObstacle.body.setSize(50, topHeight);
        topObstacle.setVelocityX(-200);
        topObstacle.body.allowGravity = false;
        topObstacle.setData("scored", false); // Initialize scored flag
        topObstacle.setData("pairId", pairId); // Pair identifier

        // Bottom obstacle
        const bottomY = topHeight + gap;
        const bottomHeight = this.scale.height - 80 - bottomY;
        const bottomObstacle = this.obstacles.create(
          this.scale.width + 25, // Spawn off-screen to the right
          bottomY + bottomHeight / 2,
          "obstacle"
        );
        bottomObstacle.setDisplaySize(50, bottomHeight);
        bottomObstacle.body.setSize(50, bottomHeight);
        bottomObstacle.setVelocityX(-200);
        bottomObstacle.body.allowGravity = false;
        bottomObstacle.setData("scored", false); // Initialize scored flag
        bottomObstacle.setData("pairId", pairId); // Pair identifier
      }

      handleCollision(alien: any, obstacle: any) {
        if (this.isGameOver) return;
        this.gameOver();
      }

      gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.cameras.main.shake(200, 0.01);
        this.physics.pause();

        if (this.obstacleTimer) {
          this.obstacleTimer.destroy();
        }

        this.time.delayedCall(300, () => {
          onGameOver(this.score);
        });
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: window.innerWidth > 800 ? 800 : window.innerWidth,
      height: window.innerHeight > 600 ? 600 : window.innerHeight,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [GameScene],
      backgroundColor: "#1e3a8a",
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
    };
  }, [onGameOver, onScoreUpdate]);

  return <div ref={gameRef} className="flex items-center justify-center" />;
}
