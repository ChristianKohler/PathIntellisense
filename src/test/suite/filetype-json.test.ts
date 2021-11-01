import * as vscode from "vscode";
import * as assert from "assert";
import { delay } from "../utils/delay";
import { openDocument } from "../utils/open-document";

suite("Filetype Json", () => {
  test("Get suggestion for a file in json", async () => {
    await openDocument("demo-workspace/project-one/test.json");
    const editor = vscode.window.activeTextEditor!;

    await editor.edit((edit) => {
      edit.insert(new vscode.Position(0, 0), `{ "image": "./" }`);
    });

    editor.selection = new vscode.Selection(0, 14, 0, 14);

    await triggerAndUseFirstSuggestion();

    await addSlash(editor);

    await triggerAndUseFirstSuggestion();

    await addSlash(editor);

    await triggerAndUseFirstSuggestion();

    const text = editor.document.getText();

    assert.strictEqual(
      text,
      `{ "image": "./myfolder/mysubfolder/fileInSubfolder.js" }\n`
    );
  });
});

async function triggerAndUseFirstSuggestion() {
  await vscode.commands.executeCommand("editor.action.triggerSuggest");
  await delay(400);
  await vscode.commands.executeCommand("acceptSelectedSuggestion");
  await delay(400);
}

async function addSlash(editor: vscode.TextEditor) {
  await editor.edit((edit) => {
    edit.insert(editor.selection.active, "/");
  });
  await delay(500);
}
