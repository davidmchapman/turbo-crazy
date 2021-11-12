export class Path {
    nodes = [];
    balls = [];
    redo = [];
    speed = 1;
    ballSize = 4;
    isTwirling = false;

    adjustSize(adjustment) {
        if ((adjustment < 0 && this.ballSize > 1) ||
            (adjustment > 0 && this.ballSize < 20)) {
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
