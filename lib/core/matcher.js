export const WILDCARD_MATCHER = /{.*?}(?:\(.*\))*/;
export const WILDCARD_MATCHER_GLOBAL = /{.*?}(?:\(.*\))*/g;
/**
 * @param { string } path
 * @returns { RegExp | undefined }
 */
export function createRouteMatcher(path) {
    const wildcards = path.match(WILDCARD_MATCHER_GLOBAL);
    if (wildcards == null) {
        // No need to generate for non-wildcard routes
        return undefined;
    }

    const pathSplit = path.split('/').filter(part => part.length > 0);
    let regexString = '';
    for (const pathPart of pathSplit) {
        if (!wildcards.includes(pathPart)) {
            regexString += '\\/' + pathPart;
            continue;
        }
        const matcherKey = pathPart.substring(pathPart.indexOf('{') + 1, pathPart.indexOf('}'));
        let matcher = pathPart.match(/\(.*\)/)?.[0];
        if (!matcher) {
            matcher = "[a-zA-Z0-9\\-\\_\\.\\+\\!\\*\\']*";
        }
        const matcherWithoutWrappingParenthesis = matcher.replace(/^\(/, '').replace(/\)$/, '') + '(?=\\/|)';
        const matcherKeyRegex = `(?<${matcherKey}>${matcherWithoutWrappingParenthesis})`;
        regexString += '\\/' + matcherKeyRegex;
    }

    return new RegExp(regexString);
}
