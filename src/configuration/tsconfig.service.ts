import * as vscode from "vscode";
import * as JSON5 from "json5";
import { readFileSync } from "fs";
import { Mapping } from "./configuration.interface";

export const getWorkfolderTsConfigConfiguration = memoize(async function (
  workfolder: vscode.WorkspaceFolder
): Promise<Mapping[]> {
  const include = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
  const exclude = new vscode.RelativePattern(workfolder, "**/node_modules/**");
  const files = await vscode.workspace.findFiles(include, exclude);

  let mappings: Mapping[] = [];

  files.forEach(async (file) => {
    try {
      const fileContents = await vscode.workspace.fs.readFile(vscode.Uri.file(file.fsPath));
      const parsedFile = JSON5.parse(fileContents.toString());
      const newMappings = createMappingsFromWorkspaceConfig(parsedFile);
      mappings = [...mappings, ...newMappings];
    } catch {
    }
  });

  return mappings;
});

export function subscribeToTsConfigChanges(): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];
  for (const workfolder of vscode.workspace.workspaceFolders || []) {
    const pattern = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
    const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    fileWatcher.onDidChange(() => invalidateCache(workfolder));
    disposables.push(fileWatcher);
  }
  return disposables;
}

function createMappingsFromWorkspaceConfig(tsconfig: {
  compilerOptions: { baseUrl: string };
}): Mapping[] {
  const mappings: Mapping[] = [];
  const baseUrl = tsconfig?.compilerOptions?.baseUrl;

  if (baseUrl) {
    mappings.push({
      key: baseUrl,
      // value: `${workfolder.uri.path}/${baseUrl}`
      value: "${workspaceFolder}/" + baseUrl,
    });
  }

  // Todo: paths property

  return mappings;
}

/** Caching */

let cachedMappings = new Map<string, Mapping[]>();

function memoize(
  fn: (workfolder: vscode.WorkspaceFolder) => Promise<Mapping[]>
) {
  async function cachedFunction(
    workfolder?: vscode.WorkspaceFolder
  ): Promise<Mapping[]> {
    if (!workfolder) {
      return Promise.resolve([]);
    }

    const key = workfolder.name;
    const cachedMapping = cachedMappings.get(key);

    if (cachedMapping) {
      return cachedMapping;
    } else {
      let result = await fn(workfolder);
      cachedMappings.set(key, result);
      return result;
    }
  }

  return cachedFunction;
}

function invalidateCache(workfolder: vscode.WorkspaceFolder) {
  cachedMappings.delete(workfolder.name);
}
