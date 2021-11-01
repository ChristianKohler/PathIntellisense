import * as path from "path";
import * as vscode from "vscode";
import { Mapping, Config } from "../configuration/configuration.interface";
import * as minimatch from "minimatch";
import { join } from "path";

export interface FileInfo {
  file: string;
  isFile: boolean;
  documentExtension?: string;
}

/**
 * @param fileName  {string} current filename the look up is done. Absolute path
 * @param text      {string} text in import string. e.g. './src/'
 */
export function getPathOfFolderToLookupFiles(
  fileName: string,
  text: string | undefined,
  rootPath?: string,
  mappings?: Mapping[]
): string {
  const normalizedText = path.normalize(text || "");

  const isPathAbsolute = normalizedText.startsWith(path.sep);

  let rootFolder = path.dirname(fileName);
  let pathEntered = normalizedText;

  // Search a mapping for the current text. First mapping is used where text starts with mapping
  const mapping =
    mappings &&
    mappings.reduce((prev: any, curr: any) => {
      return prev || (normalizedText.startsWith(curr.key) && curr);
    }, undefined);

  if (mapping) {
    rootFolder = mapping.value;
    pathEntered = normalizedText.substring(
      mapping.key.length,
      normalizedText.length
    );
  }

  if (isPathAbsolute) {
    rootFolder = rootPath || "";
  }

  return path.join(rootFolder, pathEntered);
}

export async function getChildrenOfPath(path: string, config: Config) {
  try {
    const filesTubles = await vscode.workspace.fs.readDirectory(
      vscode.Uri.parse(path)
    );

    const files = filesTubles
      .map((fileTuble) => fileTuble[0])
      .filter((filename) => filterHiddenFiles(filename, config));

    const fileInfoList: FileInfo[] = [];

    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(
        vscode.Uri.file(join(path, file))
      );
      fileInfoList.push({
        file,
        isFile: fileStat.type === vscode.FileType.File,
        documentExtension: getDocumentExtension(file, fileStat),
      });
    }

    return fileInfoList;
  } catch (error) {
    return [];
  }
}

function getDocumentExtension(file: string, fileStat: vscode.FileStat) {
  if (fileStat.type !== vscode.FileType.File) {
    return undefined;
  }

  const fragments = file.split(".");
  return fragments[fragments.length - 1];
}

function filterHiddenFiles(filename: string, config: Config) {
  if (config.showHiddenFiles) {
    return true;
  }
  return isFileHidden(filename, config) ? false : true;
}

function isFileHidden(filename: string, config: Config) {
  return filename.startsWith(".") || isFileHiddenByVsCode(filename, config);
}

// files.exclude has the following form. key is the glob
// {
//    "**//*.js": true
//    "**//*.js": true "*.git": true
// }
function isFileHiddenByVsCode(filename: string, config: Config) {
  return (
    config.filesExclude &&
    Object.keys(config.filesExclude).some(
      (key) => config.filesExclude[key] && minimatch(filename, key)
    )
  );
}
