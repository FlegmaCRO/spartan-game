class Terrain {
    constructor(scene, width = 1280, height = 720) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.terrainData = [];
        
        this.generateTerrain();
        this.updateGraphics();
    }
    
    generateTerrain() {
        const terrainHeight = 100;
        
        // Initialize terrain data (1 = solid, 0 = empty)
        for (let x = 0; x < this.width; x++) {
            this.terrainData[x] = [];
            for (let y = 0; y < this.height; y++) {
                // Create hilly terrain
                const hillHeight = Math.sin(x * 0.01) * 30 + Math.sin(x * 0.003) * 20;
                if (y > this.height - terrainHeight - hillHeight) {
                    this.terrainData[x][y] = 1;
                } else {
                    this.terrainData[x][y] = 0;
                }
            }
        }
    }
    
    updateGraphics() {
        // Destroy previous graphics
        if (this.graphics) {
            this.graphics.destroy();
        }
        
        // Create new graphics
        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(-1); // Put terrain behind players
        this.graphics.fillStyle(0x8B4513); // Brown terrain color
        
        // Draw terrain pixels (sample every 2 pixels for performance)
        for (let x = 0; x < this.width; x += 2) {
            for (let y = 0; y < this.height; y += 2) {
                if (this.terrainData[x] && this.terrainData[x][y]) {
                    this.graphics.fillRect(x, y, 2, 2);
                }
            }
        }
    }
    
    checkCollision(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        return this.terrainData[x] && this.terrainData[x][y] === 1;
    }
    
    createCrater(centerX, centerY, radius) {
        centerX = Math.floor(centerX);
        centerY = Math.floor(centerY);
        
        // Remove terrain in a circle
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (distance <= radius) {
                        if (this.terrainData[x]) {
                            this.terrainData[x][y] = 0;
                        }
                    }
                }
            }
        }
        
        // Update visual representation
        this.updateGraphics();
        
        // Check if players need to fall
        this.checkPlayerSupport();
    }
    
    checkPlayerSupport() {
        // Get all players from the scene
        const players = [this.scene.player1, this.scene.player2];
        
        players.forEach(player => {
            if (player && player.active) {
                const groundY = this.findGroundLevel(player.x);
                if (player.y < groundY - 10) {
                    // Player is floating, let physics handle the fall
                    player.sprite.body.setVelocityY(50);
                }
            }
        });
    }
    
    findGroundLevel(x) {
        x = Math.floor(x);
        if (x < 0 || x >= this.width) return this.height;
        
        // Find the topmost solid pixel
        for (let y = 0; y < this.height; y++) {
            if (this.terrainData[x] && this.terrainData[x][y] === 1) {
                return y;
            }
        }
        return this.height; // Return bottom if no ground found
    }
    
    reset() {
        this.generateTerrain();
        this.updateGraphics();
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}