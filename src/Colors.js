/**
 * Provides easy to use color functionality in terminal
 */

/**
 * @param {string} alias Prototype name 
 * @param {function} func If function has attributes it'll be set as extended function and if its not it'll be set as getter
 */
function extendPrototype(alias, func) {
    Object.defineProperty(String.prototype, alias, func.length
        ? { value: func }
        : { get: func }
    );
}

let colors = {}

/**
 * @description Aliases for 4bit color pallette
 */
const BasicColors = {
    0:  ['black'],
    1:  ['red'],
    2:  ['green'],
    3:  ['yellow'],
    4:  ['blue'],
    5:  ['magenta'],
    6:  ['cyan'],
    7:  ['white'],
    8:  ['brightBlack'  , 'lightBlack'  , 'gray', 'grey'],
    9:  ['brightRed'    , 'lightRed'],
    10: ['brightGreen'  , 'lightGreen'],
    11: ['brightYellow' , 'lightYellow'],
    12: ['brightBlue'   , 'lightBlue'],
    13: ['brightMagenta', 'lightMagenta'],
    14: ['brightCyan'   , 'lightCyan'],
    15: ['brightWhite'  , 'lightWhite']
}

/**
 * @description Aliases for text attributes
 */
const Attributes = {
    0:  ['reset', 'normal'],
    1:  ['bold'],
    2:  ['dim', 'faint'],
    3:  ['italic'],
    4:  ['underline'],
    5:  ['slowBlink', 'blink'],
    6:  ['rapidBlink', 'fastBlink'],
    7:  ['reverse', 'invert'],
    8:  ['conceal', 'hide', 'invisible'],
    9:  ['strike', 'crossedOut'],
    21: ['doubleUnderline', 'boldOff'],
    22: ['boldOrDimOff'],
    23: ['italicOff'],
    24: ['underlineOff'],
    25: ['blinkOff'],
    27: ['reverseOff', 'invertOff'],
    28: ['concealOff', 'show', 'visible'],
    29: ['crossedOutOff']
}

/** @description Array of all attributes */
let allAliases = [];

/**
 * @description Initialize Basic Colors (3 and 4 bit)
 */
for (let code in BasicColors) {
    let aliases = BasicColors[code];
    let colorCode = code < 8 ? 30 : 82;

    code = parseInt(code);

    let fgColorCode = `\x1b[${colorCode+code}m`;
    let bgColorCode = `\x1b[${colorCode+code+10}m`;

    aliases.forEach((alias) => {
        colors[alias]      = fgColorCode;
        colors[alias+'Bg'] = bgColorCode;
        allAliases.push(alias, alias+'Bg');
    });
}
 
/**
 * @description Initialize attributes
 */
for (let code in Attributes) {
    let aliases = Attributes[code];

    code = parseInt(code);
    
    let attrCode = `\x1b[${code}m`;
    aliases.forEach((alias) => {
        colors[alias] = attrCode;
        allAliases.push(alias);
    });
}

class Colors {
    /**
     * @param {string} string Text that will be colored
     * @param {number} color Color from 16-color pallette [0-15]
     * @param {boolean} bg Whether you want to color background(true) or foreground(false)
     * @returns {string} Colored text
     */
    static color4Bit(string, color, bg) {
        let colorCode = color < 8 ? 30 : 82;
        colorCode = `\x1b[${colorCode+color+ bg ? 10 : 0}m`;
        return colorCode + string + '\x1b[0m';
    }

    /**
     * @param {string} string Text that will be colored
     * @param {string} colorAlias Color alias
     */
    static colorAlias(string, colorAlias) {
        return colors[colorAlias] + string + '\x1b[0m';
    }

    /**
     * @param {string} string Text that will be colored
     * @param {number} red Amount of Red [0-255]
     * @param {number} green Amount of Green [0-255]
     * @param {number} blue Amount of Blue [0-255]
     * @param {boolean} bg Whether you want to color background(true) or foreground(false)
     * @returns {string} Colored text
     */
    static colorRGB(string, red, green, blue, bg) {
        let number = bg ? 48 : 38;

        red   = Math.round(red)   || 0;
        green = Math.round(green) || 0;
        blue  = Math.round(blue)  || 0;

        let colorCode = `\x1b[${number};2;${red};${green};${blue}m`;

        return colorCode + string + '\x1b[0m';
    }

    /**
     * @param {string} string Text that will be colored
     * @param {string} hex Hex string in pattern #123456 or 123456 where every number represents hexadecimal value
     * @param {boolean} bg Whether you want to color background(true) or foreground(false)
     */
    static colorHEX(string, hex, bg) {
        hex = hex.substr(hex.indexOf('#')+1, 6).match(/.{2}/g);
        let red   = parseInt(hex[0],16);
        let green = parseInt(hex[1],16);
        let blue  = parseInt(hex[2],16);
        return colorRGB(string, red, green, blue, bg);
    }

    /**
     * @param {string} string Text that will be colored
     * @param {number} color Color from 256-color lookup table [0-255]
     * @param {boolean} bg Whether you want to color background(true) or foreground(false)
     * @returns {string} Colored text
     */
    static color8Bit(string, color, bg) {
        let number = bg ? 48 : 38;

        color = Math.round(color) % 256 || 0;

        let colorCode = `\x1b[${number};5;${color}m`;

        return colorCode + string + '\x1b[0m';
    }

    /**
     * @param {string} string Text that will be colored
     * @param {string | number} keyword Word that'll be used to identify color
     * @param {boolean} bg Whether you want to color background(true) or foreground(false), may be overwritten if using keyword that has bg enabled by default
     */
    static keyword(string, keyword, bg = false) {
        let colored = string;

        switch (typeof keyword) {
            case 'number':
                colored = keyword < 16 ? Colors.color4Bit(string, keyword, bg)
                        : keyword < 256 ? Colors.color8Bit(string, keyword, bg)
                        : Colors.colorHEX(this.valueOf(), keyword.toString(), bg);
                break;
            case 'string':
                if (!!colors[keyword])
                    colored = !bg ? Colors.colorAlias(string, keyword) : Colors.colorAlias(string, keyword+'Bg') || Colors.colorAlias(string, keyword);
                break;
        }
    
        return colored;
    }
    
    /**
     * @param {string} string Colored text that will be converted to pure one
     * @returns {string} pure string without any attributes
     */
    static pure(string) {
        string = string.split('\x1b[');
        string = string[Math.round((string.length-1)/2)].replace(/\d+[m]/g, '');
    
        return string;
    }

    static style(string) {
        return string.valueOf().split(Colors.pure(string));
    }
}

class ColorStyle {
    constructor(name, styleCode) {
        if (typeof name != 'string' || name.length < 1)
            throw new Error('Parameter name has to be typeof string and be at least 1 character long.')

        if (styleCode.includes('!STYLE!')) {
            this.code = styleCode;
        } else if (Array.isArray(styleCode)) {
            styleCode.splice(Math.round((styleCode.length-1)/2), 0, '!STYLE!');
            this.code = styleCode.join('');
        } else {
            const arr = styleCode.split('.');
            let char = ' ';

            arr.forEach((kw) => char = char.keyword(kw));

            const style = Colors.style(char);
            style.splice(Math.round((style.length-1)/2), 0, '!STYLE!');

            this.code = style.join('');
        }

        Colors[name] = function (string) {
            return this.code.replace('!STYLE!', string);
        }

        extendPrototype(name, function () {
            return this.code.replace('!STYLE!', this.valueOf());
        });
    }

    color(string) {
        return this.code.replace('!STYLE!', string);
    }
}

allAliases.forEach((alias) => {
    extendPrototype(alias, function() {
        return Colors.colorAlias(this.valueOf(), alias);
    });
});

extendPrototype('rgb', function(r, g, b) {
    return Colors.colorRGB(this.valueOf(), r, g, b, false);
});

extendPrototype('rgbBg', function(r, g, b) {
    return Colors.colorRGB(this.valueOf(), r, g, b, true);
});

extendPrototype('hex', function(hex) {
    return Colors.colorHEX(this.valueOf(), hex, false);
});

extendPrototype('hexBg', function(hex) {
    return Colors.colorHEX(this.valueOf(), hex, true);
});

extendPrototype('ansi8Bit', function(color) {
    return Colors.color8Bit(this.valueOf(), color, false);
});

extendPrototype('ansi8BitBg', function(color) {
    return Colors.color8Bit(this.valueOf(), color, true);
});

extendPrototype('ansi4Bit', function(color) {
    return Colors.color4Bit(this.valueOf(), color, false);
});

extendPrototype('ansi4BitBg', function(color) {
    return Colors.color4Bit(this.valueOf(), color, true);
});

extendPrototype('keyword', function(keyword, bg) {
    return Colors.keyword(this.valueOf(), keyword, bg);
});

extendPrototype('pure', function() {
    return Colors.pure(this.valueOf());
});

extendPrototype('style', function() {
    return Colors.style(this.valueOf());
});

module.exports = { Colors, ColorStyle };