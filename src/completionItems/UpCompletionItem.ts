import { CompletionItem, CompletionItemKind } from 'vscode';
import { Config } from '../utils/config';

export class UpCompletionItem extends CompletionItem {
    constructor(config: Config) {
        super(`..${config.autoSlash ? '/' : ''}`);
        this.kind = CompletionItemKind.File;
    }
}