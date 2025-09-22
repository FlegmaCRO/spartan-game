class UI {
    constructor(scene) {
        this.scene = scene;
        this.createElements();
    }
    
    createElements() {
        // Turn indicator
        this.turnText = this.scene.add.text(10, 10, 'Player 1 Turn', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        this.turnText.setDepth(100); // Ensure UI is on top
        
        // Aiming info
        this.aimText = this.scene.add.text(10, 50, 'Aim: 45°', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        this.aimText.setDepth(100);
        
        // Power info
        this.powerText = this.scene.add.text(10, 80, 'Power: 0', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        this.powerText.setDepth(100);
        
        // Create health bars
        this.createHealthBars();
        
        // Shield graphics (will be updated each frame)
        this.shieldGraphics = null;
        
        // Battle cry system
        this.battleCryText = null;
        this.battleCries = [
            "FOR SPARTA!",
            "FOR GLORY!",
            "FOR HONOR!",
            "MOLON LABE!", // Come and take them!
            "SPARTANS NEVER RETREAT!",
            "TONIGHT WE DINE IN HELL!",
            "WITH YOUR SHIELD OR ON IT!",
            "REMEMBER THE 300!",
            "VICTORY OR DEATH!",
            "SPARTA WILL NEVER FALL!"
        ];
    }
    
    createHealthBars() {
        // Player 1 health bar (top left)
        this.p1HealthBg = this.scene.add.rectangle(120, 120, 200, 20, 0x333333);
        this.p1HealthBg.setDepth(100);
        this.p1HealthBar = this.scene.add.rectangle(120, 120, 200, 16, 0x00ff00);
        this.p1HealthBar.setDepth(101);
        this.p1HealthText = this.scene.add.text(20, 110, 'Player 1: 100', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.p1HealthText.setDepth(102);
        
        // Player 2 health bar (top right)
        this.p2HealthBg = this.scene.add.rectangle(1160, 120, 200, 20, 0x333333);
        this.p2HealthBg.setDepth(100);
        this.p2HealthBar = this.scene.add.rectangle(1160, 120, 200, 16, 0x00ff00);
        this.p2HealthBar.setDepth(101);
        this.p2HealthText = this.scene.add.text(1060, 110, 'Player 2: 100', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.p2HealthText.setDepth(102);
    }
    
    updateTurnIndicator(currentPlayer, gameOver = false) {
        if (gameOver) {
            const winner = this.scene.player1.isDead ? 'Player 2' : 'Player 1';
            this.turnText.setText(`${winner} Wins! Press R to restart`);
        } else {
            const playerName = currentPlayer.playerNumber === 1 ? 'Player 1' : 'Player 2';
            this.turnText.setText(`${playerName} Turn`);
        }
    }
    
    updateAimInfo(angle, power) {
        this.aimText.setText(`Aim: ${angle}°`);
        this.powerText.setText(`Power: ${Math.round(power)}`);
    }
    
    updateHealthBars(player1, player2) {
        // Update Player 1 health bar
        const p1HealthPercent = player1.health / player1.maxHealth;
        this.p1HealthBar.scaleX = p1HealthPercent;
        this.p1HealthBar.fillColor = this.getHealthColor(p1HealthPercent);
        this.p1HealthText.setText(`Player 1: ${Math.max(0, player1.health)}`);
        
        // Update Player 2 health bar
        const p2HealthPercent = player2.health / player2.maxHealth;
        this.p2HealthBar.scaleX = p2HealthPercent;
        this.p2HealthBar.fillColor = this.getHealthColor(p2HealthPercent);
        this.p2HealthText.setText(`Player 2: ${Math.max(0, player2.health)}`);
    }
    
    getHealthColor(healthPercent) {
        if (healthPercent > 0.5) return 0x00ff00; // Green
        if (healthPercent > 0.25) return 0xffff00; // Yellow
        return 0xff0000; // Red
    }
    
    drawShields(player1, player2) {
        // Clear previous shield graphics
        if (this.shieldGraphics) {
            this.shieldGraphics.destroy();
        }
        
        // Draw new shield graphics
        this.shieldGraphics = this.scene.add.graphics();
        
        // Player 1 shield
        if (player1.shieldUp && player1.shieldCooldown <= 0) {
            this.shieldGraphics.fillStyle(0x0088ff, 0.6);
            this.shieldGraphics.fillCircle(player1.x, player1.y, 40);
        }
        
        // Player 2 shield
        if (player2.shieldUp && player2.shieldCooldown <= 0) {
            this.shieldGraphics.fillStyle(0x0088ff, 0.6);
            this.shieldGraphics.fillCircle(player2.x, player2.y, 40);
        }
    }
    
    drawAimingLine(player, angle, isCharging) {
        // Clear previous aiming line
        if (this.aimLine) {
            this.aimLine.destroy();
        }
        
        // Only show aiming line when charging power
        if (!isCharging) return;
        
        const direction = player.playerNumber === 1 ? 1 : -1;
        let displayAngle = angle;
        
        if (direction === -1) {
            displayAngle = 180 - angle;
        }
        
        const lineLength = 80;
        const startX = player.x;
        const startY = player.y - 20;
        const endX = startX + Math.cos(Phaser.Math.DegToRad(-displayAngle)) * lineLength;
        const endY = startY + Math.sin(Phaser.Math.DegToRad(-displayAngle)) * lineLength;
        
        this.aimLine = this.scene.add.line(0, 0, startX, startY, endX, endY, 0xffffff);
        this.aimLine.setOrigin(0, 0);
    }
    
    showBattleCry() {
        // Pick a random battle cry
        const randomCry = this.battleCries[Math.floor(Math.random() * this.battleCries.length)];
        
        // Create the battle cry text
        this.battleCryText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            randomCry,
            {
                font: 'bold 48px Arial',
                fill: '#FFD700', // Gold color
                stroke: '#8B0000', // Dark red outline
                strokeThickness: 4,
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000000',
                    blur: 5,
                    fill: true
                }
            }
        );
        
        this.battleCryText.setOrigin(0.5, 0.5);
        this.battleCryText.setDepth(200); // Above everything else
        
        // Dramatic entrance animation
        this.battleCryText.setScale(0);
        this.battleCryText.setAlpha(0);
        
        // Scale up and fade in
        this.scene.tweens.add({
            targets: this.battleCryText,
            scale: 1.2,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Flash effect
                this.scene.tweens.add({
                    targets: this.battleCryText,
                    scaleX: { from: 1.2, to: 1.4 },
                    scaleY: { from: 1.2, to: 1.4 },
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        // Fade out and remove
                        this.scene.tweens.add({
                            targets: this.battleCryText,
                            alpha: 0,
                            scale: 0.8,
                            duration: 500,
                            delay: 500,
                            onComplete: () => {
                                if (this.battleCryText) {
                                    this.battleCryText.destroy();
                                    this.battleCryText = null;
                                }
                            }
                        });
                    }
                });
            }
        });
        
        // Add screen flash effect
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xFFD700,
            0.3
        );
        flash.setDepth(199); // Just below the text
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }
    
    destroy() {
        // Clean up all UI elements
        if (this.shieldGraphics) {
            this.shieldGraphics.destroy();
        }
        if (this.aimLine) {
            this.aimLine.destroy();
        }
        if (this.battleCryText) {
            this.battleCryText.destroy();
        }
    }
}