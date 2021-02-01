const Shape = require('../Shape');
const Line  = require('./Line');

class Rectangle extends Shape {
    constructor(startX, startY, endX, endY) {
        super('Rectangle');

        this.pixels = {};

        this.width  = endX - startX;
        this.height = endY - startY;

        let lines = [
           new Line(startX, startY, endX, startY).pixels,
           new Line(startX, endY, startX, startY).pixels,
           new Line(startX, endY, endX, endY).pixels,
           new Line(endX, endY, endX, startY).pixels
        ];

        lines.forEach((line) => {
            for (let x in line) {
                this.pixels[x] ||= [];
                this.pixels[x] = this.pixels[x].concat(line[x]);
            }
        });
    }

    static draw(canvas, startX, startY, endX, endY, mainColor, secondaryColor = mainColor) {
        Line.draw(canvas, startX, startY, endX, startY, mainColor, secondaryColor);
        Line.draw(canvas, startX, endY, startX, startY, mainColor, secondaryColor);
        Line.draw(canvas, startX, endY, endX, endY, mainColor, secondaryColor);
        Line.draw(canvas, endX, endY, endX, startY, mainColor, secondaryColor);
    }
}

module.exports = Rectangle;