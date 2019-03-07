import { CompletionItem, CompletionItemKind, Range, TextEdit } from 'vscode';
import { FileInfo } from '../utils/file-info';
import { workspace } from 'vscode';
import { Config } from '../utils/config';

export class PathCompletionItem extends CompletionItem {
    newText: string;

    constructor(fileInfo: FileInfo, importRange: Range, isImport: boolean, documentExtension: string, config: Config) {
        super(fileInfo.file);
        
        this.kind = CompletionItemKind.File;
        this.newText = fileInfo.file;
        
        this.addGroupByFolderFile(fileInfo);
        this.removeExtension(config.withExtension, fileInfo, isImport, documentExtension, importRange);
        this.addSlashForFolder(fileInfo, importRange, config.autoSlash);
        this.textEdit = new TextEdit(importRange, this.newText);
    }
    
    addGroupByFolderFile(fileInfo: FileInfo) {
        this.sortText = `${fileInfo.isFile ? 'b' : 'a'}_${fileInfo.file}`;
    }
    
    addSlashForFolder(fileInfo: FileInfo, importRange: Range, autoSlash: boolean) {
        if (!fileInfo.isFile) {
            this.label = `${fileInfo.file}/`;
            this.newText = autoSlash ? `${fileInfo.file}/` : `${fileInfo.file}`;
        }
    }
    
    removeExtension(withExtension: boolean, fileInfo: FileInfo, isImport: boolean, documentExtension:string, importRange: Range) {
        if (!fileInfo.isFile || withExtension || !isImport) {
            return;
        }
        
        const fragments = fileInfo.file.split('.');
        const extension = fragments[fragments.length - 1];

        if (extension !== documentExtension) {
            return;
        }

        let index = fileInfo.file.lastIndexOf('.');
        const newText = index != -1 ? fileInfo.file.substring(0, index) : fileInfo.file;
        this.textEdit = new TextEdit(importRange, newText);
    }
}