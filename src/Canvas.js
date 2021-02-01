const { Colors, ColorStyle } = require('./Colors');
const Shape = require('./Shape');

class FrameBuffer {
    static buffer;

    static height = 0;
    static width = 0;

    static #autoUpdate = (() => {
        process.stdout.on('resize', FrameBuffer.update);
        FrameBuffer.update();
    })();

    static update() {
        const tempBuffer = FrameBuffer.buffer || { };

        const columns = (process.stdout.columns-1)/2
        const rows = process.stdout.rows-1;

        for (let y = 0; y < rows; ++y) {
            tempBuffer[y] = {};
            for (let x = 0; x < columns; ++x) {
                tempBuffer[y][x] ||= [' ', ' '];
            }
        }

        FrameBuffer.buffer = tempBuffer;
        console.clear();
    }

    static draw() {
        process.stdout.cursorTo(-1, -1);

        const columns = (process.stdout.columns-1)/2
        const rows = process.stdout.rows-1;

        const height = rows > this.height ? this.height : rows;
        const width = columns > this.width ? this.width : columns;

        let string = '';
        for (let y = 0; y < height; ++y) {
            string += '\r';
            for (let x = 0; x < width; ++x) {
                string += FrameBuffer.buffer[y][x].join('');
            }
            string += '\n';
        }

        process.stdout.write(string);
    }

    static setPixel(x, y, chars) {
        if (typeof x != 'number' || typeof y != 'number')
            throw new Error('Pixel position has to be a number!');

        if (!FrameBuffer.buffer[y] || !FrameBuffer.buffer[y][x])
            return;

        x = Math.round(x);
        y = Math.round(y);

        if (x > this.width)
            this.width = x+1;

        if (y > this.height)
            this.height = y+1;

        FrameBuffer.buffer[y][x] = chars;
    }

}

class Canvas {
    /**
     * @param {number} width required, integer, width of canvas
     * @param {number} height required, integer, height of canvas
     * @param {string} foregroundColor optional, canvas default foreground color, meets Color's keyword requirements
     * @param {string} backgroundColor optional, canvas default background color, meets Color's keyword requirements
     * @param {object} experimental optional, experimental parameters
     */
    constructor(width, height, foregroundColor = 'white', backgroundColor = 'black', experimental = {}) {
        if (!width)
            throw new Error('Parameter width has to be specified');
        else if (!height)
            throw new Error('Parameter height has to be specified');

        this.width = width;
        this.height = height;

        this.foregroundColor = foregroundColor;
        this.backgroundColor = backgroundColor;

        this.experimental = {
            top: experimental.top || 0,
            left: experimental.left || 0,
            fpsStabilisation: !!experimental.fpsStabilisation || false
        };

        this.pixels = {};

        this.onDraw = () => {};

        this.clear();

        this.setFrameRate(60);

        console.clear();
    }

    clear() {
        const tempPixels = {};
        const blankCharacter = Colors.keyword(' ', this.backgroundColor, true);

        const w = this.width;
        const h = this.height;

        for (let y = 0; y < h; ++y) {
            tempPixels[y] = {};
            for (let x = 0; x < w; ++x) {
                tempPixels[y][x] = [blankCharacter, blankCharacter];
            }
        }

        this.pixels = tempPixels;
    }

    drawFrame() {
        const offsetX = this.experimental.left;
        const offsetY = this.experimental.top;

        this.onDraw();

        for (let y in this.pixels) {
            for (let x in this.pixels[y]) {
                FrameBuffer.setPixel(y/1 + offsetY, x/1 + offsetX, this.pixels[y][x]);
            }
        }

        FrameBuffer.draw();
    }

    drawPixel(x, y, mainColor, secondaryColor = mainColor) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.width)
            return;

        x = Math.round(x);
        y = Math.round(y);

        this.pixels[x][y] = [ Colors.keyword(' ', mainColor, true), Colors.keyword(' ', secondaryColor, true) ];
    }

    drawText(x, y, text) {
        if (typeof text != 'string')
            throw new Error('Parameter text has to be string');

        text = Colors.keyword(Colors.keyword(text, this.foregroundColor), this.backgroundColor, true);

        const style = new ColorStyle(text.style);
        const pureText = text.pure;

        if (y < 0 || y >= this.height)
            return;

        let subPixel = 0;
        let offset = 0;

        for (let i in pureText) {
            const letter = style.color(pureText[i]);

            if (x < 0 || x + offset >= this.width)
                continue;

            this.pixels[x + offset][y][subPixel] &&= letter;
            subPixel = ++subPixel % 2;

            //magic
            offset = (i % 2 || i % 3 || i % (i-2)) ? Math.round(i/2) : 0;
        }
    }

    drawShape(shape, mainColor = this.foregroundColor, secondaryColor = mainColor) {
        if (!(shape instanceof Shape))
            throw new Error('Parameter shape has to be instanceof Shape');

        for (let x in shape.pixels) {
            const yArray = shape.pixels[x];

            yArray.forEach(
                (y) => this.drawPixel(x, y, mainColor, secondaryColor)
            );
        };
    }

    setFrameRate(fps) {
        if (typeof fps != 'number')
            throw new Error('Parameter fps has to be number');

        if (!!this.drawInterval)
            clearInterval(this.drawInterval);

        this.drawInterval = setInterval(
            () => this.drawFrame()
        , fps <= 0 ? 0 : 1/(fps/1000));
    }

}

module.exports = { Canvas, FrameBuffer };