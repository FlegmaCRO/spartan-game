class Player {
    constructor(scene, x, y, playerNumber) {
        this.scene = scene;
        this.playerNumber = playerNumber;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, 'spartan');
        this.sprite.setScale(0.8);
        this.sprite.setBounce(0.1);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setGravityY(300);
        this.sprite.body.setSize(this.sprite.width * 0.5, this.sprite.height * 0.8);
        this.sprite.setDepth(1); // Ensure players render above terrain
        
        // Animation system
        this.animationManager = scene.animationManager;
        this.currentAnimation = 'idle';
        this.isJumping = false;
        this.isThrowing = false;
        
        // Health system
        this.maxHealth = 100;
        this.health = 100;
        
        // Movement properties
        this.speed = 160;
        this.jumpPower = 330;
        this.isMoving = false;
        this.wasOnGround = true;
        
        // Shield mechanics
        this.shieldUp = false;
        this.shieldCooldown = 0;
        
        // Set initial facing direction
        if (playerNumber === 2) {
            this.sprite.setFlipX(true);
        }
        
        // Start with idle animation
        this.playIdleAnimation();
    }
    
    update() {
        // Update shield cooldown
        if (this.shieldCooldown > 0) {
            this.shieldCooldown--;
        }
        
        // Handle landing effects
        this.handleLandingEffects();
        
        // Update animations based on state
        this.updateAnimations();
    }
    
    moveLeft() {
        this.sprite.body.setVelocityX(-this.speed);
        this.isMoving = true;
        this.sprite.setFlipX(true);
        
        if (this.sprite.body.touching.down && !this.isThrowing) {
            this.playWalkAnimation();
        }
    }
    
    moveRight() {
        this.sprite.body.setVelocityX(this.speed);
        this.isMoving = true;
        this.sprite.setFlipX(false);
        
        if (this.sprite.body.touching.down && !this.isThrowing) {
            this.playWalkAnimation();
        }
    }
    
    stopMoving() {
        this.sprite.body.setVelocityX(0);
        this.isMoving = false;
        
        if (!this.isThrowing && !this.isJumping) {
            this.playIdleAnimation();
        }
    }
    
    jump() {
        if (this.sprite.body.touching.down) {
            this.sprite.body.setVelocityY(-this.jumpPower);
            this.isJumping = true;
            this.playJumpAnimation();
        }
    }
    
    raiseShield() {
        if (this.shieldCooldown <= 0) {
            this.shieldUp = true;
        }
    }
    
    lowerShield() {
        this.shieldUp = false;
    }
    
    takeDamage(amount) {
        if (this.shieldUp && this.shieldCooldown <= 0) {
            // Blocked!
            this.sprite.setTint(0x00ffff); // Blue flash for block
            this.scene.time.delayedCall(200, () => {
                if (this.sprite.active) this.sprite.clearTint();
            });
            this.shieldCooldown = 180; // 3 second cooldown at 60fps
            return false; // Damage blocked
        } else {
            // Take damage
            this.health -= amount;
            this.sprite.setTint(0xff0000); // Red flash for hit
            this.scene.time.delayedCall(300, () => {
                if (this.sprite.active) this.sprite.clearTint();
            });
            
            if (this.health <= 0) {
                this.health = 0;
                this.playDeathAnimation();
                return true; // Player defeated
            } else {
                this.playHitAnimation();
            }
            return false; // Damage taken but still alive
        }
    }
    
    reset() {
        this.health = this.maxHealth;
        this.sprite.clearTint();
        this.shieldUp = false;
        this.shieldCooldown = 0;
        this.isMoving = false;
        
        // Reset facing direction
        if (this.playerNumber === 1) {
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setFlipX(true);
        }
    }
    
    setPosition(x, y) {
        this.sprite.setPosition(x, y);
    }
    
    handleLandingEffects() {
        // Check if just landed
        if (!this.wasOnGround && this.sprite.body.touching.down) {
            this.createDustParticles();
        }
        
        this.wasOnGround = this.sprite.body.touching.down;
    }
    
    handleWalkingAnimation() {
        if (this.isMoving && this.sprite.body.touching.down) {
            // Simple walking animation - subtle bounce
            const time = this.scene.time.now * 0.01;
            this.sprite.y += Math.sin(time) * 0.5;
        }
    }
    
    createDustParticles() {
        // Simple dust effect using circles
        for (let i = 0; i < 5; i++) {
            const dust = this.scene.add.circle(
                this.sprite.x + (Math.random() - 0.5) * 20,
                this.sprite.y + 30,
                Math.random() * 3 + 2,
                0xD2B48C,
                0.6
            );
            this.scene.tweens.add({
                targets: dust,
                y: dust.y - Math.random() * 30 - 10,
                alpha: 0,
                duration: 500,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    throwSpear() {
        this.isThrowing = true;
        this.playThrowAnimation(() => {
            this.isThrowing = false;
            if (!this.isMoving) {
                this.playIdleAnimation();
            }
        });
    }
    
    // Animation methods
    updateAnimations() {
        // Handle landing from jump
        if (this.isJumping && this.sprite.body.touching.down) {
            this.isJumping = false;
            if (!this.isMoving && !this.isThrowing) {
                this.playIdleAnimation();
            }
        }
    }
    
    playIdleAnimation() {
        if (this.currentAnimation !== 'idle' && this.animationManager) {
            this.currentAnimation = 'idle';
            this.sprite.play('spartan-idle', true);
            
            // Add subtle breathing effect
            if (this.breathingTween) {
                this.breathingTween.stop();
            }
            this.breathingTween = this.scene.tweens.add({
                targets: this.sprite,
                scaleY: { from: 0.8, to: 0.82 },
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    playWalkAnimation() {
        if (this.currentAnimation !== 'walk' && this.animationManager) {
            this.currentAnimation = 'walk';
            this.animationManager.playWalkAnimation(this.sprite);
            
            // Stop breathing effect
            if (this.breathingTween) {
                this.breathingTween.stop();
                this.sprite.scaleY = 0.8;
            }
        }
    }
    
    playJumpAnimation() {
        if (this.animationManager) {
            this.currentAnimation = 'jump';
            this.animationManager.playJumpAnimation(this.sprite);
            
            // Stop other effects
            if (this.breathingTween) {
                this.breathingTween.stop();
                this.sprite.scaleY = 0.8;
            }
        }
    }
    
    playThrowAnimation(callback) {
        if (this.animationManager) {
            this.currentAnimation = 'throw';
            this.animationManager.playThrowAnimation(this.sprite, callback);
            
            // Stop other effects
            if (this.breathingTween) {
                this.breathingTween.stop();
                this.sprite.scaleY = 0.8;
            }
        }
    }
    
    playHitAnimation() {
        if (this.animationManager) {
            this.animationManager.playHitAnimation(this.sprite);
        }
    }
    
    playDeathAnimation() {
        if (this.animationManager) {
            this.currentAnimation = 'death';
            this.animationManager.playDeathAnimation(this.sprite);
            
            // Stop all other effects
            if (this.breathingTween) {
                this.breathingTween.stop();
            }
        }
    }
    
    // Getters for common properties
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get active() { return this.sprite.active; }
    get isOnGround() { return this.sprite.body.touching.down; }
    get isDead() { return this.health <= 0; }
}