const Shape = require('../Shape');

class Circle extends Shape {
    constructor(startX, startY, endX, endY, step = 1) {
        super('Circle');

        this.pixels = {};

        startX = Math.round(startX);
        startY = Math.round(startY);
        endX   = Math.round(endX);
        endY   = Math.round(endY);

        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;

        const radius = ((endX - startX)/2 + (endY - startY)/2) / 2;

        for (let theta = 0; theta <= 360; theta += step) {
            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta);

            this.pixels[x] ||= [];
            this.pixels[x].push(y);
        }
    }

    static draw(canvas, startX, startY, endX, endY, step, mainColor, secondaryColor = mainColor) {
        startX = Math.round(startX);
        startY = Math.round(startY);
        endX   = Math.round(endX);
        endY   = Math.round(endY);

        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;

        const radius = ((endX - startX)/2 + (endY - startY)/2) / 2;

        for (let theta = 0; theta <= 360; theta += step) {
            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta);

            canvas.drawPixel(x, y, mainColor, secondaryColor);
        }
    }
}

module.exports = Circle;