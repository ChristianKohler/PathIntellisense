import * as assert from "assert";
import * as vscode from "vscode";
import { beforeEach, afterEach } from "mocha";
import { getFileUri } from "../utils/open-document";
import { setConfig, setDefaults } from "../utils/set-config";

suite("BaseUrl", () => {
  beforeEach(async () => {
    await setDefaults();
  });

  afterEach(async () => {
    await setDefaults();
  });

  suite("with baseUrl ./", () => {
    const project = "demo-workspace/project-withBaseUrlRoot";
    const fileInFolder = `${project}/myfolder/fileInFolder.js`;

    test("Get correct file when not using baseUrl", async () => {
      await setConfig("ignoreTsConfigBaseUrl", false);
      const result = await triggerCompletion(fileInFolder, 0, 20);
      assert.ok(hasItem(result, "otherfile.js"));
    });

    test("Get correct file when using baseUrl", async () => {
      await setConfig("ignoreTsConfigBaseUrl", false);
      const result = await triggerCompletion(fileInFolder, 1, 30);
      assert.ok(hasItem(result, "fileInOtherFolder.js"));
    });
  });

  suite("with baseUrl src", () => {
    const project = "demo-workspace/project-withBaseUrlRoot2";
    const fileInBar = `${project}/src/bar/index.js`;

    test("Get correct file when using baseUrl", async () => {
      await setConfig("ignoreTsConfigBaseUrl", false);
      const result = await triggerCompletion(fileInBar, 0, 22);

      for (const item of result.items) {
        console.log("====");
        console.log(item.label);
        console.log("====");
      }

      assert.ok(hasItem(result, "foo-a"));
      assert.ok(hasItem(result, "foo-b"));
    });

    test("Get correct file when using baseUrl in subfolders", async () => {
      await setConfig("ignoreTsConfigBaseUrl", false);
      const result = await triggerCompletion(fileInBar, 1, 28);

      for (const item of result.items) {
        console.log("====");
        console.log(item.label);
        console.log("====");
      }

      assert.ok(hasItem(result, "foo-a1"));
      assert.ok(hasItem(result, "foo-a2"));
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
