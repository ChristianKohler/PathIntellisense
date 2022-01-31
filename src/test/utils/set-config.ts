import * as vscode from "vscode";

export async function setConfig(key: string, value: any) {
  const cfg = vscode.workspace.getConfiguration();
  await cfg.update(
    `path-intellisense.${key}`,
    value,
    vscode.ConfigurationTarget.Workspace
  );
}

export async function setDefaults() {
  await setConfig("autoSlashAfterDirectory", undefined);
  await setConfig("autoTriggerNextSuggestion", undefined);
  await setConfig("showHiddenFiles", undefined);
  await setConfig("extensionOnImport", undefined);
  await setConfig("absolutePathToWorkspace", undefined);
  await setConfig("absolutePathTo", undefined);
  await setConfig("showOnAbsoluteSlash", undefined);
  await setConfig("exclude", undefined);
  await setConfig("mappings", undefined);
  await setConfig("ignoreTsConfigBaseUrl", false);
}
