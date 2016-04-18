import { CompletionItemProvider, TextDocument, Position } from 'vscode';
import { isImportOrRequire, getTextWithinString } from './text-parser';
import { getPath } from './fs-functions';
import { PathCompletionItem } from './PathCompletionItem';

export class PathIntellisense implements CompletionItemProvider {
    
    constructor(private getChildrenOfPath: Function) { }
    
    provideCompletionItems(document: TextDocument, position: Position): Thenable<PathCompletionItem[]> {
        const line = document.getText(document.lineAt(position).range);
        const textWithinString = getTextWithinString(line, position.character);
        const path = getPath(document.fileName, textWithinString);
        
        if (this.shouldProvide(line, textWithinString)) {
            return this.getChildrenOfPath(path).then(children => children.map(child => new PathCompletionItem(child)));
        } else {
            return Promise.resolve([]);
        }
    }
    
    shouldProvide(line, textWithinString) {
        if (!textWithinString || textWithinString.length === 0) {
            return false;
        }
        
        if (isImportOrRequire(line) && textWithinString[0] !== '.') {
            return false;
        }
        
        if (textWithinString.slice(-1) !== '/') {
            return false;
        }
        
        return true;
    }
}