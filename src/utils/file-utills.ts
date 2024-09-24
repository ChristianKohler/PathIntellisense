import * as minimatch from "minimatch";
import * as path from "path";
import { join } from "path";
import * as vscode from "vscode";
import {
  FilesExclude,
  Mapping,
  SortBy,
} from "../configuration/configuration.interface";

export interface FileInfo {
  file: string;
  isFile: boolean;
  documentExtension?: string;
  sortKey?: string;
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
  // Note: since we're normalizing the text here, we have to normalize everything we want
  //  to compare it against as path.normalize() turns forward slashes into backslashes on
  //  Windows.
  const normalizedText = path.normalize(text || "");
  const isPathAbsolute = normalizedText.startsWith(path.sep);

  // Search a mapping for the current text. First mapping is used where text starts with mapping
  const mapping =
    mappings &&
    mappings.reduce((prev: any, curr: any) => {
      return (
        prev || (normalizedText.startsWith(path.normalize(curr.key)) && curr)
      );
    }, undefined);

  let rootFolder, pathEntered;
  if (mapping) {
    // The values of mapped (key,value)-pairs are all considered to be absolute paths, so
    //  this rootFolder value (taken from the mapping's value) is left unchanged.
    rootFolder = mapping.value;
    pathEntered = normalizedText.slice(
      path.normalize(mapping.key).length,
      normalizedText.length
    );
  } else {
    // We only care about whether the path specified was absolute if it's unmapped (e.g.
    //  we allow user-specified maps to "override" (skip) this root folder determination.)
    rootFolder = isPathAbsolute ? rootPath || "" : path.dirname(fileName);
    pathEntered = normalizedText;
  }

  return path.join(rootFolder, pathEntered);
}

function isReverseSort(sortBy: SortBy) {
  return sortBy.startsWith("r-");
}

function getValueToSortBy(sortBy: SortBy, fileInfo: FileInfo, stat: vscode.FileStat): number | string {
  const name = fileInfo.file;
  switch (sortBy) {
    case "name":
    case "r-name":
      return name;
    case "type":
    case "r-type":
      return stat.type;
    case "modified":
    case "r-modified":
      return stat.mtime;
    case "size":
    case "r-size":
      return stat.size;
    case "none":
      return 0;
    default:
      return name;
  }
}

function getSortedIndices(
  indicesToSort: number[],
  sortValues: (number | string)[],
  sortBy: SortBy) {
  const sortedIndices = indicesToSort.slice();
  sortedIndices.sort((a, b) => {
    const valueA = sortValues[a];
    const valueB = sortValues[b];
    if (valueA === valueB) {
      return 0;
    }
    return valueA < valueB ? -1 : 1;
  });

  if (isReverseSort(sortBy)) {
    sortedIndices.reverse();
  }

  return sortedIndices;
}

function addSortKeys(
  fileInfoList: FileInfo[],
  sortValues: (number | string)[],
  sortBy: SortBy,
  showFoldersBeforeFiles: boolean
) {
  if (sortBy === "none") {
    return Array.from({ length: fileInfoList.length }, () => "");
  }

  const infoWithIndices = fileInfoList.map((fileInfo, index) => ({ fileInfo, index }));
  let filesIndices = infoWithIndices.filter(({ fileInfo }) => fileInfo.isFile).map(({ index }) => index);
  let foldersIndices = infoWithIndices.filter(({ fileInfo }) => !fileInfo.isFile).map(({ index }) => index);
  if (!showFoldersBeforeFiles) {
    filesIndices = filesIndices.concat(foldersIndices);
    foldersIndices = [];
  }

  const sortedFilesIndices = getSortedIndices(filesIndices, sortValues, sortBy);
  const sortedFoldersIndices = getSortedIndices(foldersIndices, sortValues, sortBy);

  const sortedIndices = sortedFoldersIndices.concat(sortedFilesIndices);

  const numPad = Math.ceil(Math.log10(sortedIndices.length + 1));
  sortedIndices.forEach((index, i) => {
    fileInfoList[index].sortKey = i.toString().padStart(numPad, "0");
  });
}

export async function getChildrenOfPath(
  path: string,
  showHiddenFiles: boolean,
  filesExclude: FilesExclude,
  sort?: { sortBy: SortBy, showFoldersBeforeFiles: boolean }
) {
  try {
    const filesTubles = await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(path)
    );

    const files = filesTubles
      .map((fileTuble) => fileTuble[0])
      .filter((filename) =>
        filterHiddenFiles(filename, showHiddenFiles, filesExclude)
      );

    const fileInfoList: FileInfo[] = [];
    const sortValues: (number | string)[] = [];

    const { sortBy = "name", showFoldersBeforeFiles = true } = sort ?? {};

    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(
        vscode.Uri.file(join(path, file))
      );
      fileInfoList.push({
        file,
        isFile: fileStat.type === vscode.FileType.File,
        documentExtension: getDocumentExtension(file, fileStat),
      });
      if (sortBy !== "none") {
        const value = getValueToSortBy(sortBy, fileInfoList[fileInfoList.length - 1], fileStat);
        sortValues.push(value);
      }
    }

    addSortKeys(fileInfoList, sortValues, sortBy, showFoldersBeforeFiles);

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

function filterHiddenFiles(
  filename: string,
  showHiddenFiles: boolean,
  filesExclude: FilesExclude
) {
  if (showHiddenFiles) {
    return true;
  }
  return isFileHidden(filename, filesExclude) ? false : true;
}

function isFileHidden(filename: string, filesExclude: FilesExclude) {
  return (
    filename.startsWith(".") || isFileHiddenByVsCode(filename, filesExclude)
  );
}

// files.exclude has the following form. key is the glob
// {
//    "**//*.js": true
//    "**//*.js": true "*.git": true
// }
function isFileHiddenByVsCode(filename: string, filesExclude: FilesExclude) {
  return (
    filesExclude &&
    Object.keys(filesExclude).some(
      (key) => filesExclude[key] && minimatch(filename, key)
    )
  );
}

/**
 * Replaces both placeholders with the rootpath
 * - ${workspaceRoot}    // old way and only legacy support
 * - ${workspaceFolder}  // new way
 * @param value
 * @param rootPath
 */
export function replaceWorkspaceFolderWithRootPath(
  value: string,
  rootPath: string
) {
  return value
    .replace("${workspaceRoot}", rootPath)
    .replace("${workspaceFolder}", rootPath);
}
