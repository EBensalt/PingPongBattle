export const    HEIGHT = 450,
                WIDTH = 700,
                RACKET_WIDTH = 15,
                RACKET_HEIGHT = 80,
                MAX_SPEED = 50,
                INITIAL_SPEED = 8,
                INC_SPEED = 0.75,
                MAX_SCORE = 10,
                BALL_DIAMETER = 15,
                BALL_DIAMETER_SQUARED = BALL_DIAMETER * BALL_DIAMETER,
                GAME_START_DELAY = 3100,
                GAME_INTERVAL = 1000/60;

export class gameConfig {
    maxScore: number;
    ballSpeed: number;
    boost: boolean;
    constructor(maxScore: number, ballSpeed: number, boost: boolean) {
        this.maxScore = maxScore;
        this.ballSpeed = ballSpeed;
        this.boost = boost;
    }
}