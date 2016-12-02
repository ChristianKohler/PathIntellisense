import { CompletionItem, CompletionItemKind, Range, TextEdit } from 'vscode';
import { FileInfo } from './FileInfo';
import { workspace } from 'vscode';
import { shallAutoSlash as shallAutoSlashAfterFolder} from './config';

const withExtension = workspace.getConfiguration('path-intellisense')['extensionOnImport'];

export class PathCompletionItem extends CompletionItem {
    private importRange: Range;
    
    constructor(fileInfo: FileInfo, importRange: Range, isImport: boolean, documentExtension: string) {
        super(fileInfo.file);
        
        this.kind = CompletionItemKind.File;
        this.importRange = importRange;
        
        this.addGroupByFolderFile(fileInfo);
        this.removeExtension(fileInfo, isImport, documentExtension);
        this.addSlashForFolder(fileInfo);
    }
    
    addGroupByFolderFile(fileInfo: FileInfo) {
        this.sortText = `${fileInfo.isFile ? 'b' : 'a'}_${fileInfo.file}`;
    }
    
    addSlashForFolder(fileInfo: FileInfo) {
        if (!fileInfo.isFile) {
            this.label = `${fileInfo.file}/`;
            var newText = shallAutoSlashAfterFolder() ? `${fileInfo.file}/` : `${fileInfo.file}`;
            this.textEdit = new TextEdit(this.importRange, newText);
        }
    }
    
    removeExtension(fileInfo: FileInfo, isImport: boolean, documentExtension:string) {
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
        this.textEdit = new TextEdit(this.importRange, newText);
    }
}