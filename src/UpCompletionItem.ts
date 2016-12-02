import { CompletionItem, CompletionItemKind } from 'vscode';
import { shallAutoSlash } from './config';

export class UpCompletionItem extends CompletionItem {
    constructor() {
        super(`..${shallAutoSlash() ? '/' : ''}`);
        this.kind = CompletionItemKind.File;
    }
}