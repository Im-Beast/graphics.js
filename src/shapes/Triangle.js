const Shape = require('../Shape');
const Line  = require('./Line');

class Triangle extends Shape {
    constructor(firstX, firstY, secondX, secondY, thirdX, thirdY) {
        super('Triangle');

        this.pixels = { }

        let lines = [
           new Line(firstX, firstY, secondX, secondY).pixels,
           new Line(secondX, secondY, thirdX, thirdY).pixels,
           new Line(thirdX, thirdY, firstX, firstY).pixels
        ];

        lines.forEach((line) => {
            for (let x in line) {
                this.pixels[x] ||= [];
                this.pixels[x] = this.pixels[x].concat(line[x]);
            }
        });
    }

    static draw(canvas, firstX, firstY, secondX, secondY, thirdX, thirdY, mainColor, secondaryColor = mainColor) {
        Line.draw(canvas, firstX, firstY, secondX, secondY, mainColor, secondaryColor);
        Line.draw(canvas, secondX, secondY, thirdX, thirdY, mainColor, secondaryColor);
        Line.draw(canvas, thirdX, thirdY, firstX, firstY, mainColor, secondaryColor);
    }
}

module.exports = Triangle;