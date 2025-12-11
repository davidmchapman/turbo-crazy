import { Vector } from './vector.js';

export class UVP {
    static index = 0;
    static maxIndex = 0;
    static vectors = [];

    static get() {
        let vector = UVP.vectors[UVP.index];

        if (UVP.index === UVP.maxIndex) {
            UVP.index = 0;
        } else {
            UVP.index++;
        }

        return vector;
    }
}

function createVectors() {
    while (UVP.vectors.length < 1000) {
        let x = Math.random() * (1 - -1) + -1;
        let y = Math.random() * (1 - -1) + -1;

        if (!(x === 0 && y === 0)) {
            UVP.vectors.push(new Vector(x, y).normalize());
        }
    }

    UVP.maxIndex = UVP.vectors.length - 1;
}

createVectors();
