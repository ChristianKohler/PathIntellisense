import { CompletionItem, CompletionItemKind } from 'vscode';
import { getConfig } from './config';

export class UpCompletionItem extends CompletionItem {
    constructor() {
        super(`..${getConfig().autoSlash ? '/' : ''}`);
        this.kind = CompletionItemKind.File;
    }
}