import { readdir } from 'fs';
import { resolve as resolvePath, sep as dirSeparator } from 'path';
import { FileInfo } from './FileInfo';
import { TextDocument } from 'vscode';

export function getChildrenOfPath(path) {
    return readdirPromise(path)
        .then(files => files.filter(notHidden).map(f => new FileInfo(path, f)))
        .catch(() => []);
}

export function getPath(fileName: string, text: string) : string {
    return resolvePath(fileName.substring(0, fileName.lastIndexOf(dirSeparator)), text.substring(0, text.lastIndexOf(dirSeparator)));;
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
    return filename[0] !== '.';
}