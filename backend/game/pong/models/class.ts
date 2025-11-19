export class Player {
    alias: string;
    paddle: number = 50;
    paddleLen: number = 10; // Make paddle bigger (was 3, now 10)
    paddleSpeed: number = 2; // Paddle movement speed per input
    score: number = 0;
    paddleWidth = 1.25;
    edgeOffset = 1;

    constructor(alias: string | undefined, paddleSpeed: number = 2) {
        if (!alias)
            this.alias = "Player 2";
        else
            this.alias = alias;
        this.paddleSpeed = paddleSpeed;
    }

    move(direction: 'up' | 'down') {
        if (direction === 'up') {
            // Clamp paddle to not go beyond top edge
            this.paddle = Math.max(this.paddleLen, this.paddle - 2);
        } else if (direction === 'down') {
            // Clamp paddle to not go beyond bottom edge  
            this.paddle = Math.min(100 - this.paddleLen, this.paddle + 2);
        }
    }

    incrementScore() {
        this.score += 1;
    }
}

export class Ball {
    x: number = 50;
    y: number = 50;
    dx: number = 1;
    dy: number = 1;
    speed: number = 0.5;           // Start with base speed
    baseSpeed: number = 0.5;       // Base speed for resets
    maxSpeed: number = 3;          // Maximum speed limit
    speedIncrement: number = 0.05;  // Small increment per hit
    side: 'none' | 'left' | 'right' = 'none';
    
    // Countdown functionality - start in countdown mode
    isCountingDown: boolean = true;
    countdownTime: number = 3000;
    countdownStartTime: number = Date.now();
    
    move() {
        // Don't move if still counting down
        if (this.isCountingDown) {
            return;
        }
        
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }
    
    updateCountdown() {
        if (!this.isCountingDown) return;
        
        const elapsed = Date.now() - this.countdownStartTime;
        this.countdownTime = Math.max(0, 3000 - elapsed); // 3 second countdown
        
        if (this.countdownTime <= 0) {
            this.isCountingDown = false;
        }
    }
    
    getCountdownNumber(): number {
        if (!this.isCountingDown) return 0;
        return Math.ceil(this.countdownTime / 1000); // Returns 3, 2, 1
    }

    bounce_paddle() {
        this.dx *= -1;
        // Increase speed each time paddle hits the ball
        this.speed = Math.min(this.maxSpeed, this.speed + this.speedIncrement);
        // Removed console.log for performance
    }

    bounce_wall() {
        this.dy *= -1;
        // Don't increase speed on wall bounces, only paddle hits
    }

    reset() {
        this.x = 50;
        this.y = 50;
        // Reset speed when ball resets
        this.speed = this.baseSpeed;
        // Randomize initial direction
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = (Math.random() - 0.5) * 1.5; // Range from -0.75 to +0.75
        while (Math.abs(this.dy) > 0.5) {
            this.dy = (Math.random() - 0.5) * 1.5; // Range from -0.75 to +0.75
        }
        // Start countdown
        this.startCountdown();
        // Removed console.log for performance
    }
    
    startCountdown() {
        // Reset ball position and speed before countdown
        this.x = 50;
        this.y = 50;
        this.speed = this.baseSpeed;
        // Randomize initial direction
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = (Math.random() - 0.5) * 1.5; // Range from -0.75 to +0.75
        if (this.dx === -1)
            this.side = 'left';
        else
            this.side = 'right';

        // Start countdown timer
        this.isCountingDown = true;
        this.countdownTime = 3000; // 3 seconds
        this.countdownStartTime = Date.now();
    }
}

export class GameState {
    id: string;
    player1: Player;
    player2: Player;
    ball: Ball;
    state: 'waiting' | 'playing' | 'player1_wins' | 'player2_wins' | 'ready' | 'connection_lost';
    mode: 'local' | 'ai' | 'remote';

    constructor(id: string, player1: Player, player2: Player, mode: 'local' | 'ai' | 'remote') {
        this.id = id;
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
        this.state = 'waiting';
        this.mode = mode;
    }

    start() {
        this.state = 'playing';
        this.ball.startCountdown(); // Start with countdown instead of reset
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'waiting';
        }
    }

    resume() {
        if (this.state === 'waiting') {
            this.state = 'playing';
        }
    }

    bounceWall() {
        if (this.ball.y <= 1 || this.ball.y >= 99) {
            this.ball.bounce_wall();
        }
    }

    bouncePaddle() {
        const pw = this.player1.paddleWidth;
        const offset = this.player1.edgeOffset;

        // Player 1 (left)
        if (this.ball.x <= offset + pw && this.ball.dx < 0 &&
            this.ball.y >= this.player1.paddle - this.player1.paddleLen &&
            this.ball.y <= this.player1.paddle + this.player1.paddleLen) {
            this.ball.bounce_paddle();
            this.ball.x = offset + pw; // prevent sticking
        }

        // Player 2 (right)
        if (this.ball.x >= 100 - offset - pw && this.ball.dx > 0 &&
            this.ball.y >= this.player2.paddle - this.player2.paddleLen &&
            this.ball.y <= this.player2.paddle + this.player2.paddleLen) {
            this.ball.bounce_paddle();
            this.ball.x = 100 - offset - pw; // prevent sticking
        }
    }

    reachEnd() {
        if (this.ball.x >= 100) {
            this.player1.incrementScore();
            this.ball.reset();
            // Check for win condition
            if (this.player1.score >= 5) {
                this.state = 'player1_wins';
            }
        } else if (this.ball.x <= 0) {
            this.player2.incrementScore();
            this.ball.reset();
            // Check for win condition
            if (this.player2.score >= 5) {
                this.state = 'player2_wins';
            }
        }
    }
}
