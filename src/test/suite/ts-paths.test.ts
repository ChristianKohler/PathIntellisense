import * as assert from "assert";
import * as vscode from "vscode";
import { beforeEach, afterEach } from "mocha";
import { getFileUri } from "../utils/open-document";
import { setConfig, setDefaults } from "../utils/set-config";

suite("tsconfig paths", () => {
  beforeEach(async () => {
    await setDefaults();
  });

  afterEach(async () => {
    await setDefaults();
  });

  suite("with baseUrl ./", () => {
    const project = "demo-workspace/project-with-paths";
    const fileInFolder = `${project}/src/index.js`;

    test("Get correct file when not using baseUrl", async () => {
      await setConfig("ignoreTsConfigBaseUrl", false);
      const result = await triggerCompletion(fileInFolder, 0, 19);
      assert.ok(hasItem(result, "foo"));
      assert.ok(hasItem(result, "bar"));
    });
  });
});

async function triggerCompletion(uri: string, line: number, column: number) {
  return (await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    getFileUri(uri),
    new vscode.Position(line, column)
  )) as vscode.CompletionList;
}

function hasItem(list: vscode.CompletionList, label: string) {
  return list.items.some((item) => item.label === label);
}
