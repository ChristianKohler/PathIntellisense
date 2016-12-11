import { CompletionItemProvider, TextDocument, Position, CompletionItem, workspace, Range } from 'vscode';
import { isImportOrRequire, getTextWithinString, importStringRange } from './text-parser';
import { getPath, extractExtension, Mapping } from './fs-functions';
import { PathCompletionItem } from './PathCompletionItem';
import { UpCompletionItem } from './UpCompletionItem';
import { getConfig, Config } from './config';

interface State {
    config: Config,
    fileName: string,
    textCurrentLine: string,
    textWithinString: string,
    importRange: Range,
    isImport: boolean,
    documentExtension: string
}

export class PathIntellisense implements CompletionItemProvider {
    
    constructor(private getChildrenOfPath: Function) { }
    
    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const textCurrentLine = document.getText(document.lineAt(position).range);

        const state: State = {
            config: getConfig(),
            fileName: document.fileName,
            textCurrentLine,
            textWithinString: getTextWithinString(textCurrentLine, position.character),
            importRange: importStringRange(textCurrentLine, position),
            isImport: isImportOrRequire(textCurrentLine),
            documentExtension: extractExtension(document)
        };
        
        return this.shouldProvide(state) ? this.provide(state) : Promise.resolve([]);
    }

    shouldProvide(state: State) {
        const typedAnything = state.textWithinString && state.textWithinString.length > 0;
        const startsWithDot = typedAnything && state.textWithinString[0] === '.';
        const startsWithMapping = state.config.mappings.some(mapping => state.textWithinString.indexOf(mapping.key) === 0);

        if (state.isImport && (startsWithDot || startsWithMapping)) {
            return true;
        }

        if (!state.isImport && typedAnything) {
            return true;
        }

        return false;
    }

    provide(state: State) {
        const path = getPath(state.fileName, state.textWithinString, state.config.mappings);
        
        return this.getChildrenOfPath(path).then(children => ([
            new UpCompletionItem(),
            ...children.map(child => new PathCompletionItem(child, state.importRange, state.isImport, state.documentExtension, state.config))
        ]));
    }
}