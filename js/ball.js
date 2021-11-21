export class Ball {
    pathNodeIndex = 0;
    rgbColor;
    size;
    twirlSpeed = 0.6;
    twirlAngle = Math.random() * 2 * Math.PI;
    
    constructor(size, rgbColor) {
        this.size = size;
        this.rgbColor = rgbColor;
    }

    equals(ball) {
        if (this.size !== ball.size) {
            return false;
        }

        if (this.rgbColor !== ball.rgbColor) {
            return false;
        }

        return true;
    }

    updateTwirlAngle() {
        let newAngle = this.twirlAngle + this.twirlSpeed;

        if (newAngle < 0) {
            this.twirlAngle = newAngle + 2 * Math.PI;
            return;
        }

        if (newAngle > 2 * Math.PI) {
            this.twirlAngle = newAngle - 2 * Math.PI;
            return;
        }

        this.twirlAngle = newAngle;
    }
}
