class GomokuGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentPlayerEl = document.getElementById('currentPlayer');
        this.messageEl = document.getElementById('message');
        this.restartBtn = document.getElementById('restartBtn');
        
        this.boardSize = 15;
        this.cellSize = 40;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        this.gameOver = false;
        this.currentPlayer = 'black';
        this.updatePlayerDisplay();
        this.messageEl.textContent = '';
        
        this.drawBoard();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.restartBtn.addEventListener('click', () => this.restart());
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 计算点击位置对应的棋盘坐标，减去偏移量
        const col = Math.round((x - this.cellSize / 2) / this.cellSize);
        const row = Math.round((y - this.cellSize / 2) / this.cellSize);
        
        if (col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize) {
            if (this.board[row][col] === null) {
                this.placePiece(row, col);
            }
        }
    }
    
    placePiece(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.drawPiece(row, col, this.currentPlayer);
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            const winner = this.currentPlayer === 'black' ? '黑棋' : '白棋';
            this.messageEl.textContent = `${winner}获胜！`;
            this.messageEl.style.color = this.currentPlayer === 'black' ? '#000' : '#666';
            return;
        }
        
        if (this.checkDraw()) {
            this.gameOver = true;
            this.messageEl.textContent = '平局！';
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerDisplay();
    }
    
    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]],
            [[1, 0], [-1, 0]],
            [[1, 1], [-1, -1]],
            [[1, -1], [-1, 1]]
        ];
        
        for (let direction of directions) {
            let count = 1;
            
            for (let [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                
                while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                       this.board[r][c] === this.currentPlayer) {
                    count++;
                    r += dx;
                    c += dy;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    checkDraw() {
        for (let row of this.board) {
            for (let cell of row) {
                if (cell === null) return false;
            }
        }
        return true;
    }
    
    drawBoard() {
        this.ctx.fillStyle = '#DDB896';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.lineTo(this.canvas.width - this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize + this.cellSize / 2, this.cellSize / 2);
            this.ctx.lineTo(i * this.cellSize + this.cellSize / 2, this.canvas.height - this.cellSize / 2);
            this.ctx.stroke();
        }
        
        const dots = [
            [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
        ];
        
        this.ctx.fillStyle = '#333';
        for (let [row, col] of dots) {
            this.ctx.beginPath();
            this.ctx.arc(col * this.cellSize + this.cellSize / 2, 
                        row * this.cellSize + this.cellSize / 2, 
                        3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPiece(row, col, color) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.cellSize / 2 - 4, 0, Math.PI * 2);
        
        if (color === 'black') {
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.cellSize / 2);
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.cellSize / 2);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    updatePlayerDisplay() {
        this.currentPlayerEl.textContent = this.currentPlayer === 'black' ? '黑棋' : '白棋';
        this.currentPlayerEl.style.color = this.currentPlayer === 'black' ? '#000' : '#666';
    }
    
    restart() {
        this.init();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});