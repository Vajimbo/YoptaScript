import { dictionary } from './dictionary/sortedYopta';

function escapeRegExp(str: string) {
    str = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    if (/^\w+$/.test(str)) {
        str = '\\b' + str + '\\b';
    }

    return str;
}

function yoptReplaceAll(str: string, search: string, replacement: string) {
    const re = new RegExp(escapeRegExp(search), 'g');
    return str.replace(re, replacement);
}

/**
 * @param text текст, по которому следует пройтись
 * @param to язык текста ('ys' or 'js')
 */
function iterateText(text: string, to: 'js' | 'ys' = 'ys') {
    const langCol = to === 'ys' ? 1 : 0;
    const dick = dictionary;
    dick.sort((a, b) => {
        const al = a[langCol].length;
        const bl = b[langCol].length;
        return bl - al;
    }).forEach(
        (pair) => (text = yoptReplaceAll(text, pair[langCol], pair[+!langCol]))
    );

    return text;
}

export function compile(text: string, lang: 'js' | 'ys' = 'ys'): string {
    /* text - текст для реплейса
     * lang - язык текста ('ys' or 'js')
     */
    interface Literals {
        [key: string]: string;
    }
    const commentRegExp = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g;
    const tmpToken = 'ys_' + new Date().getTime() + '_';
    const rStringLiterals: Literals = {};
    text = text.replace(
        /\"(?:\\.|[^\"\\])*\"|\'(?:\\.|[^\'\\])*\'/g,
        function (val, pos) {
            const needKey = tmpToken + pos;
            rStringLiterals[needKey] = val;
            return needKey;
        }
    );
    const commentsArray = text.match(commentRegExp) || [];
    text = iterateText(text, lang);
    // comeback comments
    text = text.replace(commentRegExp, () => commentsArray.shift() || '');
    // comeback strings
    for (const key in rStringLiterals) {
        text = text.replace(key, rStringLiterals[key]);
    }
    return text;
}

// YoptaScript to globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _global = (window || global) as any;
_global.yopta = compile;
