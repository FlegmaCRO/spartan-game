class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.createAnimations();
    }
    
    createAnimations() {
        // Create all Spartan animations
        this.createSpartanAnimations();
        this.createWeaponAnimations();
    }
    
    createSpartanAnimations() {
        // For now, we'll create placeholder animations
        // You can replace these with actual sprite sheet frames later
        
        // Idle animation (subtle breathing)
        if (!this.scene.anims.exists('spartan-idle')) {
            this.scene.anims.create({
                key: 'spartan-idle',
                frames: [
                    { key: 'spartan', frame: 0 }
                ],
                frameRate: 2,
                repeat: -1,
                yoyo: false
            });
        }
        
        // Walking animation
        if (!this.scene.anims.exists('spartan-walk')) {
            this.scene.anims.create({
                key: 'spartan-walk',
                frames: [
                    { key: 'spartan', frame: 0 }
                ],
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Jumping animation
        if (!this.scene.anims.exists('spartan-jump')) {
            this.scene.anims.create({
                key: 'spartan-jump',
                frames: [
                    { key: 'spartan', frame: 0 }
                ],
                frameRate: 10,
                repeat: 0
            });
        }
        
        // Throwing animation
        if (!this.scene.anims.exists('spartan-throw')) {
            this.scene.anims.create({
                key: 'spartan-throw',
                frames: [
                    { key: 'spartan', frame: 0 }
                ],
                frameRate: 12,
                repeat: 0
            });
        }
        
        // Hit/damage animation
        if (!this.scene.anims.exists('spartan-hit')) {
            this.scene.anims.create({
                key: 'spartan-hit',
                frames: [
                    { key: 'spartan', frame: 0 }
                ],
                frameRate: 15,
                repeat: 0
            });
        }
        
        // Death animation
        if (!this.scene.anims.exists('spartan-death')) {
            this.scene.anims.create({
                key: 'spartan-death',
                frames: [
                    { key: 'spartan', frame: 0 }
                ],
                frameRate: 8,
                repeat: 0
            });
        }
    }
    
    createWeaponAnimations() {
        // Spear spinning animation during flight
        if (!this.scene.anims.exists('spear-spin')) {
            this.scene.anims.create({
                key: 'spear-spin',
                frames: [
                    { key: 'spear', frame: 0 }
                ],
                frameRate: 20,
                repeat: -1
            });
        }
    }
    
    // Method to load actual sprite sheets when available
    loadSpriteSheets() {
        // Example of how to load sprite sheets:
        // this.scene.load.spritesheet('spartan-sheet', 'js/assets/spartan-spritesheet.png', {
        //     frameWidth: 64,
        //     frameHeight: 64
        // });
        
        // For now, we'll create a simple animated effect using the existing sprite
        this.createPlaceholderAnimations();
    }
    
    createPlaceholderAnimations() {
        // Create simple animations using tween effects on the existing sprites
        // This gives animation-like effects until real sprite sheets are added
        
        // Breathing effect for idle
        this.createBreathingEffect();
    }
    
    createBreathingEffect() {
        // This will be applied to players in their idle state
        return {
            targets: null, // Will be set when applied to a sprite
            scaleY: { from: 1.0, to: 1.02 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        };
    }
    
    // Enhanced animation methods for better visual effects
    playWalkAnimation(sprite) {
        sprite.play('spartan-walk', true);
        
        // Add subtle bounce effect
        if (!sprite.walkTween || !sprite.walkTween.isPlaying()) {
            sprite.walkTween = this.scene.tweens.add({
                targets: sprite,
                y: sprite.y - 2,
                duration: 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    stopWalkAnimation(sprite) {
        sprite.play('spartan-idle', true);
        
        // Stop bounce effect
        if (sprite.walkTween) {
            sprite.walkTween.stop();
            sprite.walkTween = null;
        }
    }
    
    playThrowAnimation(sprite, callback) {
        sprite.play('spartan-throw', true);
        
        // Add throw motion effect
        this.scene.tweens.add({
            targets: sprite,
            scaleX: sprite.flipX ? -1.1 : 1.1,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                sprite.play('spartan-idle', true);
                if (callback) callback();
            }
        });
    }
    
    playJumpAnimation(sprite) {
        sprite.play('spartan-jump', true);
        
        // Add jump stretch effect
        this.scene.tweens.add({
            targets: sprite,
            scaleY: 1.1,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                sprite.play('spartan-idle', true);
            }
        });
    }
    
    playHitAnimation(sprite) {
        sprite.play('spartan-hit', true);
        
        // Add impact shake effect
        const originalX = sprite.x;
        this.scene.tweens.add({
            targets: sprite,
            x: originalX + 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                sprite.x = originalX;
                sprite.play('spartan-idle', true);
            }
        });
    }
    
    playDeathAnimation(sprite, callback) {
        sprite.play('spartan-death', true);
        
        // Add death fall effect
        this.scene.tweens.add({
            targets: sprite,
            angle: sprite.flipX ? -90 : 90,
            alpha: 0.7,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                if (callback) callback();
            }
        });
    }
    
    // Spear animation effects (removed spinning - spears should fly straight)
}