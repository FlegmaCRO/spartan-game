class Weapon {
    constructor(scene, x, y, angle, power, owner) {
        this.scene = scene;
        this.owner = owner;
        
        // Create spear sprite
        this.sprite = scene.physics.add.sprite(x, y - 20, 'spear');
        this.sprite.setScale(0.8);
        this.sprite.setDepth(2); // Render above players and terrain
        this.sprite.body.setGravityY(400);
        
        // Set trajectory
        this.angle = angle;
        this.power = power;
        
        // Determine direction and flip sprite if needed
        if (owner.playerNumber === 2) {
            this.sprite.setFlipX(true);
        }
        
        // Apply physics velocity
        scene.physics.velocityFromAngle(-angle, power, this.sprite.body.velocity);
        
        // Create trail effect
        this.createTrail();
        
        // Set up collision checking
        this.setupCollisionChecking();
    }
    
    createTrail() {
        // Simple trail effect using circles
        this.trailPoints = [];
        
        this.trailTimer = this.scene.time.addEvent({
            delay: 32,
            callback: this.updateTrail.bind(this),
            repeat: -1
        });
    }
    
    updateTrail() {
        if (this.sprite.active) {
            // Add current position to trail
            this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });
            
            // Limit trail length
            if (this.trailPoints.length > 5) {
                this.trailPoints.shift();
            }
            
            // Clear previous trail graphics
            if (this.trailGraphics) {
                this.trailGraphics.destroy();
            }
            
            // Draw trail
            this.trailGraphics = this.scene.add.graphics();
            this.trailGraphics.fillStyle(0x8B4513);
            
            for (let i = 0; i < this.trailPoints.length; i++) {
                const point = this.trailPoints[i];
                const size = (i + 1) * 1;
                const alpha = (i + 1) / this.trailPoints.length * 0.5;
                this.trailGraphics.fillStyle(0x8B4513, alpha);
                this.trailGraphics.fillCircle(point.x, point.y, size);
            }
        } else {
            this.cleanupTrail();
        }
    }
    
    cleanupTrail() {
        if (this.trailGraphics) {
            this.trailGraphics.destroy();
        }
        if (this.trailTimer) {
            this.trailTimer.destroy();
        }
    }
    
    setupCollisionChecking() {
        // Check for terrain collision each frame
        this.collisionTimer = this.scene.time.addEvent({
            delay: 16,
            callback: () => {
                if (this.sprite.active && this.scene.terrain && 
                    this.scene.terrain.checkCollision(this.sprite.x, this.sprite.y)) {
                    this.handleTerrainHit();
                }
            },
            repeat: -1
        });
        
        // Check for world bounds
        this.scene.physics.world.on('worldbounds', (event, body) => {
            if (body.gameObject === this.sprite) {
                this.handleTerrainHit();
            }
        });
    }
    
    handlePlayerHit(target) {
        const wasDefeated = target.takeDamage(25);
        
        // Visual effects
        this.createImpactEffect(this.sprite.x, this.sprite.y, 0xff0000);
        this.scene.cameras.main.shake(200, 0.01);
        
        // Clean up and destroy spear
        this.destroy();
        
        return wasDefeated;
    }
    
    handleTerrainHit() {
        // Create crater in terrain
        if (this.scene.terrain) {
            this.scene.terrain.createCrater(this.sprite.x, this.sprite.y, 40);
        }
        
        // Visual effects
        this.createImpactEffect(this.sprite.x, this.sprite.y, 0x8B4513);
        this.scene.cameras.main.shake(200, 0.01);
        
        // Clean up and destroy spear
        this.destroy();
    }
    
    createImpactEffect(x, y, color) {
        // Simple impact effect using circles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = Math.random() * 30 + 10;
            const particle = this.scene.add.circle(x, y, Math.random() * 4 + 2, color, 0.8);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    destroy() {
        this.cleanupTrail();
        
        if (this.collisionTimer) {
            this.collisionTimer.destroy();
        }
        
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
    
    // Getters
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get active() { return this.sprite.active; }
}