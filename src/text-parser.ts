export function isInString(text: string, character: number) : boolean {
    let inSingleQuoationString = (text.substring(0, character).match(/\'/g) || []).length % 2 === 1;
    let inDoubleQuoationString = (text.substring(0, character).match(/\"/g) || []).length % 2 === 1;
    return inSingleQuoationString || inDoubleQuoationString;
}

export function isImportOrRequire(text) {
    let isImport = text.substring(0, 6) === 'import';
    let isRequire = text.indexOf('require(') != -1;
    return isImport || isRequire;
}

export function getTextWithinString(text: string, position: number) {
    const textToPosition = text.substring(0, position);
    const quoatationPosition = Math.max(textToPosition.lastIndexOf('\"'), textToPosition.lastIndexOf('\''));
    return quoatationPosition != -1 ? textToPosition.substring(quoatationPosition + 1, textToPosition.length) : undefined;
}