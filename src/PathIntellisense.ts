import { CompletionItemProvider, TextDocument, Position, CompletionItem, Range, workspace } from 'vscode';
import { isImportOrRequire, getTextWithinString } from './text-parser';
import { getPath, extractExtension, Mapping } from './fs-functions';
import { PathCompletionItem } from './PathCompletionItem';
import { UpCompletionItem } from './UpCompletionItem';

export class PathIntellisense implements CompletionItemProvider {
    
    constructor(private getChildrenOfPath: Function) { }
    
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const textCurrentLine = document.getText(document.lineAt(position).range);
        const textWithinString = getTextWithinString(textCurrentLine, position.character);
        const importRange = this.importStringRange(document, position);
        const isImport = isImportOrRequire(textCurrentLine);
        const documentExtension = extractExtension(document);
        const mappings = this.getMappings();

        if (!this.shouldProvide(textWithinString, isImport, mappings)) {
            return Promise.resolve([]);
        }
        
        return this.provide(document.fileName, textWithinString, mappings, isImport, documentExtension, importRange);
    }

    shouldProvide(textWithinString: string, isImport: boolean, mappings?: Mapping[]) {
        const typedAnything = textWithinString && textWithinString.length > 0;
        const startsWithDot = typedAnything && textWithinString[0] === '.';
        const startsWithMapping = mappings && mappings.some(mapping => textWithinString.indexOf(mapping.key) === 0);

        if (isImport && (startsWithDot || startsWithMapping)) {
            return true;
        }

        if (!isImport && typedAnything) {
            return true;
        }

        return false;
    }

    provide(fileName, textWithinString, mappings, isImport, documentExtension, importRange) {
        const path = getPath(fileName, textWithinString, mappings);
        
        return this.getChildrenOfPath(path).then(children => ([
            new UpCompletionItem(),
            ...children.map(child => new PathCompletionItem(child, importRange, isImport, documentExtension))
        ]));
    }

    importStringRange(document: TextDocument, position: Position): Range {
        const line = document.getText(document.lineAt(position).range);
        const textToPosition = line.substring(0, position.character);
        const slashPosition = textToPosition.lastIndexOf('/');

        const startPosition = new Position(position.line, slashPosition + 1);
        const endPosition = position;

        return new Range(startPosition, endPosition);
    }

    getMappings(): Mapping[] {
        const mappings = workspace.getConfiguration('path-intellisense')['mappings'];
        return Object.keys(mappings)
            .map(key => ({ key: key, value: mappings[key]}))
            .filter(mapping => !!workspace.rootPath || mapping.value.indexOf('${workspaceRoot}') === -1)
            .map(mapping => ({ key: mapping.key, value: mapping.value.replace('${workspaceRoot}', workspace.rootPath) }));
    }
}