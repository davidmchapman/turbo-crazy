export class Path {
    nodes = [];
    balls = [];
    redo = [];
    speed = 2;
    ballSize = 6;
    isTwirling = false;
    isSparking= false;

    adjustSize(adjustment) {
        if ((adjustment < 0 && this.ballSize > 1) ||
            (adjustment > 0 && this.ballSize < 30)) {
            this.ballSize += adjustment;
        }
    }

    adjustSpeed(adjustment) {
        if ((adjustment < 0 && this.speed > -5) ||
            (adjustment > 0 && this.speed < 5)) {
            this.speed += adjustment;
        }
    }
}
