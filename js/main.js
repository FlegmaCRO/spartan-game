// Import all our classes
// Note: In a real project, you'd use ES6 modules or a bundler
// For now, we'll include them in the HTML

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Create simple colored sprites instead of loading PNGs with backgrounds
        this.createSimpleSprites();
        
        // Load game assets (commented out until we have transparent PNGs)
        // this.load.image('spartan', 'js/assets/spartan.png');
        // this.load.image('spear', 'js/assets/spear.png');
    }
    
    createSimpleSprites() {
        // Create a proper Spartan sprite with helmet
        const spartanGraphics = this.add.graphics();
        
        // Body (tunic)
        spartanGraphics.fillStyle(0xDC143C); // Crimson red tunic
        spartanGraphics.fillRoundedRect(5, 25, 30, 35, 4);
        
        // Arms
        spartanGraphics.fillStyle(0xD2B48C); // Skin tone
        spartanGraphics.fillCircle(8, 30, 4); // Left arm
        spartanGraphics.fillCircle(32, 30, 4); // Right arm
        
        // Legs
        spartanGraphics.fillRect(12, 55, 6, 15); // Left leg
        spartanGraphics.fillRect(22, 55, 6, 15); // Right leg
        
        // Head/face
        spartanGraphics.fillStyle(0xD2B48C); // Skin tone
        spartanGraphics.fillCircle(20, 18, 8); // Head
        
        // Spartan Helmet
        spartanGraphics.fillStyle(0xB8860B); // Bronze/gold helmet
        spartanGraphics.fillEllipse(20, 16, 18, 16); // Helmet dome
        
        // Helmet crest (mohawk-style)
        spartanGraphics.fillStyle(0x8B0000); // Dark red crest
        spartanGraphics.fillRect(18, 5, 4, 12); // Crest base
        spartanGraphics.fillTriangle(20, 3, 16, 8, 24, 8); // Crest top
        
        // Face guard (cheek pieces)
        spartanGraphics.fillStyle(0xB8860B); // Bronze
        spartanGraphics.fillEllipse(15, 20, 4, 8); // Left cheek guard
        spartanGraphics.fillEllipse(25, 20, 4, 8); // Right cheek guard
        
        // Eye slits
        spartanGraphics.fillStyle(0x000000); // Black
        spartanGraphics.fillRect(17, 17, 2, 1); // Left eye slit
        spartanGraphics.fillRect(21, 17, 2, 1); // Right eye slit
        
        // Shield (small, on arm)
        spartanGraphics.fillStyle(0xB8860B); // Bronze shield
        spartanGraphics.fillCircle(8, 35, 6); // Round shield
        spartanGraphics.fillStyle(0xDC143C); // Red lambda symbol
        spartanGraphics.fillTriangle(8, 32, 6, 38, 10, 38); // Lambda (Λ)
        
        // Spear in right hand
        spartanGraphics.fillStyle(0x8B4513); // Brown wooden shaft
        spartanGraphics.fillRect(32, 20, 2, 25); // Spear shaft
        spartanGraphics.fillStyle(0xB8860B); // Bronze spearhead
        spartanGraphics.fillTriangle(33, 18, 30, 22, 36, 22); // Spearhead
        
        spartanGraphics.generateTexture('spartan', 40, 70);
        spartanGraphics.destroy();
        
        // Create an authentic Greek spear (doru)
        const spearGraphics = this.add.graphics();
        
        // Wooden shaft
        spearGraphics.fillStyle(0x8B4513); // Brown wood
        spearGraphics.fillRect(0, 2, 25, 2);
        
        // Bronze spearhead
        spearGraphics.fillStyle(0xB8860B); // Bronze color
        spearGraphics.fillTriangle(25, 3, 32, 0, 32, 6); // Spearhead
        spearGraphics.fillRect(24, 2, 2, 2); // Socket
        
        // Spear butt (sauroter) - bronze spike on back end
        spearGraphics.fillStyle(0xB8860B); // Bronze
        spearGraphics.fillTriangle(0, 3, -3, 1, -3, 5); // Butt spike
        
        spearGraphics.generateTexture('spear', 35, 6);
        spearGraphics.destroy();
    }

    create() {
        // Set background color
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Initialize animation system
        this.animationManager = new AnimationManager(this);

        // Create terrain system
        this.terrain = new Terrain(this, 1280, 720);
        
        // Create backup ground for physics
        const ground = this.add.rectangle(0, 720 - 50, 1280, 50, 0x006400).setOrigin(0, 0);
        this.physics.add.existing(ground, true);

        // Create players
        this.player1 = new Player(this, 150, 600, 1);
        this.player2 = new Player(this, 1280 - 150, 600, 2);
        
        // Set up physics collisions
        this.physics.add.collider(this.player1.sprite, ground);
        this.physics.add.collider(this.player2.sprite, ground);

        // Create game manager
        this.gameManager = new GameManager(this);
        this.gameManager.initialize(this.player1, this.player2);

        // Create UI system
        this.ui = new UI(this);
    }

    update() {
        // Update game logic
        this.gameManager.update();
        
        // Update UI
        this.ui.updateTurnIndicator(
            this.gameManager.currentPlayer, 
            this.gameManager.isGameOver
        );
        
        this.ui.updateAimInfo(
            this.gameManager.currentAimAngle,
            this.gameManager.currentThrowPower
        );
        
        this.ui.updateHealthBars(this.player1, this.player2);
        
        this.ui.drawShields(this.player1, this.player2);
        
        this.ui.drawAimingLine(
            this.gameManager.currentPlayer,
            this.gameManager.currentAimAngle,
            this.gameManager.isChargingPower
        );
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: [GameScene]
};

// Start the game
const game = new Phaser.Game(config);