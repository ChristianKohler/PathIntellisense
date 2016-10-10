import { CompletionItemProvider, TextDocument, Position, CompletionItem } from 'vscode';
import { isImportOrRequire, getTextWithinString } from './text-parser';
import { getPath, extractExtension } from './fs-functions';
import { PathCompletionItem } from './PathCompletionItem';
import { UpCompletionItem } from './UpCompletionItem';

export class PathIntellisense implements CompletionItemProvider {
    
    constructor(private getChildrenOfPath: Function) { }
    
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const textCurrentLine = document.getText(document.lineAt(position).range);
        const textWithinString = getTextWithinString(textCurrentLine, position.character);
        const isImport = isImportOrRequire(textCurrentLine);
        const documentExtension = extractExtension(document);

        if (!this.shouldProvide(textWithinString, isImport)) {
            return Promise.resolve([]);
        }

        const path = getPath(document.fileName, textWithinString);
        
        return this.getChildrenOfPath(path).then(children => ([
            new UpCompletionItem(),
            ...children.map(child => new PathCompletionItem(child, isImport, documentExtension))
        ]));
    }

    shouldProvide(textWithinString, isImport) {
        const typedAnything = textWithinString && textWithinString.length > 0;
        const startsWithDot = typedAnything && textWithinString[0] === '.';
        
        if (isImport && startsWithDot) {
            return true;
        }

        if (!isImport && typedAnything) {
            return true;
        }

        return false;
    }
}