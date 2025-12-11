import { Vector } from './vector.js';
import { UVP } from './unit-vector-provider.js';

export class Spark {
    decay;
    rgbColor;
    opacity = 1;
    velocity;
    head;
    tail;

    constructor(xStart, yStart, length, speed, rgbColor, decay) {
        let u = UVP.get();
        
        this.decay = decay;
        this.rgbColor = rgbColor;
        this.velocity = Vector.multiply(u, speed);
        this.tail = new Vector(xStart, yStart);
        this.head = Vector.multiply(u, length).add(this.tail);
    }

    getEndpoints() {
        
        let curTail = { x: this.tail.x, y: this.tail.y };
        let curHead = { x: this.head.x, y: this.head.y };

        if (this.opacity > 0) {
            this.tail = this.tail.add(this.velocity);
            this.head = this.head.add(this.velocity);

            this.opacity -= this.decay;

            if (this.opacity < 0) {
                this.opacity = 0;
            }
        }

        return [curTail, curHead];
    }

    static generate(xStart, yStart, length, speed, rgbColor, decay, quantity) {
        let sparks = [];

        for (let i = 0; i < quantity; i++) {
            sparks.push(new Spark(xStart, yStart, length, speed, rgbColor, decay));
        }

        return sparks;
    }
}
