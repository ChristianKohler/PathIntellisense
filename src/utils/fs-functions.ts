import { readdir } from 'fs';
import * as path from 'path';
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

/**
 * @param fileName  {string} current filename the look up is done. Absolute path
 * @param text      {string} text in import string. e.g. './src/'
 */
export function getPath(fileName: string, text: string, rootPath?: string, mappings?: Mapping[]) : string {        
    const textAfterLastSlashRemoved = text.substring(0, text.lastIndexOf(path.sep) + 1);
    const normalizedText = path.normalize(textAfterLastSlashRemoved);
    const isPathAbsolute = normalizedText.startsWith(path.sep);

    let rootFolder = path.dirname(fileName);
    let pathEntered = normalizedText;

    // Search a mapping for the current text. First mapping is used where text starts with mapping
    const mapping = mappings && mappings.reduce((prev, curr) => {
        return prev || (normalizedText.startsWith(curr.key) && curr)
    }, undefined);

    if (mapping) {
        rootFolder = mapping.value;
        pathEntered = normalizedText.substring(mapping.key.length, normalizedText.length);
    } 
    
    if(isPathAbsolute) {
        rootFolder = rootPath || '';
    }

    return path.join(rootFolder, pathEntered);
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
    return filename.startsWith('.') || isFileHiddenByVsCode(filename, config);
}

/**
 * files.exclude has the following form. key is the glob
 * {
 *    "**//*.js": true
 *    "**//*.js": true "*.git": true
 * }
 */
function isFileHiddenByVsCode(filename: string, config: Config) {
    return config.filesExclude && Object.keys(config.filesExclude)
        .some(key => config.filesExclude[key] && minimatch(filename, key));
}