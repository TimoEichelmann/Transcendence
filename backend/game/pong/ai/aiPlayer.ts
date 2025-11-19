import { GameState } from '../models/class';

export class AiPlayer {
    difficulty: 'easy' | 'medium' | 'hard';

    // AI VIEW LIMITATION
    private lastViewUpdate: number = 0;
    private cachedGameState: any = null;
    private readonly VIEW_REFRESH_INTERVAL = 1000; // 1 second

    // AI DECISION MAKING
    private currentInput: 'up' | 'down' | null = null;
    private inputStartTime: number = 0;
    private inputDuration: number = 0; // dynamic, depends on distance
    private anticipatedBallY: number = 50;

    // DIFFICULTY PARAMETERS
    private reactionTime: number;
    private predictionAccuracy: number;

    constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        this.difficulty = difficulty;
        this.setDifficultyParameters();
    }

    private setDifficultyParameters() {
        switch (this.difficulty) {
            case 'easy':
                this.reactionTime = 100;
                this.predictionAccuracy = 0.75;
                break;
            case 'medium':
                this.reactionTime = 50;
                this.predictionAccuracy = 0.85;
                break;
            case 'hard':
                this.reactionTime = 10;
                this.predictionAccuracy = 0.95;
                break;
        }
    }

    getKeyboardInput(gameState: GameState): 'up' | 'down' | null {
        const currentTime = Date.now();

        // Refresh view only once per second
        if (currentTime - this.lastViewUpdate >= this.VIEW_REFRESH_INTERVAL) {
            this.updateAIView(gameState);
            this.lastViewUpdate = currentTime;
            this.makeDecision(currentTime);
        }

        // Continue current input based on dynamic duration
        if (this.currentInput && (currentTime - this.inputStartTime) < Math.abs(this.inputDuration)) {
            return this.currentInput;
        }

        this.currentInput = null;
        return null;
    }

    private updateAIView(gameState: GameState) {
        this.cachedGameState = {
            ballX: gameState.ball.x,
            ballY: gameState.ball.y,
            ballDx: gameState.ball.dx,
            ballDy: gameState.ball.dy,
            ballSpeed: gameState.ball.speed,
            aiPaddleY: gameState.player2.paddle,
            playerPaddleY: gameState.player1.paddle
        };

        this.anticipateBallMovement();
    }

    private anticipateBallMovement() {
        if (!this.cachedGameState) return;

        const { ballX, ballY, ballDx, ballDy, ballSpeed } = this.cachedGameState;

        if (ballDx <= 0) { // Ball moving away
            this.anticipatedBallY = this.cachedGameState.aiPaddleY;
            return;
        }

        // Simulate trajectory with wall bounces
        let simX = ballX;
        let simY = ballY;
        let simDx = ballDx;
        let simDy = ballDy;

        const maxSteps = 1000;
        let steps = 0;

        while (simX < 95 && steps < maxSteps) {
            simX += simDx * ballSpeed;
            simY += simDy * ballSpeed;

            if (simY <= 0 || simY >= 100) {
                simDy *= -1;
                simY = Math.max(0, Math.min(100, simY));
            }
            steps++;
        }

        const error = (Math.random() - 0.5) * (1 - this.predictionAccuracy) * 30;
        this.anticipatedBallY = Math.max(0, Math.min(100, simY + error));
    }

    private makeDecision(currentTime: number) {
        if (!this.cachedGameState) return;

        const paddleY = this.cachedGameState.aiPaddleY;
        const distance = this.anticipatedBallY - paddleY;
        const moveThreshold = 2;

        if (Math.abs(distance) < moveThreshold) {
            this.currentInput = null;
            return;
        }

        // Determine direction
        this.currentInput = distance > 0 ? 'down' : 'up';

        // Dynamic input duration proportional to distance
        const baseDuration = Math.abs(distance) * 10; // 10ms per unit distance
        // Add some randomness to simulate human imperfection
        const randomFactor = (Math.random() - 0.5) * 20; 
        this.inputDuration = baseDuration + randomFactor;

        this.inputStartTime = currentTime + this.reactionTime;
    }

    getDebugInfo() {
        return {
            difficulty: this.difficulty,
            lastViewUpdate: this.lastViewUpdate,
            currentInput: this.currentInput,
            anticipatedBallY: this.anticipatedBallY,
            inputDuration: this.inputDuration
        };
    }
}

// import { GameState } from '../models/class';

// export class AiPlayer {
//     difficulty: 'easy' | 'medium' | 'hard';

//     // AI VIEW LIMITATION: Can only "see" game state once per second
//     private lastViewUpdate: number = 0;
//     private cachedGameState: any = null;
//     private readonly VIEW_REFRESH_INTERVAL = 1000; // 1 second as required

//     // AI DECISION MAKING
//     private currentInput: 'up' | 'down' | null = null;
//     private inputStartTime: number = 0;
//     private anticipatedBallY: number = 50;

//     // DIFFICULTY PARAMETERS
//     private reactionTime: number;
//     private predictionAccuracy: number;
//     private inputDuration: number;

//     constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
//         this.difficulty = difficulty;
//         this.setDifficultyParameters();
//     }

//     private setDifficultyParameters() {
//         switch (this.difficulty) {
//             case 'easy':
//                 this.reactionTime = 150;       // ms delay before moving
//                 this.predictionAccuracy = 0.7; // 70% correct prediction
//                 this.inputDuration = 200;      // how long to hold key
//                 break;
//             case 'medium':
//                 this.reactionTime = 100;
//                 this.predictionAccuracy = 0.85;
//                 this.inputDuration = 400;
//                 break;
//             case 'hard':
//                 this.reactionTime = 1;
//                 this.predictionAccuracy = 0.95;
//                 this.inputDuration = 100;
//                 break;
//         }
//     }

//     /**
//      * MAIN AI FUNCTION: Returns 'up', 'down', or null every game tick
//      */
//     getKeyboardInput(gameState: GameState): 'up' | 'down' | null {
//         const currentTime = Date.now();

//         // Refresh view once per second
//         if (currentTime - this.lastViewUpdate >= this.VIEW_REFRESH_INTERVAL) {
//             this.updateAIView(gameState);
//             this.lastViewUpdate = currentTime;
//             this.makeDecision(currentTime);
//         }

//         // Hold input for specified duration
//         if (this.currentInput && (currentTime - this.inputStartTime) < this.inputDuration) {
//             return this.currentInput;
//         }

//         this.currentInput = null;
//         return null;
//     }

//     /**
//      * AI "SEES" the game state
//      */
//     private updateAIView(gameState: GameState) {
//         this.cachedGameState = {
//             ballX: gameState.ball.x,
//             ballY: gameState.ball.y,
//             ballDx: gameState.ball.dx,
//             ballDy: gameState.ball.dy,
//             ballSpeed: gameState.ball.speed,
//             aiPaddleY: gameState.player2.paddle,
//             playerPaddleY: gameState.player1.paddle,
//             fieldHeight: gameState.fieldHeight || 100,
//             fieldWidth: gameState.fieldWidth || 100,
//         };
//         this.anticipateBallMovement();
//     }

//     /**
//      * Predict ball Y with bounces
//      */
//     private anticipateBallMovement() {
//         if (!this.cachedGameState) return;

//         const { ballX, ballY, ballDx, ballDy, ballSpeed, fieldHeight, fieldWidth } = this.cachedGameState;

//         if (ballDx <= 0) {
//             this.anticipatedBallY = ballY;
//             return;
//         }

//         let simX = ballX;
//         let simY = ballY;
//         let simDx = ballDx;
//         let simDy = ballDy;
//         let maxSteps = Math.ceil((fieldWidth - ballX) / ballSpeed);

//         for (let i = 0; i < maxSteps; i++) {
//             simX += simDx * ballSpeed;
//             simY += simDy * ballSpeed;

//             if (simY <= 0) { simY = 0; simDy *= -1; }
//             if (simY >= fieldHeight) { simY = fieldHeight; simDy *= -1; }
//         }

//         // Add random error for difficulty
//         const error = (Math.random() - 0.5) * (1 - this.predictionAccuracy) * 30;
//         this.anticipatedBallY = Math.max(0, Math.min(fieldHeight, simY + error));
//     }

//     /**
//      * Decide which key to press
//      */
//     private makeDecision(currentTime: number) {
//         if (!this.cachedGameState) return;

//         const { aiPaddleY } = this.cachedGameState;
//         const targetY = this.anticipatedBallY;
//         const distance = targetY - aiPaddleY;
//         const moveThreshold = 3; // ignore tiny movements

//         if (Math.abs(distance) <= moveThreshold) {
//             this.currentInput = null;
//             return;
//         }

//         // Delay reaction but prevent stacking multiple setTimeouts
//         if (!this.currentInput) {
//             setTimeout(() => {
//                 this.currentInput = distance > 0 ? 'down' : 'up';
//                 this.inputStartTime = Date.now();
//             }, this.reactionTime);
//         }
//     }

//     /**
//      * Debug information
//      */
//     getDebugInfo() {
//         return {
//             difficulty: this.difficulty,
//             lastViewUpdate: this.lastViewUpdate,
//             currentInput: this.currentInput,
//             anticipatedBallY: this.anticipatedBallY,
//         };
//     }
// }


// // import { GameState } from '../models/class';

// // export class AiPlayer {
// //     difficulty: 'easy' | 'medium' | 'hard';
    
// //     // AI VIEW LIMITATION: Can only "see" game state once per second
// //     private lastViewUpdate: number = 0;
// //     private cachedGameState: any = null;
// //     private readonly VIEW_REFRESH_INTERVAL = 1000; // 1 second as required
    
// //     // AI DECISION MAKING
// //     private currentInput: 'up' | 'down' | null = null;
// //     private inputStartTime: number = 0;
// //     private anticipatedBallY: number = 50;
// //     private anticipatedTimeToReach: number = 0;
    
// //     // DIFFICULTY PARAMETERS
// //     private reactionTime: number;
// //     private predictionAccuracy: number;
// //     private inputDuration: number; // How long to hold a key press
    
// //     constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
// //         this.difficulty = difficulty;
// //         this.setDifficultyParameters();
// //     }
    
// //     private setDifficultyParameters() {
// //         switch (this.difficulty) {
// //             case 'easy':
// //                 this.reactionTime = 150;        // 150ms reaction delay
// //                 this.predictionAccuracy = 0.75;  // 75% accurate predictions
// //                 this.inputDuration = 150;       // Short key presses
// //                 break;
// //             case 'medium':
// //                 this.reactionTime = 100;        // 100ms reaction delay
// //                 this.predictionAccuracy = 0.8;  // 80% accurate predictions
// //                 this.inputDuration = 250;       // Medium key presses
// //                 break;
// //             case 'hard':
// //                 this.reactionTime = 50;        // 50ms reaction delay
// //                 this.predictionAccuracy = 0.95;  // 95% accurate predictions
// //                 this.inputDuration = 400;       // Longer key presses
// //                 break;
// //         }
// //     }
    
// //     /**
// //      * MAIN AI FUNCTION: Simulates keyboard input based on limited view
// //      * This is called every game tick but AI can only "see" once per second
// //      */
// //     getKeyboardInput(gameState: GameState): 'up' | 'down' | null {
// //         const currentTime = Date.now();
        
// //         // REQUIREMENT: AI can only refresh view once per second
// //         if (currentTime - this.lastViewUpdate >= this.VIEW_REFRESH_INTERVAL) {
// //             this.updateAIView(gameState);
// //             this.lastViewUpdate = currentTime;
// //             this.makeDecision(currentTime);
// //         }
        
// //         // Continue current input or stop based on duration
// //         if (this.currentInput && (currentTime - this.inputStartTime) < this.inputDuration) {
// //             return this.currentInput; // Hold the key for specified duration
// //         }
        
// //         this.currentInput = null;
// //         return null; // No input (release keys)
// //     }
    
// //     /**
// //      * AI "SEES" the game state - only once per second
// //      */
// //     private updateAIView(gameState: GameState) {
// //         this.cachedGameState = {
// //             ballX: gameState.ball.x,
// //             ballY: gameState.ball.y,
// //             ballDx: gameState.ball.dx,
// //             ballDy: gameState.ball.dy,
// //             ballSpeed: gameState.ball.speed,
// //             aiPaddleY: gameState.player2.paddle, // AI is player2
// //             playerPaddleY: gameState.player1.paddle
// //         };
        
// //         // REQUIREMENT: Anticipate bounces and actions
// //         this.anticipateBallMovement();
// //     }
    
// //     /**
// //      * REQUIREMENT: Anticipate bounces and other actions
// //      * Predicts ball movement with wall bounces over time
// //      */
// //     private anticipateBallMovement() {
// //         if (!this.cachedGameState) return;
        
// //         const { ballX, ballY, ballDx, ballDy, ballSpeed } = this.cachedGameState;
        
// //         // Only predict if ball is moving towards AI (right side)
// //         if (ballDx <= 0) {
// //             this.anticipatedBallY = ballY;
// //             this.anticipatedTimeToReach = Infinity;
// //             return;
// //         }
        
// //         // Simulate ball movement with bounces
// //         let simX = ballX;
// //         let simY = ballY;
// //         let simDx = ballDx;
// //         let simDy = ballDy;
// //         let steps = 0;
// //         const maxSteps = 1000; // Prevent infinite loops
        
// //         // Simulate until ball reaches AI paddle area (x > 95)
// //         while (simX < 95 && steps < maxSteps) {
// //             // Move ball one step
// //             simX += simDx * ballSpeed;
// //             simY += simDy * ballSpeed;
            
// //             // Handle wall bounces (Y direction only)
// //             if (simY <= 5 || simY >= 95) { // Account for play area boundaries
// //                 simDy *= -1;
// //                 // Correct position to prevent getting stuck in walls
// //                 if (simY <= 5) simY = 5;
// //                 if (simY >= 95) simY = 95;
// //             }
            
// //             steps++;
// //         }
        
// //         // Add prediction inaccuracy based on difficulty
// //         const error = (Math.random() - 0.5) * (1 - this.predictionAccuracy) * 30;
// //         this.anticipatedBallY = Math.max(10, Math.min(90, simY + error));
// //         this.anticipatedTimeToReach = steps * (1000 / 60); // Convert to milliseconds
// //     }
    
// //     /**
// //      * AI DECISION MAKING: Decides when and how to move
// //      */
// //     private makeDecision(currentTime: number) {
// //         if (!this.cachedGameState) return;
        
// //         const { aiPaddleY } = this.cachedGameState;
// //         const paddleCenter = aiPaddleY;
        
// //         // Calculate where AI needs to move
// //         const targetY = this.anticipatedBallY;
// //         const distance = targetY - paddleCenter;
// //         const moveThreshold = 5; // Don't move for small differences
        
// //         // Add reaction time delay
// //         setTimeout(() => {
// //             if (Math.abs(distance) > moveThreshold) {
// //                 this.currentInput = distance > 0 ? 'down' : 'up';
// //                 this.inputStartTime = Date.now();
// //             }
// //         }, this.reactionTime);
// //     }
    
// //     /**
// //      * Get AI status for debugging
// //      */
// //     getDebugInfo() {
// //         return {
// //             difficulty: this.difficulty,
// //             lastViewUpdate: this.lastViewUpdate,
// //             currentInput: this.currentInput,
// //             anticipatedBallY: this.anticipatedBallY,
// //             anticipatedTimeToReach: this.anticipatedTimeToReach
// //         };
// //     }
// // }