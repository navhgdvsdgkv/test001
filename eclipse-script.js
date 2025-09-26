class EclipseAnimation {
    constructor() {
        this.canvas = document.getElementById('eclipseCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // 日蚀参数
        this.sunRadius = 80;
        this.moonRadius = 85;
        this.orbitRadiusX = 200;
        this.orbitRadiusY = 150;
        this.angle = 0;
        this.animationSpeed = 1;
        this.isPlaying = false;
        this.showOrbit = true;
        this.showGlow = true;
        
        // 日蚀阶段
        this.phases = [
            { name: '初亏', start: 0, end: 0.2 },
            { name: '食既', start: 0.2, end: 0.4 },
            { name: '食甚', start: 0.4, end: 0.6 },
            { name: '生光', start: 0.6, end: 0.8 },
            { name: '复圆', start: 0.8, end: 1.0 }
        ];
        
        this.currentPhase = 0;
        this.progress = 0;
        
        // 粒子系统
        this.particles = [];
        this.stars = [];
        
        this.init();
    }
    
    init() {
        this.createStars();
        this.setupEventListeners();
        this.animate();
    }
    
    createStars() {
        // 创建背景星星
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    setupEventListeners() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const showOrbit = document.getElementById('showOrbit');
        const showGlow = document.getElementById('showGlow');
        
        playBtn.addEventListener('click', () => {
            this.isPlaying = true;
            playBtn.textContent = '播放中';
            playBtn.style.opacity = '0.6';
        });
        
        pauseBtn.addEventListener('click', () => {
            this.isPlaying = false;
            playBtn.textContent = '开始';
            playBtn.style.opacity = '1';
        });
        
        resetBtn.addEventListener('click', () => {
            this.reset();
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.animationSpeed.toFixed(1) + 'x';
        });
        
        showOrbit.addEventListener('change', (e) => {
            this.showOrbit = e.target.checked;
        });
        
        showGlow.addEventListener('change', (e) => {
            this.showGlow = e.target.checked;
        });
    }
    
    reset() {
        this.angle = 0;
        this.progress = 0;
        this.currentPhase = 0;
        this.isPlaying = false;
        this.particles = [];
        document.getElementById('playBtn').textContent = '开始';
        document.getElementById('playBtn').style.opacity = '1';
        this.updatePhase();
    }
    
    updatePhase() {
        const oldPhase = this.currentPhase;
        for (let i = 0; i < this.phases.length; i++) {
            if (this.progress >= this.phases[i].start && this.progress < this.phases[i].end) {
                this.currentPhase = i;
                break;
            }
        }
        
        if (oldPhase !== this.currentPhase) {
            document.getElementById('currentPhase').textContent = this.phases[this.currentPhase].name;
            
            // 在关键阶段创建粒子效果
            if (this.currentPhase === 2) { // 食甚阶段
                this.createCoronaParticles();
            }
        }
        
        // 更新进度条
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = (this.progress * 100) + '%';
    }
    
    createCoronaParticles() {
        // 创建日冕粒子效果
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.sunRadius + Math.random() * 50;
            this.particles.push({
                x: this.centerX + Math.cos(angle) * distance,
                y: this.centerY + Math.sin(angle) * distance,
                vx: Math.cos(angle) * (Math.random() * 2 + 1),
                vy: Math.sin(angle) * (Math.random() * 2 + 1),
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
                color: `hsl(${Math.random() * 60 + 30}, 100%, ${Math.random() * 30 + 70}%)`,
                life: 1
            });
        }
    }
    
    drawStars() {
        // 优化：批量绘制星星
        this.ctx.save();
        this.stars.forEach(star => {
            star.opacity += Math.sin(Date.now() * star.twinkle) * 0.01;
            star.opacity = Math.max(0.1, Math.min(1, star.opacity));
            
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }
    
    drawOrbit() {
        if (!this.showOrbit) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.ellipse(this.centerX, this.centerY, this.orbitRadiusX, this.orbitRadiusY, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }
    
    drawSun() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.sunRadius
        );
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.3, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        
        this.ctx.save();
        
        // 太阳光晕
        if (this.showGlow) {
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 30;
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.sunRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 太阳表面纹理
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            const spotX = this.centerX + (Math.random() - 0.5) * this.sunRadius;
            const spotY = this.centerY + (Math.random() - 0.5) * this.sunRadius;
            const spotRadius = Math.random() * 10 + 5;
            
            this.ctx.fillStyle = '#FF6347';
            this.ctx.beginPath();
            this.ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawMoon() {
        const moonX = this.centerX + Math.cos(this.angle) * this.orbitRadiusX;
        const moonY = this.centerY + Math.sin(this.angle) * this.orbitRadiusY;
        
        this.ctx.save();
        
        // 月亮阴影
        if (this.showGlow) {
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 20;
        }
        
        // 月亮渐变
        const moonGradient = this.ctx.createRadialGradient(
            moonX - 20, moonY - 20, 0,
            moonX, moonY, this.moonRadius
        );
        moonGradient.addColorStop(0, '#F5F5F5');
        moonGradient.addColorStop(0.5, '#D3D3D3');
        moonGradient.addColorStop(1, '#A9A9A9');
        
        this.ctx.fillStyle = moonGradient;
        this.ctx.beginPath();
        this.ctx.arc(moonX, moonY, this.moonRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 月亮表面环形山
        this.ctx.globalAlpha = 0.2;
        for (let i = 0; i < 8; i++) {
            const craterX = moonX + (Math.random() - 0.5) * this.moonRadius;
            const craterY = moonY + (Math.random() - 0.5) * this.moonRadius;
            const craterRadius = Math.random() * 8 + 3;
            
            this.ctx.fillStyle = '#808080';
            this.ctx.beginPath();
            this.ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.01;
            particle.opacity = particle.life;
            
            if (particle.life <= 0) return false;
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            return true;
        });
    }
    
    update() {
        if (this.isPlaying) {
            this.angle += 0.01 * this.animationSpeed;
            this.progress = (this.angle % (Math.PI * 2)) / (Math.PI * 2);
            this.updatePhase();
        }
        
        // 优化：限制粒子数量
        if (this.particles.length > 100) {
            this.particles = this.particles.slice(-100);
        }
    }
    
    draw() {
        // 清空画布 - 使用渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(1, '#000033');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制各个元素
        this.drawStars();
        this.drawOrbit();
        this.drawSun();
        this.drawMoon();
        this.drawParticles();
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化日蚀动画
window.addEventListener('load', () => {
    new EclipseAnimation();
});