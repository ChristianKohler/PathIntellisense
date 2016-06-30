import { CompletionItem, CompletionItemKind } from 'vscode';

export class UpCompletionItem extends CompletionItem {
    constructor() {
        super('..');
        this.kind = CompletionItemKind.File;
    }
}