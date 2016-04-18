import { readdir } from 'fs';
import { resolve as resolvePath, sep as dirSeparator } from 'path';
import { FileInfo } from './FileInfo';

export function getChildrenOfPath(path) {
    return readdirPromise(path)
        .then(files => files.filter(notHidden).map(f => new FileInfo(path, f)))
        .catch(() => []);
}

export function getPath(fileName: string, text: string) : string {
    return resolvePath(fileName.substring(0, fileName.lastIndexOf(dirSeparator)), text);
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