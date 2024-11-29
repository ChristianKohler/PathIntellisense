import * as vscode from "vscode";
import * as JSON5 from "json5";
import { FilesExclude, Mapping } from "./configuration.interface";
import { join } from "path";
import { getChildrenOfPath } from "../utils/file-utills";

export const getWorkfolderTsConfigConfiguration = memoize(async function (
  workfolder: vscode.WorkspaceFolder,
  showHiddenFiles: boolean,
  filesExclude: FilesExclude
): Promise<Mapping[]> {
  const parsedFiles = await findTsConfigFiles(workfolder);

  let mappings: Mapping[] = [];

  for (const parsedFile of parsedFiles) {
    try {
      const newMappings = await createMappingsFromWorkspaceConfig(
        parsedFile,
        workfolder,
        showHiddenFiles,
        filesExclude
      );
      mappings.push(...newMappings);
    } catch {}
  }

  return mappings;
});

export async function subscribeToTsConfigChanges(
  context: vscode.ExtensionContext
) {
  for (const workfolder of vscode.workspace.workspaceFolders || []) {
    /**
     * Invalidate Cache when tsconfig changes
     */
    let baseUrlWatchers = await subscribeToBaseUrlFolderChanges(workfolder);
    context.subscriptions.push(...baseUrlWatchers);

    /**
     * Invalidate Cache when tsconfig changes
     */
    const pattern = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
    const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    fileWatcher.onDidChange(async () => {
      invalidateCache(workfolder);

      // Throw away old base url subscriptions...
      for (const disposable of baseUrlWatchers) {
        disposable.dispose();
      }

      // .. and create new subscriptions
      baseUrlWatchers = await subscribeToBaseUrlFolderChanges(workfolder);
      context.subscriptions.push(...baseUrlWatchers);
    });

    context.subscriptions.push(fileWatcher);
  }
}

/**
 * Invalidate Cache when tsconfig changes
 */
async function subscribeToBaseUrlFolderChanges(
  workfolder: vscode.WorkspaceFolder
): Promise<vscode.Disposable[]> {
  const disposables = [];

  const tsConfigs = await findTsConfigFiles(workfolder);

  for (const tsconfig of tsConfigs) {
    const baseUrl = tsconfig?.compilerOptions?.baseUrl;

    if (!baseUrl) {
      continue;
    }

    const patternBaseUrl = new vscode.RelativePattern(
      join(workfolder.uri.fsPath, baseUrl),
      "*"
    );
    const fileWatcherBaseUrl = vscode.workspace.createFileSystemWatcher(
      patternBaseUrl,
      false,
      true,
      false
    );

    fileWatcherBaseUrl.onDidCreate((file) =>
      invalidateCacheIfDirectory(file, workfolder)
    );
    fileWatcherBaseUrl.onDidDelete((file) =>
      invalidateCacheIfDirectory(file, workfolder)
    );
    disposables.push(fileWatcherBaseUrl);
  }

  return disposables;
}

async function invalidateCacheIfDirectory(
  file: vscode.Uri,
  workdfolder: vscode.WorkspaceFolder
) {
  const fileStat = await vscode.workspace.fs.stat(file);
  if (fileStat.type === vscode.FileType.Directory) {
    invalidateCache(workdfolder);
  }
}

async function findTsConfigFiles(workfolder: vscode.WorkspaceFolder) {
  const include = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
  const exclude = new vscode.RelativePattern(workfolder, "**/node_modules/**");
  const files = await vscode.workspace.findFiles(include, exclude);

  const parsedFiles = [];

  for (const file of files) {
    try {
      const fileUri = vscode.Uri.file(file.fsPath);
      const fileContents = await vscode.workspace.fs.readFile(fileUri);
      const parsedFile = JSON5.parse(fileContents.toString());
      parsedFiles.push(parsedFile);
    } catch {}
  }

  return parsedFiles;
}

async function createMappingsFromWorkspaceConfig(
  tsconfig: {
    compilerOptions: { baseUrl: string, paths?: Record<string, string[]> };
  },
  workfolder: vscode.WorkspaceFolder,
  showHiddenFiles: boolean,
  filesExclude: FilesExclude
): Promise<Mapping[]> {
  const mappings: Mapping[] = [];
  const baseUrl = tsconfig?.compilerOptions?.baseUrl;
  const paths = tsconfig?.compilerOptions?.paths;

  if (paths && baseUrl && workfolder) {
    for (const alias in paths) {
      const destinations = paths[alias];

      destinations.forEach((dest) => {
        mappings.push({
          key: alias.replace(/\*$/, ''),
          value: '${workspaceFolder}/' + join(baseUrl, dest.replace(/\*$/, '')),
        });
      });
    }
  }

  if (baseUrl && workfolder) {
    const foldersInBaseUrl = await getFoldersInBaseUrl(
      workfolder,
      baseUrl,
      showHiddenFiles,
      filesExclude
    );

    for (const folderInBaseUrl of foldersInBaseUrl) {
      mappings.push({
        key: folderInBaseUrl,
        // value: `${workfolder.uri.path}/${baseUrl}`
        value: "${workspaceFolder}/" + baseUrl + "/" + folderInBaseUrl,
      });
    }
  }

  return mappings;
}

async function getFoldersInBaseUrl(
  workfolder: vscode.WorkspaceFolder,
  baseUrl: string,
  showHiddenFiles: boolean,
  filesExclude: FilesExclude
) {
  const allFiles = await getChildrenOfPath(
    join(workfolder.uri.fsPath, baseUrl),
    showHiddenFiles,
    filesExclude
  );

  const folders = allFiles.filter((file) => !file.isFile);
  return folders.map((folder) => folder.file);
}

/** Caching */

let cachedMappings = new Map<string, Mapping[]>();

function memoize(
  fn: (
    workfolder: vscode.WorkspaceFolder,
    showHiddenFiles: boolean,
    filesExclude: FilesExclude
  ) => Promise<Mapping[]>
) {
  async function cachedFunction(
    workfolder?: vscode.WorkspaceFolder,
    showHiddenFiles?: boolean,
    filesExclude?: FilesExclude
  ): Promise<Mapping[]> {
    if (!workfolder) {
      return Promise.resolve([]);
    }

    const key = workfolder.name;
    const cachedMapping = cachedMappings.get(key);

    if (cachedMapping) {
      return cachedMapping;
    } else {
      let result = await fn(
        workfolder,
        showHiddenFiles || false,
        filesExclude || {}
      );
      cachedMappings.set(key, result);
      return result;
    }
  }

  return cachedFunction;
}

function invalidateCache(workfolder: vscode.WorkspaceFolder) {
  cachedMappings.delete(workfolder.name);
}
