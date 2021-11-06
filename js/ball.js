export class Ball {
    pathNodeIndex = 0;
    size;
    rgbaArray;

    constructor(size, rgbaArray) {
        this.size = size;
        this.rgbaArray = rgbaArray;
    }

    equals (ball) {
        if (this.size !== ball.size) {
            return false;
        }

        return this.rgbaArray.length === ball.rgbaArray.length && this.rgbaArray.every((value, i) => value === ball.rgbaArray[i]);
    }
}
