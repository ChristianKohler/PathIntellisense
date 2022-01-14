import { Mapping } from "./configuration.interface";
import * as vscode from "vscode";
import { replaceWorkspaceFolderWithRootPath } from "../utils/file-utills";

/**
 * From { "lib": "libraries", "other": "otherpath" }
 * To [ { key: "lib", value: "libraries" }, { key: "other", value: "otherpath" } ]
 * @param mappings { "lib": "libraries" }
 */
export function parseMappings(mappings: { [key: string]: string }): Mapping[] {
  return Object.entries(mappings).map(([key, value]) => ({ key, value }));
}

/**
 * Replace ${workspaceRoot} with workfolder.uri.path
 * @param mappings
 * @param workfolder
 */
export function replaceWorkspaceFolder(
  mappings: Mapping[],
  workfolder?: vscode.WorkspaceFolder
): Mapping[] {
  const rootPath = workfolder?.uri.path;

  if (rootPath) {
    /** Replace placeholder with workspace folder */
    return mappings.map(({ key, value }) => ({
      key,
      value: replaceWorkspaceFolderWithRootPath(value, rootPath),
    }));
  } else {
    /** Filter items out which contain a workspace root */
    return mappings.filter(({ value }) => !valueContainsWorkspaceFolder(value));
  }
}

function valueContainsWorkspaceFolder(value: string): boolean {
  return (
    value.indexOf("${workspaceRoot}") >= 0 ||
    value.indexOf("${workspaceFolder}") >= 0
  );
}
