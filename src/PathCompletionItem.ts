import { CompletionItem, CompletionItemKind } from 'vscode';
import { FileInfo } from './FileInfo';

export class PathCompletionItem extends CompletionItem {
    constructor(fileInfo: FileInfo) {
        super(fileInfo.isFile ? fileInfo.file : `${fileInfo.file}/`);
        this.kind = CompletionItemKind.File;
        this.sortText = `${fileInfo.isFile ? 'b' : 'a'}_${fileInfo.file}`;
    }
}