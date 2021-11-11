export class Path {
    nodes = [];
    balls = [];
    redo = [];
    speed = 1;

    adjustSpeed(adjustment) {
        if ((adjustment < 0 && this.speed > -5) ||
            (adjustment > 0 && this.speed < 5)) {
            this.speed += adjustment;
        }
    }
}
