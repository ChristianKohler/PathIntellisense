import {
    CompletionItemProvider,
    TextDocument,
    Position,
    CancellationToken,
    CompletionItem,
} from 'vscode';
import { isInString, isImportOrRequire, getTextWithinString } from './text-parser';
import { getPath } from './fs-functions';


export class PathIntellisense implements CompletionItemProvider {
    
    constructor(private getChildrenOfPath: Function) { }
    
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const line = document.getText(document.lineAt(position).range);
        const textWithinString = getTextWithinString(line, position.character);
        const path = getPath(document.fileName, textWithinString);
        
        return new Promise<CompletionItem[]>((resolve, reject) => {
            if (this.shouldProvide(line, textWithinString)) {
                this.getChildrenOfPath(path)
                    .then(children => children.map(child => new CompletionItem(child)))
                    .then(resolve);
            } else {
                resolve([]);
            }
        });
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