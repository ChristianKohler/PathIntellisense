import * as path from "path";
import { Mapping, Config } from "../configuration/configuration.interface";
import * as minimatch from "minimatch";
import { join } from "path";
import { readdir, statSync } from "fs";
const { promisify } = require("util");
const readdirAsync = promisify(readdir);

export class FileInfo {
  file: string;
  isFile: boolean;

  constructor(path: string, file: string) {
    this.file = file;
    this.isFile = statSync(join(path, file)).isFile();
  }
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
    const files: string[] = await readdirAsync(path);
    return files
      .filter(filename => filterFile(filename, config))
      .map(f => new FileInfo(path, f));
  } catch (error) {
    return [];
  }
}

function filterFile(filename: string, config: Config) {
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
      key => config.filesExclude[key] && minimatch(filename, key)
    )
  );
}
