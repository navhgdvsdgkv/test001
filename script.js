class Ball {
    constructor(x, y, radius, color, mass = 1) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.color = color;
        this.mass = mass;
        this.friction = 0.98;
        this.isPotted = false;
    }

    update() {
        if (this.isPotted) return;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
            this.vx = 0;
            this.vy = 0;
        }
    }

    draw(ctx) {
        if (this.isPotted) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (this.color === 'white') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#ddd';
            ctx.fill();
        }
    }
}

class Pocket {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

class PoolGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.balls = [];
        this.pockets = [];
        this.cueBall = null;
        this.isAiming = false;
        this.aimStartX = 0;
        this.aimStartY = 0;
        this.power = 0;
        this.maxPower = 20;
        this.score = 0;
        this.gameRunning = true;
        
        this.setupGame();
        this.setupEventListeners();
        this.gameLoop();
    }

    setupGame() {
        this.balls = [];
        this.pockets = [];
        
        // 创建球袋
        const pocketRadius = 25;
        this.pockets = [
            new Pocket(pocketRadius, pocketRadius, pocketRadius),
            new Pocket(this.canvas.width - pocketRadius, pocketRadius, pocketRadius),
            new Pocket(pocketRadius, this.canvas.height - pocketRadius, pocketRadius),
            new Pocket(this.canvas.width - pocketRadius, this.canvas.height - pocketRadius, pocketRadius),
            new Pocket(this.canvas.width / 2, pocketRadius, pocketRadius),
            new Pocket(this.canvas.width / 2, this.canvas.height - pocketRadius, pocketRadius)
        ];

        // 创建主球
        this.cueBall = new Ball(200, this.canvas.height / 2, 12, 'white');
        this.balls.push(this.cueBall);

        // 创建彩球（三角排列）
        const colors = ['red', 'yellow', 'blue', 'purple', 'orange', 'green', 'brown', 'black'];
        const startX = 600;
        const startY = this.canvas.height / 2;
        const ballRadius = 12;
        const spacing = ballRadius * 2.1;

        let ballIndex = 0;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col <= row; col++) {
                if (ballIndex < colors.length) {
                    const x = startX + row * spacing * 0.866;
                    const y = startY + (col - row / 2) * spacing;
                    this.balls.push(new Ball(x, y, ballRadius, colors[ballIndex]));
                    ballIndex++;
                }
            }
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.gameRunning || this.ballsMoving()) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.aimStartX = e.clientX - rect.left;
            this.aimStartY = e.clientY - rect.top;
            this.isAiming = true;
            this.power = 0;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isAiming) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const dx = currentX - this.cueBall.x;
            const dy = currentY - this.cueBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.power = Math.min(distance / 10, this.maxPower);
            this.updatePowerMeter();
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isAiming) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            
            const dx = endX - this.cueBall.x;
            const dy = endY - this.cueBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const power = Math.min(distance / 10, this.maxPower);
                const angle = Math.atan2(dy, dx);
                
                this.cueBall.vx = Math.cos(angle) * power * 0.3;
                this.cueBall.vy = Math.sin(angle) * power * 0.3;
            }
            
            this.isAiming = false;
            this.power = 0;
            this.updatePowerMeter();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.gameRunning = !this.gameRunning;
            document.getElementById('pauseBtn').textContent = this.gameRunning ? '暂停' : '继续';
        });
    }

    ballsMoving() {
        return this.balls.some(ball => !ball.isPotted && (Math.abs(ball.vx) > 0.1 || Math.abs(ball.vy) > 0.1));
    }

    checkCollisions() {
        // 球与球的碰撞
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];
                
                if (ball1.isPotted || ball2.isPotted) continue;
                
                const dx = ball2.x - ball1.x;
                const dy = ball2.y - ball1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball1.radius + ball2.radius) {
                    // 碰撞处理
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);
                    
                    // 旋转坐标
                    const vx1 = ball1.vx * cos + ball1.vy * sin;
                    const vy1 = ball1.vy * cos - ball1.vx * sin;
                    const vx2 = ball2.vx * cos + ball2.vy * sin;
                    const vy2 = ball2.vy * cos - ball2.vx * sin;
                    
                    // 碰撞后速度
                    const finalVx1 = ((ball1.mass - ball2.mass) * vx1 + 2 * ball2.mass * vx2) / (ball1.mass + ball2.mass);
                    const finalVx2 = ((ball2.mass - ball1.mass) * vx2 + 2 * ball1.mass * vx1) / (ball1.mass + ball2.mass);
                    
                    // 旋转回原坐标
                    ball1.vx = finalVx1 * cos - vy1 * sin;
                    ball1.vy = vy1 * cos + finalVx1 * sin;
                    ball2.vx = finalVx2 * cos - vy2 * sin;
                    ball2.vy = vy2 * cos + finalVx2 * sin;
                    
                    // 分离球
                    const overlap = ball1.radius + ball2.radius - distance;
                    const separateX = (dx / distance) * overlap * 0.5;
                    const separateY = (dy / distance) * overlap * 0.5;
                    
                    ball1.x -= separateX;
                    ball1.y -= separateY;
                    ball2.x += separateX;
                    ball2.y += separateY;
                }
            }
        }
        
        // 球与边界的碰撞
        this.balls.forEach(ball => {
            if (ball.isPotted) return;
            
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
                ball.vx = -ball.vx * 0.8;
                ball.x = Math.max(ball.radius, Math.min(this.canvas.width - ball.radius, ball.x));
            }
            
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.canvas.height) {
                ball.vy = -ball.vy * 0.8;
                ball.y = Math.max(ball.radius, Math.min(this.canvas.height - ball.radius, ball.y));
            }
        });
        
        // 检查球是否进袋
        this.balls.forEach(ball => {
            if (ball.isPotted) return;
            
            this.pockets.forEach(pocket => {
                const dx = ball.x - pocket.x;
                const dy = ball.y - pocket.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < pocket.radius - ball.radius) {
                    ball.isPotted = true;
                    if (ball !== this.cueBall) {
                        this.score += 10;
                        this.updateScore();
                    } else {
                        // 主球进袋，重新放置
                        setTimeout(() => {
                            ball.isPotted = false;
                            ball.x = 200;
                            ball.y = this.canvas.height / 2;
                            ball.vx = 0;
                            ball.vy = 0;
                        }, 1000);
                    }
                }
            });
        });
    }

    updatePowerMeter() {
        const powerFill = document.getElementById('powerFill');
        const percentage = (this.power / this.maxPower) * 100;
        powerFill.style.width = percentage + '%';
    }

    updateScore() {
        document.getElementById('playerScore').textContent = this.score;
        
        // 检查是否获胜
        const colorBalls = this.balls.filter(ball => ball !== this.cueBall);
        const pottedBalls = colorBalls.filter(ball => ball.isPotted);
        
        if (pottedBalls.length === colorBalls.length) {
            setTimeout(() => {
                alert('恭喜你！游戏胜利！');
                this.resetGame();
            }, 500);
        }
    }

    resetGame() {
        this.score = 0;
        this.updateScore();
        this.setupGame();
        this.gameRunning = true;
        document.getElementById('pauseBtn').textContent = '暂停';
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0f4a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制球袋
        this.pockets.forEach(pocket => pocket.draw(this.ctx));
        
        // 绘制球
        this.balls.forEach(ball => ball.draw(this.ctx));
        
        // 绘制瞄准线
        if (this.isAiming && !this.ballsMoving()) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.cueBall.x, this.cueBall.y);
            this.ctx.lineTo(this.aimStartX, this.aimStartY);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    gameLoop() {
        if (this.gameRunning) {
            this.balls.forEach(ball => ball.update());
            this.checkCollisions();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new PoolGame();
});