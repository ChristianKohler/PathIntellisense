import { CompletionItemProvider, TextDocument, Position, CompletionItem, workspace } from 'vscode';
import { isImportOrRequire, getTextWithinString, importStringRange } from './text-parser';
import { getPath, extractExtension, Mapping } from './fs-functions';
import { PathCompletionItem } from './PathCompletionItem';
import { UpCompletionItem } from './UpCompletionItem';
import { getConfig, Config } from './config';

export class PathIntellisense implements CompletionItemProvider {
    
    constructor(private getChildrenOfPath: Function) { }
    
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const config = getConfig();
        const textCurrentLine = document.getText(document.lineAt(position).range);
        const textWithinString = getTextWithinString(textCurrentLine, position.character);
        const importRange = importStringRange(textCurrentLine, position);
        const isImport = isImportOrRequire(textCurrentLine);
        const documentExtension = extractExtension(document);

        if (!this.shouldProvide(textWithinString, isImport, config)) {
            return Promise.resolve([]);
        }
        
        return this.provide(document.fileName, textWithinString, config, isImport, documentExtension, importRange);
    }

    shouldProvide(textWithinString: string, isImport: boolean, config: Config) {
        const typedAnything = textWithinString && textWithinString.length > 0;
        const startsWithDot = typedAnything && textWithinString[0] === '.';
        const startsWithMapping = config.mappings.some(mapping => textWithinString.indexOf(mapping.key) === 0);

        if (isImport && (startsWithDot || startsWithMapping)) {
            return true;
        }

        if (!isImport && typedAnything) {
            return true;
        }

        return false;
    }

    provide(fileName, textWithinString, config: Config, isImport, documentExtension, importRange) {
        const path = getPath(fileName, textWithinString, config.mappings);
        
        return this.getChildrenOfPath(path).then(children => ([
            new UpCompletionItem(),
            ...children.map(child => new PathCompletionItem(child, importRange, isImport, documentExtension, config))
        ]));
    }

    
}