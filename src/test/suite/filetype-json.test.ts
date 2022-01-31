import * as assert from "assert";
import * as vscode from "vscode";
import { getFileUri } from "../utils/open-document";

suite("Filetype Json", () => {
  test("Get suggestion for a file in json", async () => {
    const actualCompletionList = (await vscode.commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      getFileUri("demo-workspace/project-one/test.json"),
      new vscode.Position(0, 23)
    )) as vscode.CompletionList;

    assert.ok(
      actualCompletionList.items.some((item) => item.label === "mysubfolder")
    );
  });
});
