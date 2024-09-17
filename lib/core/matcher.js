/**
    * @param { string } path
    * @returns { RegExp | undefined }
    */
export function createRouteMatcher(path) {
    const wildcards = path.match(/{.*?}(?:\(.*\))*/g,);
    if (wildcards == null) {
        // No need to generate for non-wildcard routes
        return undefined;
    }

    const pathSplit = path.split("/").filter(part => part.length > 0);
    let regexString = "";
    for (const pathPart of pathSplit) {
        if (!wildcards.includes(pathPart)) {
            regexString += "\\/" + pathPart;
            continue;
        }
        const matcherKey = pathPart.substring(pathPart.indexOf("{") + 1, pathPart.indexOf("}"));
        let matcher = pathPart.match(/\(.*\)/)?.[0];
        if (!matcher) {
            matcher = "(.*)";
        }
        const matcherWithoutWrappingParenthesis = matcher.replace(/^\(/, "").replace(/\)$/, "");
        const matcherKeyRegex = `(?<${matcherKey}>${matcherWithoutWrappingParenthesis})`;
        regexString += "\\/" + matcherKeyRegex;
    }

    return new RegExp(regexString);
}
