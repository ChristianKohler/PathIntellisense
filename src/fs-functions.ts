import { readdir } from 'fs';
import { resolve as resolvePath, sep as dirSeparator, normalize } from 'path';
import { FileInfo } from './FileInfo';
import { TextDocument, workspace } from 'vscode';

export interface Mapping {
    key: string,
    value: string
}

export function getChildrenOfPath(path) {
    return readdirPromise(path)
        .then(files => files.filter(notHidden).map(f => new FileInfo(path, f)))
        .catch(() => []);
}

export function getPath(fileName: string, text: string, mappings?: Mapping[]) : string {        
    const mapping = mappings && mappings.reduce((prev, curr) => {
        return prev || (normalize(text).indexOf(curr.key) === 0 && curr)
    }, undefined);

    const referencedFolder = mapping ? mapping.value : fileName.substring(0, fileName.lastIndexOf(dirSeparator));
    const lastFolderInText = normalize(text).substring(0, normalize(text).lastIndexOf(dirSeparator));
    const pathInText = mapping ? `.${lastFolderInText.substring(mapping.key.length, lastFolderInText.length)}`: lastFolderInText;

    return resolvePath(referencedFolder, pathInText);
}

export function extractExtension(document: TextDocument) {
    if (document.isUntitled) {
        return undefined;
    }

    const fragments = document.fileName.split('.');
    const extension = fragments[fragments.length - 1];

    if (!extension || extension.length > 3) {
        return undefined;
    }

    return extension;
}

function readdirPromise(path: string) {
    return new Promise<string[]>((resolve, reject) => {
        readdir(path, (error, files) => {
            if(error){
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}

function notHidden(filename) {
    const showHiddenFiles = workspace.getConfiguration('path-intellisense')['showHiddenFiles'];
    return showHiddenFiles || filename[0] !== '.';
}