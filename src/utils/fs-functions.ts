import { readdir } from 'fs';
import { resolve as resolvePath, sep as dirSeparator, normalize } from 'path';
import { FileInfo } from './file-info';
import { TextDocument, workspace } from 'vscode';
import { Config } from "./config";
import * as minimatch from 'minimatch';

export interface Mapping {
    key: string,
    value: string
}

export function getChildrenOfPath(path: string, config: Config) {
    return readdirPromise(path)
        .then(files => files
            .filter(filename => filterFile(filename, config))
            .map(f => new FileInfo(path, f)))
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

function filterFile(filename: string, config: Config) {
    if (config.showHiddenFiles) {
        return true;
    }
    return isFileHidden(filename, config) ? false : true;
}

function isFileHidden(filename: string, config: Config) {
    const hasDotPrefix = filename[0] === '.';
    
    // files.exclude has the following form. key is the glob
    // {
    //    "**/*.js": true
    //    "*.git": true
    // }
    const hiddenByVsCode = config.filesExclude && Object.keys(config.filesExclude).some(key => {
        return config.filesExclude[key] && minimatch(filename, key);
    });

    return hasDotPrefix || hiddenByVsCode;
}