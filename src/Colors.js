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

var colors = {}

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

/**
 * @param {string} string Text that will be colored
 * @param {string} colorAlias Color alias
 */
function colorAlias(string, colorAlias) {
    return colors[colorAlias] + string + '\x1b[0m';
}

allAliases.forEach((alias) => {
    extendPrototype(alias, function() {
        return colorAlias(this, alias);
    });
});

/**
 * @param {string} string Text that will be colored
 * @param {number} red Amount of Red [0-255]
 * @param {number} green Amount of Green [0-255]
 * @param {number} blue Amount of Blue [0-255]
 * @param {boolean} bg Whether you want to color background(true) or foreground(false)
 * @returns {string} Colored text
 */
function colorRGB(string, red, green, blue, bg) {
    let number = bg ? 48 : 38;

    red   = Math.round(red)   || 0;
    green = Math.round(green) || 0;
    blue  = Math.round(blue)  || 0;

    let colorCode = `\x1b[${number};2;${red};${green};${blue}m`;

    return colorCode + string + '\x1b[0m';
}

extendPrototype('rgb', function(r, g, b) {
    return colorRGB(this, r, g, b, false);
});

extendPrototype('rgbBg', function(r, g, b) {
    return colorRGB(this, r, g, b, true);
});

/**
 * @param {string} string Text that will be colored
 * @param {string} hex Hex string in pattern #123456 or 123456 where every number represents hexadecimal value
 * @param {boolean} bg Whether you want to color background(true) or foreground(false)
 */
function colorHEX(string, hex, bg) {
    hex = hex.substr(hex.indexOf('#')+1, 6).match(/.{2}/g);
    let red   = parseInt(hex[0],16);
    let green = parseInt(hex[1],16);
    let blue  = parseInt(hex[2],16);
    return colorRGB(string, red, green, blue, bg);
}

extendPrototype('hex', function(hex) {
    return colorHEX(this, hex, false);
});

extendPrototype('hexBg', function(hex) {
    return colorHEX(this, hex, true);
});

/**
 * @param {string} string Text that will be colored
 * @param {number} color Color from 256-color lookup table [0-255]
 * @param {boolean} bg Whether you want to color background(true) or foreground(false)
 * @returns {string} Colored text
 */
function color8Bit(string, color, bg) {
    let number = bg ? 48 : 38;

    color = Math.round(color) % 256 || 0;

    let colorCode = `\x1b[${number};5;${color}m`;

    return colorCode + string + '\x1b[0m';
}

extendPrototype('ansi8Bit', function(color) {
    return color8Bit(this, color, false);
});

extendPrototype('ansi8BitBg', function(color) {
    return color8Bit(this, color, true);
});

/**
 * @param {string} string Text that will be colored
 * @param {number} color Color from 16-color pallette [0-15]
 * @param {boolean} bg Whether you want to color background(true) or foreground(false)
 * @returns {string} Colored text
 */
function color4Bit(string, color, bg) {
    let colorCode = color < 8 ? 30 : 82;
    colorCode = `\x1b[${colorCode+color+ bg ? 10 : 0}m`;
    return colorCode + string + '\x1b[0m';
}

extendPrototype('ansi4Bit', function(color) {
    return color4Bit(this, color, false);
});

extendPrototype('ansi4BitBg', function(color) {
    return color4Bit(this, color, true);
});

/**
 * Find color using string or number
 */
extendPrototype('keyword', function(keyword, bg) {
    let colored = this;

    switch (typeof keyword) {
        case 'number':
            colored = keyword < 16 ? color4Bit(this, keyword, bg)
                    : keyword < 256 ? color8Bit(this, keyword, bg)
                    : colorHEX(this, keyword.toString(), bg);
            break;
        case 'string':
            if (!!colors[keyword])
                colored = !bg ? colorAlias(this, keyword) : colorAlias(this, keyword+'Bg') || colorAlias(this, keyword);
            break;
    }

    return colored;
});

/**
 * Returns pure string without attributes
 */
extendPrototype('pure', function() {
    let string = this;

    string = string.split('\x1b[');
    string = string[Math.round((string.length-1)/2)].replace(/\d+[m]/g, '');

    return string;
});

//todo: make it actually not dogshit
extendPrototype('style', function() {
    let string = this.valueOf().split(this.pure);
    return string;
});

extendPrototype('implementStyle', function(style) {
    let copy = [...style];
    copy.splice(Math.round((style.length-1)/2), 0, this.valueOf()).join('');
    let string = copy.join('');
    return string;
});