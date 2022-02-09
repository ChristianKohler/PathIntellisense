import * as assert from "assert";
import * as vscode from "vscode";
import { getFileUri } from "../utils/open-document";
import { setConfig } from "../utils/set-config";

suite("BaseUrl", () => {
  test("Get correct file when not using baseUrl", async () => {
    await setConfig("ignoreTsConfigBaseUrl", false);
    const actualCompletionList = (await vscode.commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      getFileUri(
        "demo-workspace/project-withBaseUrlRoot/myfolder/fileInFolder.js"
      ),
      new vscode.Position(0, 20)
    )) as vscode.CompletionList;

    assert.ok(
      actualCompletionList.items.some((item) => item.label === "otherfile.js")
    );
  });
});
