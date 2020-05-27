import { Mapping } from "./configuration.interface";
import * as vscode from "vscode";

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
export function replaceWorkspaceRoot(
  mappings: Mapping[],
  workfolder?: vscode.WorkspaceFolder
): Mapping[] {
  const rootPath = workfolder?.uri.path;

  if (rootPath) {
    return mappings.map(({ key, value }) => ({
      key,
      value: value.replace("${workspaceRoot}", rootPath),
    }));
  } else {
    return mappings.filter(
      ({ value }) => value.indexOf("${workspaceRoot}") === -1
    );
  }
}
