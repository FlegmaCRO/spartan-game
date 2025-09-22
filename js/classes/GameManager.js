class GameManager {
    constructor(scene) {
        this.scene = scene;
        
        // Game state
        this.currentPlayer = null;
        this.gameOver = false;
        this.canThrow = true;
        
        // Aiming system
        this.aimAngle = 45;
        this.throwPower = 0;
        this.maxPower = 600;
        this.chargingPower = false;
        
        // Active weapons
        this.activeWeapons = [];
        
        // Input setup
        this.setupInput();
    }
    
    setupInput() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shieldKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.restartKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
    
    initialize(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = player1;
    }
    
    update() {
        // Handle restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            this.restartGame();
            return;
        }
        
        if (!this.gameOver) {
            this.handleInput();
            this.updatePlayers();
            this.cleanupWeapons();
        }
    }
    
    handleInput() {
        // Movement
        if (!this.chargingPower) {
            if (this.cursors.left.isDown) {
                this.currentPlayer.moveLeft();
            } else if (this.cursors.right.isDown) {
                this.currentPlayer.moveRight();
            } else {
                this.currentPlayer.stopMoving();
            }
            
            // Jump
            if (this.cursors.up.isDown && this.currentPlayer.isOnGround) {
                this.currentPlayer.jump();
            }
        } else {
            // Stop movement when aiming
            this.currentPlayer.stopMoving();
        }
        
        // Aiming (only when charging power)
        if (this.chargingPower) {
            if (this.cursors.up.isDown) {
                this.aimAngle = Math.min(this.aimAngle + 2, 170);
            } else if (this.cursors.down.isDown) {
                this.aimAngle = Math.max(this.aimAngle - 2, 10);
            }
        }
        
        // Shield
        if (this.shieldKey.isDown) {
            this.currentPlayer.raiseShield();
        } else {
            this.currentPlayer.lowerShield();
        }
        
        // Spear throwing
        this.handleSpearThrow();
    }
    
    handleSpearThrow() {
        if (!this.canThrow) return;
        
        // Start charging
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.chargingPower = true;
            this.throwPower = 0;
        }
        
        // Continue charging
        if (this.chargingPower && this.spaceKey.isDown) {
            this.throwPower = Math.min(this.throwPower + 8, this.maxPower);
        }
        
        // Release spear
        if (this.chargingPower && Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
            this.throwSpear();
        }
    }
    
    throwSpear() {
        this.canThrow = false;
        this.chargingPower = false;
        
        // Show epic battle cry
        if (this.scene.ui) {
            this.scene.ui.showBattleCry();
        }
        
        // Play throw animation
        this.currentPlayer.throwSpear();
        
        // Determine throw angle based on player direction
        let throwAngle = this.aimAngle;
        if (this.currentPlayer.playerNumber === 2) {
            throwAngle = 180 - this.aimAngle;
        }
        
        // Create weapon
        const weapon = new Weapon(
            this.scene,
            this.currentPlayer.x,
            this.currentPlayer.y,
            throwAngle,
            this.throwPower,
            this.currentPlayer
        );
        
        this.activeWeapons.push(weapon);
        
        // Set up collision with players
        this.setupWeaponCollisions(weapon);
        
        // Switch turns after a delay
        this.scene.time.delayedCall(1500, () => this.switchTurn());
        
        // Reset power
        this.throwPower = 0;
    }
    
    setupWeaponCollisions(weapon) {
        const target = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        
        this.scene.physics.add.overlap(weapon.sprite, target.sprite, () => {
            const wasDefeated = weapon.handlePlayerHit(target);
            
            // Remove weapon from active list
            this.removeWeapon(weapon);
            
            // Check for game over
            if (wasDefeated) {
                this.gameOver = true;
            }
        });
    }
    
    removeWeapon(weapon) {
        const index = this.activeWeapons.indexOf(weapon);
        if (index > -1) {
            this.activeWeapons.splice(index, 1);
        }
    }
    
    cleanupWeapons() {
        // Remove inactive weapons
        this.activeWeapons = this.activeWeapons.filter(weapon => weapon.active);
    }
    
    updatePlayers() {
        this.player1.update();
        this.player2.update();
    }
    
    switchTurn() {
        if (this.gameOver) return;
        
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        this.canThrow = true;
        
        // Reset animation states
        this.player1.isMoving = false;
        this.player2.isMoving = false;
        
        // Set default facing directions
        this.player1.sprite.setFlipX(false);
        this.player2.sprite.setFlipX(true);
    }
    
    restartGame() {
        // Reset players
        this.player1.reset();
        this.player2.reset();
        this.player1.setPosition(150, 600);
        this.player2.setPosition(1280 - 150, 600);
        
        // Reset game state
        this.gameOver = false;
        this.currentPlayer = this.player1;
        this.canThrow = true;
        this.chargingPower = false;
        this.throwPower = 0;
        
        // Clean up weapons
        this.activeWeapons.forEach(weapon => weapon.destroy());
        this.activeWeapons = [];
        
        // Reset terrain
        if (this.scene.terrain) {
            this.scene.terrain.reset();
        }
    }
    
    // Getters for UI
    get isGameOver() { return this.gameOver; }
    get currentPlayerNumber() { return this.currentPlayer.playerNumber; }
    get isChargingPower() { return this.chargingPower; }
    get currentAimAngle() { return this.aimAngle; }
    get currentThrowPower() { return this.throwPower; }
}