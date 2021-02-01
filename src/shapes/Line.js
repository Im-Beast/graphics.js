const Shape = require('../Shape');

class Line extends Shape {
    constructor(startX, startY, endX, endY) {
        super('Line');

        this.pixels = {};

        startX = Math.round(startX);
        startY = Math.round(startY);
        endX   = Math.round(endX);
        endY   = Math.round(endY);

        const steps = Math.abs(deltaX) >= Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY);

        const deltaX = (endX - startX) / steps;
        const deltaY = (endY - startY) / steps;

        let x = startX;
        let y = startY;

        for (let i = 0; i <= steps; i++) {
            const tempX = Math.round(x);
            const tempY = Math.round(y);

            this.pixels[tempX] ||= [];
            this.pixels[tempX].push(tempY);

            x += deltaX;
            y += deltaY;
        }
    }

    static draw(canvas, startX, startY, endX, endY, mainColor, secondaryColor = mainColor) {
        startX = Math.round(startX);
        startY = Math.round(startY);
        endX   = Math.round(endX);
        endY   = Math.round(endY);
        
        const steps = Math.abs(deltaX) >= Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY);

        const deltaX = (endX - startX) / steps;
        const deltaY = (endY - startY) / steps;
        
        let x = startX;
        let y = startY;

        for (let i = 0; i <= steps; i++) {
            canvas.drawPixel(x, y, mainColor, secondaryColor);

            x += deltaX;
            y += deltaY;
        }
    }
}

module.exports = Line;