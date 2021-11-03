/*
Adapted from:
https://gist.github.com/winduptoy/a1aa09c3499e09edbd33
Simple 2D JavaScript Vector Class
Hacked from evanw's lightgl.js
https://github.com/evanw/lightgl.js/blob/master/src/vector.js
*/

export class Vector {
    x;
    y;

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    }

    subtract(v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        } else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }

    multiply(v) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        } else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    }

    divide(v) {
		if (v instanceof Vector) {
			if(v.x != 0) this.x /= v.x;
			if(v.y != 0) this.y /= v.y;
		} else {
			if(v != 0) {
				this.x /= v;
				this.y /= v;
			}
		}
		return this;
	}

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    length() {
        return Math.sqrt(this.dot(this));
    }

    normalize() {
        return this.divide(this.length());
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    static add (a, b) {
        if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
        else return new Vector(a.x + b, a.y + b);
    }

    static subtract (a, b) {
        if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
        else return new Vector(a.x - b, a.y - b);
    }

    static multiply (a, b) {
        if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
        else return new Vector(a.x * b, a.y * b);
    }

    static dot (a, b) {
        return a.x * b.x + a.y * b.y;
    }

    static distance (a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
