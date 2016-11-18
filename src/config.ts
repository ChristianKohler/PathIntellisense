import {workspace} from 'vscode';

export function shallAutoSlash() {
     const autoSlashAfterFolder : Boolean = workspace.getConfiguration('path-intellisense')['autoSlashAfterDirectory'];
     return autoSlashAfterFolder;
}