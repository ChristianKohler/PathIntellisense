import { CompletionItem, CompletionItemKind, Range, TextEdit } from 'vscode';
import { FileInfo } from '../utils/file-info';
import { workspace } from 'vscode';
import { Config } from '../utils/config';
import * as path from 'path';

export class PathCompletionItem extends CompletionItem {
    constructor(fileInfo: FileInfo, importRange: Range, isImport: boolean, documentExtension: string, config: Config) {
        super(fileInfo.file);

        this.kind = CompletionItemKind.File;

        this.addGroupByFolderFile(fileInfo);
        this.removeExtension(config.withExtension, fileInfo, isImport, documentExtension, importRange);
        this.cleanupSass(fileInfo, documentExtension, importRange);
        this.addSlashForFolder(fileInfo, importRange, config.autoSlash);
    }

    addGroupByFolderFile(fileInfo: FileInfo) {
        this.sortText = `${fileInfo.isFile ? 'b' : 'a'}_${fileInfo.file}`;
    }

    addSlashForFolder(fileInfo: FileInfo, importRange: Range, autoSlash: boolean) {
        if (!fileInfo.isFile) {
            this.label = `${fileInfo.file}/`;
            var newText = autoSlash ? `${fileInfo.file}/` : `${fileInfo.file}`;
            this.textEdit = new TextEdit(importRange, newText);
        }
    }

    removeExtension(withExtension: boolean, fileInfo: FileInfo, isImport: boolean, documentExtension: string, importRange: Range) {
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

    cleanupSass(fileInfo: FileInfo, documentExtension: string, importRange: Range) {
        // If the current file or the completion file is not a sass or scss file don't do anything
        if (
            ['sass', 'scss'].indexOf(documentExtension) == -1 ||
            ['sass', 'scss'].indexOf(path.parse(fileInfo.file).ext.replace(/^\./, '')) == -1
        ) {
            return;
        }

        const newText = fileInfo.file.replace(/^_/, '').replace(new RegExp(`\.${documentExtension}$`), '')
        this.textEdit = new TextEdit(importRange, newText)
    }
}