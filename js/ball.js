export class Ball {
    pathNodeIndex = 0;
    size;
    rgbColor;

    constructor(size, rgbColor) {
        this.size = size;
        this.rgbColor = rgbColor;
    }

    equals (ball) {
        if (this.size !== ball.size) {
            return false;
        }

        if (this.rgbColor !== ball.rgbColor) {
            return false;
        }

        return true;
    }
}
