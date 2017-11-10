import { CompletionItemProvider, TextDocument, Position, CompletionItem, workspace, Range, Uri } from 'vscode';
import { isImportExportOrRequire, getTextWithinString, importStringRange } from './utils/text-parser';
import { getPath, extractExtension, Mapping } from './utils/fs-functions';
import { PathCompletionItem } from './completionItems/PathCompletionItem';
import { UpCompletionItem } from './completionItems/UpCompletionItem';
import { getConfig, Config, getWorkspaceConfigs } from './utils/config';

interface Request {
    config?: Config,
    fileName?: string,
    textCurrentLine?: string,
    textWithinString?: string,
    importRange?: Range,
    isImport?: boolean,
    documentExtension?: string
}

export class PathIntellisense implements CompletionItemProvider {

    private workspaceConfigs: Object[];

    constructor(private getChildrenOfPath: Function) {
        getWorkspaceConfigs().then(workspaceConfigs => {
            this.workspaceConfigs = workspaceConfigs;
        });
    }

    provideCompletionItems(document: TextDocument, position: Position): Thenable<CompletionItem[]> {
        const textCurrentLine = document.getText(document.lineAt(position).range);

        const request: Request = {
            config: getConfig(document.uri, this.workspaceConfigs),
            fileName: document.fileName,
            textCurrentLine,
            textWithinString: getTextWithinString(textCurrentLine, position.character),
            importRange: importStringRange(textCurrentLine, position),
            isImport: isImportExportOrRequire(textCurrentLine),
            documentExtension: extractExtension(document)
        };

        return this.shouldProvide(request) ? this.provide(request) : Promise.resolve([]);
    }

    shouldProvide(request: Request) {
        const typedAnything = request.textWithinString && request.textWithinString.length > 0;
        const startsWithDot = typedAnything && request.textWithinString[0] === '.';
        const startsWithMapping = typedAnything && request.config.mappings.some(mapping => request.textWithinString.indexOf(mapping.key) === 0);

        if (request.isImport && (startsWithDot || startsWithMapping)) {
            return true;
        }

        if (!request.isImport && typedAnything) {
            return true;
        }

        return false;
    }

    provide(request: Request) {
        const config = request.config;
        const path = getPath(request.fileName, request.textWithinString, config.absolutePathToWorkspace ? config.folder && config.folder.uri.fsPath : null, config.mappings);

        return this.getChildrenOfPath(path, config).then(children => ([
            new UpCompletionItem(config),
            ...children.map(child => new PathCompletionItem(child, request.importRange, request.isImport, request.documentExtension, config))
        ]));
    }
}