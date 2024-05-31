import * as assert from "assert";
import { afterEach, beforeEach } from "mocha";
import * as vscode from "vscode";
import { getFileUri } from "../utils/open-document";
import { setConfig, setDefaults } from "../utils/set-config";

const testFile = "demo-workspace/project-three-absolute-changes/index.js";

suite("AbsolutePathTo", () => {
  beforeEach(async () => {
    await setConfig("absolutePathToWorkspace", true);
    await setConfig("absolutePathTo", "${workspaceFolder}/myfolder/");
    await setConfig("showOnAbsoluteSlash", true);
    await setConfig("autoSlashAfterDirectory", true);
  });

  afterEach(async () => {
    await setDefaults();
  });

  test("absolutePathTo basic", async () => {
    const resultOne = await executeCompletionLine1();
    assert.strictEqual(resultOne.items[0].label, "mysubfolder");

    const resultTwo = await executeCompletionLine2();
    assert.strictEqual(resultTwo.items[0].label, "fileInSubfolder.js");
  });

  test("autoslash on", async () => {
    await setConfig("autoSlashAfterDirectory", true);

    const resultSlashTrue = await executeCompletionLine1();
    assert.strictEqual(resultSlashTrue.items[0].insertText, "mysubfolder/");
  });

  test("autoslash off", async () => {
    await setConfig("autoSlashAfterDirectory", false);

    const resultSlashFalse = await executeCompletionLine1();
    assert.strictEqual(resultSlashFalse.items[0].insertText, "mysubfolder");
  });

  test("absolutePathTo", async () => {
    // Change absolutePathTo to just workspaceFolder (mimic absolutePathToWorkspace=true)
    await setConfig("absolutePathTo", "${workspaceFolder}");

    const result = await executeCompletionLine1();
    assert.strictEqual(result.items[0].label, "myfolder");
  });

  test("absolutePathTo outside workspace folder", async () => {
    // Use workspaceFolder + .. parent path
    await setConfig("absolutePathTo", "${workspaceFolder}/..");

    const result = await executeCompletionLine1();
    assert.strictEqual(result.items[1].label, "project-one");
  });

  test("absolutePathTo with odd mapping", async () => {
    // Ensure that (odd) mappings that start with '/' still work
    await setConfig("mappings", { "/odd": "${workspaceFolder}/otherfolder" });

    const result = await executeCompletionLine3();
    assert.strictEqual(result.items[0].label, "othersub");
  });
});

async function executeCompletionLine1() {
  return (await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    getFileUri(testFile),
    new vscode.Position(0, 19)
  )) as vscode.CompletionList;
}

async function executeCompletionLine2() {
  return (await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    getFileUri(testFile),
    new vscode.Position(1, 31)
  )) as vscode.CompletionList;
}

async function executeCompletionLine3() {
  return (await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    getFileUri(testFile),
    new vscode.Position(2, 23)
  )) as vscode.CompletionList;
}
