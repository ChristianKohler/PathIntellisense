import * as vscode from "vscode";
import { Config, Mapping } from "./configuration.interface";
import { getWorkfolderTsConfigConfiguration } from "./tsconfig.service";
import { parseMappings, replaceWorkspaceFolder } from "./mapping.service";
import { replaceWorkspaceFolderWithRootPath } from "../utils/file-utills";

export async function getConfiguration(
  resource: vscode.Uri
): Promise<Readonly<Config>> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);

  const getConfig = (key: string) =>
    vscode.workspace.getConfiguration(key, resource);

  const cfgExtension = getConfig("path-intellisense");
  const cfgGeneral = getConfig("files");
  const mappings = await getMappings(cfgExtension, workspaceFolder);

  return {
    autoSlash: cfgExtension["autoSlashAfterDirectory"],
    autoTrigger: cfgExtension["autoTriggerNextSuggestion"],
    showHiddenFiles: cfgExtension["showHiddenFiles"],
    withExtension: cfgExtension["extensionOnImport"],
    absolutePathToWorkspace: cfgExtension["absolutePathToWorkspace"],
    absolutePathTo: resolveAbsolutePathTo(
      cfgExtension["absolutePathTo"],
      workspaceFolder
    ),
    showOnAbsoluteSlash: cfgExtension["showOnAbsoluteSlash"],
    filesExclude: cfgGeneral["exclude"],
    mappings,
    sortBy: cfgExtension["sortBy"],
    showFoldersBeforeFiles: cfgExtension["showFoldersBeforeFiles"],
  };
}

async function getMappings(
  configuration: vscode.WorkspaceConfiguration,
  workfolder?: vscode.WorkspaceFolder
): Promise<Mapping[]> {
  const mappings = parseMappings(configuration["mappings"]);
  const ignoreTsConfigBaseUrl = configuration["ignoreTsConfigBaseUrl"];
  const showHiddenFiles = configuration["showHiddenFiles"];
  const filesExclude = configuration["exclude"];
  const tsConfigMappings = await (ignoreTsConfigBaseUrl
    ? []
    : getWorkfolderTsConfigConfiguration(
        workfolder,
        showHiddenFiles,
        filesExclude
      ));
  const allMappings = [...mappings, ...tsConfigMappings];
  return replaceWorkspaceFolder(allMappings, workfolder);
}

function resolveAbsolutePathTo(
  cfgPath?: string,
  workfolder?: vscode.WorkspaceFolder
): string | null {
  const rootPath = workfolder?.uri.path;

  return rootPath && cfgPath
    ? replaceWorkspaceFolderWithRootPath(cfgPath, rootPath)
    : null;
}
