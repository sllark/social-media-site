
const htmlToText= function (html, extensions) {
    var text = html;


    if (extensions && extensions['preprocessing'])
        text = extensions['preprocessing'](text);

    text = text
        // Remove line breaks
        .replace(/(?:\n|\r\n|\r)/ig, " ")
        // Remove content in script tags.
        .replace(/<\s*script[^>]*>[\s\S]*?<\/script>/mig, "")
        // Remove content in style tags.
        .replace(/<\s*style[^>]*>[\s\S]*?<\/style>/mig, "")
        // Remove content in comments.
        .replace(/<!--.*?-->/mig, "")
        // Remove !DOCTYPE
        .replace(/<!DOCTYPE.*?>/ig, "");

    /* I scanned http://en.wikipedia.org/wiki/HTML_element for all html tags.
    I put those tags that should affect plain text formatting in two categories:
    those that should be replaced with two newlines and those that should be
    replaced with one newline.
    I process <DEL> and <INS> as inline elements.
    http://www.w3.org/TR/1999/REC-html401-19991224/struct/text.html#h-9.4
    "These two elements are unusual for HTML in that they may serve as either
    block-level or inline elements (but not both). They may contain one or more
    words within a paragraph or contain one or more block-level elements such
    as paragraphs, lists and tables." */

    if (extensions && extensions['tagreplacement'])
        text = extensions['tagreplacement'](text);

    var doubleNewlineTags = ['p', 'h[1-6]', 'dl', 'dt', 'dd', 'ol', 'ul',
        'dir', 'address', 'blockquote', 'center', 'div', 'hr', 'pre', 'form',
        'textarea', 'table'];

    var singleNewlineTags = ['li', 'fieldset', 'legend', 'tr', 'th', 'caption',
        'thead', 'tbody', 'tfoot'];

    for (let i = 0; i < doubleNewlineTags.length; i++) {
        var r = RegExp('</?\\s*' + doubleNewlineTags[i] + '[^>]*>', 'ig');
        text = text.replace(r, '\n');
    }

    for (let i = 0; i < singleNewlineTags.length; i++) {
        var r = RegExp('<\\s*' + singleNewlineTags[i] + '[^>]*>', 'ig');
        text = text.replace(r, '\n');
    }

    // Replace <br> and <br/> with a single newline
    text = text.replace(/<\s*br[^>]*\/?\s*>/ig, '');

    text = text
        // Remove all remaining tags.
        .replace(/(<([^>]+)>)/ig,"")
        // Trim rightmost whitespaces for all lines
        .replace(/([^\n\S]+)\n/g,"\n")
        .replace(/([^\n\S]+)$/,"")
        // Make sure there are never more than two
        // consecutive linebreaks.
        .replace(/\n{2,}/g,"\n\n")
        // Remove newlines at the beginning of the text.
        .replace(/^\n+/,"")
        // Remove newlines at the end of the text.
        .replace(/\n+$/,"")
        // Decode HTML entities.
        .replace(/&([^;]+);/g, decodeHtmlEntity);

    if (extensions && extensions['postprocessing'])
        text = extensions['postprocessing'](text);

    return text;
}

const decodeHtmlEntity = function (m, n) {
    // Determine the character code of the entity. Range is 0 to 65535
    // (characters in JavaScript are Unicode, and entities can represent
    // Unicode characters).
    var code;

    // Try to parse as numeric entity. This is done before named entities for
    // speed because associative array lookup in many JavaScript implementations
    // is a linear search.
    if (n.substr(0, 1) == '#') {
        // Try to parse as numeric entity
        if (n.substr(1, 1) == 'x') {
            // Try to parse as hexadecimal
            code = parseInt(n.substr(2), 16);
        } else {
            // Try to parse as decimal
            code = parseInt(n.substr(1), 10);
        }
    } else {
        // Try to parse as named entity
        code = ENTITIES_MAP[n];
    }

    // If still nothing, pass entity through
    return (code === undefined || code === NaN) ?
        '&' + n + ';' : String.fromCharCode(code);
}

var ENTITIES_MAP = {
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'copy': 169,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'reg': 174,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'sup1': 185,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'Agrave': 192,
    'Aacute': 193,
    'Acirc': 194,
    'Atilde': 195,
    'Auml': 196,
    'Aring': 197,
    'AElig': 198,
    'Ccedil': 199,
    'Egrave': 200,
    'Eacute': 201,
    'Ecirc': 202,
    'Euml': 203,
    'Igrave': 204,
    'Iacute': 205,
    'Icirc': 206,
    'Iuml': 207,
    'ETH': 208,
    'Ntilde': 209,
    'Ograve': 210,
    'Oacute': 211,
    'Ocirc': 212,
    'Otilde': 213,
    'Ouml': 214,
    'times': 215,
    'Oslash': 216,
    'Ugrave': 217,
    'Uacute': 218,
    'Ucirc': 219,
    'Uuml': 220,
    'Yacute': 221,
    'THORN': 222,
    'szlig': 223,
    'agrave': 224,
    'aacute': 225,
    'acirc': 226,
    'atilde': 227,
    'auml': 228,
    'aring': 229,
    'aelig': 230,
    'ccedil': 231,
    'egrave': 232,
    'eacute': 233,
    'ecirc': 234,
    'euml': 235,
    'igrave': 236,
    'iacute': 237,
    'icirc': 238,
    'iuml': 239,
    'eth': 240,
    'ntilde': 241,
    'ograve': 242,
    'oacute': 243,
    'ocirc': 244,
    'otilde': 245,
    'ouml': 246,
    'divide': 247,
    'oslash': 248,
    'ugrave': 249,
    'uacute': 250,
    'ucirc': 251,
    'uuml': 252,
    'yacute': 253,
    'thorn': 254,
    'yuml': 255,
    'quot': 34,
    'amp': 38,
    'lt': 60,
    'gt': 62,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'circ': 710,
    'tilde': 732,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'permil': 8240,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'euro': 8364
};

export default htmlToText;