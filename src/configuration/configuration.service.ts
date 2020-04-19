import * as vscode from "vscode";
import * as JSON5 from "json5";
import { readFileSync } from "fs";
import { Config, Mapping } from "./configuration.interface";

let cachedConfiguration = new Map<string, Config>();

export async function subscribeToConfigurationService(): Promise<
  vscode.Disposable[]
> {
  await preFetchConfiguration();

  const disposables: vscode.Disposable[] = [];
  for (const workfolder of vscode.workspace.workspaceFolders || []) {
    const pattern = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
    const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    fileWatcher.onDidChange(preFetchConfiguration);
    disposables.push(fileWatcher);
  }

  const configurationWatcher = vscode.workspace.onDidChangeConfiguration(
    preFetchConfiguration
  );
  disposables.push(configurationWatcher);

  return disposables;
}

export function getConfiguration(): Readonly<Config> {
  const currentFile = vscode.window.activeTextEditor?.document.uri;

  if (!currentFile) {
    return getWorkspaceConfiguration();
  }

  const workSpaceKey = vscode.workspace.getWorkspaceFolder(currentFile)?.name;

  if (!workSpaceKey) {
    return getWorkspaceConfiguration();
  }

  return cachedConfiguration.get(workSpaceKey) || getWorkspaceConfiguration();
}

async function preFetchConfiguration() {
  for (const workfolder of vscode.workspace.workspaceFolders || []) {
    const configuration = await getConfigurationForWorkfolder(workfolder);
    cachedConfiguration.set(workfolder.name, configuration);
  }
}

async function getConfigurationForWorkfolder(
  workfolder: vscode.WorkspaceFolder
): Promise<Config> {
  const workspaceConfiguration = getWorkspaceConfiguration();
  const workfolderTSConfig = await getWorkfolderTsConfigConfiguration(
    workfolder
  );
  return {
    ...workspaceConfiguration,
    ...workfolderTSConfig
  };
}

async function getWorkfolderTsConfigConfiguration(
  workfolder: vscode.WorkspaceFolder
): Promise<Partial<Config>> {
  const include = new vscode.RelativePattern(workfolder, "[tj]sconfig.json");
  const exclude = new vscode.RelativePattern(workfolder, "**/node_modules/**");

  const files = await vscode.workspace.findFiles(include, exclude);

  const mappingsFromWorkspaceConfig = files.reduce(
    (mappings: Mapping[], file) => {
      try {
        const parsedFile = JSON5.parse(readFileSync(file.fsPath).toString());
        const newMappings = createMappingsFromWorkspaceConfig(parsedFile);
        return [...mappings, ...newMappings];
      } catch (error) {
        return mappings;
      }
    },
    []
  );

  const configuration = vscode.workspace.getConfiguration("path-intellisense");
  const rawMappings = configuration["mappings"];
  const parsedMappings = parseMappings(rawMappings);

  const allMappings = [...parsedMappings, ...mappingsFromWorkspaceConfig];
  const mappingsWithCorrectPath = replaceWorkspaceRoot(allMappings, workfolder);

  return {
    mappings: mappingsWithCorrectPath
  };
}

function getWorkspaceConfiguration(): Config {
  const cfgExtension = vscode.workspace.getConfiguration("path-intellisense");
  const cfgGeneral = vscode.workspace.getConfiguration("files");

  return {
    autoSlash: cfgExtension["autoSlashAfterDirectory"],
    showHiddenFiles: cfgExtension["showHiddenFiles"],
    withExtension: cfgExtension["extensionOnImport"],
    absolutePathToWorkspace: cfgExtension["absolutePathToWorkspace"],
    filesExclude: cfgGeneral["exclude"],
    mappings: []
  };
}

/**
 * From { "lib": "libraries", "other": "otherpath" }
 * To [ { key: "lib", value: "libraries" }, { key: "other", value: "otherpath" } ]
 * @param mappings { "lib": "libraries" }
 */
function parseMappings(mappings: { [key: string]: string }): Mapping[] {
  return Object.entries(mappings).map(([key, value]) => ({ key, value }));
}

/**
 * Replace ${workspaceRoot} with workfolder.uri.path
 * @param mappings
 * @param workfolder
 */
function replaceWorkspaceRoot(
  mappings: Mapping[],
  workfolder: vscode.WorkspaceFolder
): Mapping[] {
  return mappings.map(mapping => {
    return {
      key: mapping.key,
      value: mapping.value.replace("${workspaceRoot}", workfolder.uri.path)
    };
  });
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
      value: "${workspaceRoot}/" + baseUrl
    });
  }

  // Todo: paths property

  return mappings;
}
