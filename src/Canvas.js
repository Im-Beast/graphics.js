require('./Colors');

class FrameBuffer {
    static buffer;

    static #autoUpdate = (() => {
        process.stdout.on('resize', FrameBuffer.update);
        FrameBuffer.update();
    })();

    //todo: implement auto sizing of framebuffer to improve performance
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

        let string = '';
        for (let y = 0; y < rows; ++y) {
            string += '\r';
            for (let x = 0; x < columns; ++x) {
                string += FrameBuffer.buffer[y][x].join('');
            }
            string += '\n';
        }

        process.stdout.write(string);
    }

    static setPixel(x, y, chars) {       
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
        const blankCharacter = ' '.keyword(this.backgroundColor, true);

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
        x = Math.round(x);
        y = Math.round(y);

        if (x < 0 || x >= this.width || y < 0 || y >= this.width)
            return;

        this.pixels[x][y] = [' '.keyword(mainColor, true), ' '.keyword(secondaryColor, true)];
    }

    drawText(x, y, text) {
        x = Math.round(x);
        y = Math.round(y);
     
        if (typeof text != 'string')
            throw new Error('Parameter text has to be string');

        text = text.keyword(this.foregroundColor).keyword(this.backgroundColor, true);

        const style = text.style;
        const pureText = text.pure;

        if (y < 0 || y >= this.height)
            return;

        let subPixel = 0;
        let offset = 0;

        for (let i in pureText) {
            const letter = pureText[i].implementStyle(style);

            if (x < 0 || x + offset >= this.width)
                continue;

            this.pixels[x + offset][y][subPixel] &&= letter;
            subPixel = ++subPixel % 2;

            //magic
            offset = (i % 2 || i % 3 || i % (i-2)) ? Math.round(i/2) : 0;
        }
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

module.exports = Canvas;