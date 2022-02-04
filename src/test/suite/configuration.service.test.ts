import * as assert from "assert";
import { beforeEach, afterEach } from "mocha";
import * as vscode from "vscode";
import { getConfiguration } from "../../configuration/configuration.service";
import { subscribeToTsConfigChanges } from "../../configuration/tsconfig.service";
import { delay } from "../utils/delay";
import { getAbsoluteUrl, openDocument } from "../utils/open-document";
import { setConfig, setDefaults } from "../utils/set-config";

suite("Configuration Service", () => {
  beforeEach(async () => {
    await setDefaults();
  });

  afterEach(async () => {
    await setDefaults();
  });

  test("has different configuration for the workspaceFolders", async () => {
    await subscribeToTsConfigChanges();

    await setConfig("absolutePathToWorkspace", true);
    await setConfig("extensionOnImport", true);
    await setConfig("ignoreTsConfigBaseUrl", false);
    await setConfig("mappings", {
      lib: "${workspaceFolder}/lib",
    });

    const document = await openDocument("demo-workspace/project-one/index.js");
    const configurationProjectOne = await getConfiguration(document.uri);

    const document2 = await openDocument("demo-workspace/project-two/index.js");
    const configurationProjectTwo = await getConfiguration(document2.uri);

    assert.strictEqual(
      configurationProjectOne?.absolutePathToWorkspace,
      true,
      "1:absolutePathToWorkspace"
    );
    assert.strictEqual(
      configurationProjectOne?.withExtension,
      true,
      "1:withExtension"
    );
    assertEndsWith(
      configurationProjectOne?.mappings[0].value,
      "/demo-workspace/project-one/lib",
      "1:mappings[0]"
    );
    assertEndsWith(
      configurationProjectOne?.mappings[1].value,
      "/demo-workspace/project-one/baseurl-one",
      "1:mappings[1]"
    );

    assert.strictEqual(
      configurationProjectTwo?.absolutePathToWorkspace,
      true,
      "2:absolutePathToWorkspace"
    );
    assert.strictEqual(
      configurationProjectTwo?.withExtension,
      true,
      "2:withExtension"
    );
    assertEndsWith(
      configurationProjectTwo?.mappings[0].value,
      "/demo-workspace/project-two/lib",
      "1:mappings[0]"
    );
    assertEndsWith(
      configurationProjectTwo?.mappings[1].value,
      "/demo-workspace/project-two/baseurl-two",
      "1:mappings[1]"
    );
  });

  test("still can load the config with a wrong ts config", async () => {
    assert.doesNotThrow(async () => {
      await subscribeToTsConfigChanges();
    });
  });

  test("has default configuration for non project folder files", async () => {
    await subscribeToTsConfigChanges();

    await setConfig("absolutePathToWorkspace", true);
    await setConfig("extensionOnImport", true);
    await setConfig("mappings", {
      lib: "${workspaceFolder}/lib",
    });

    const document = await openDocument(
      "demo-workspace/file-outside-folders.js"
    );
    const configuration = await getConfiguration(document.uri);

    assert.strictEqual(configuration?.absolutePathToWorkspace, true);
    assert.strictEqual(configuration?.withExtension, true);
    assert.strictEqual(configuration?.mappings.length, 0);
    assert.strictEqual(configuration?.showOnAbsoluteSlash, true);
  });

  test("does not use tsconfig if disabled", async () => {
    await setConfig("ignoreTsConfigBaseUrl", false);
    const documentOne = await openDocument(
      "demo-workspace/project-one/index.js"
    );
    const configuration = await getConfiguration(documentOne.uri);

    await setConfig("ignoreTsConfigBaseUrl", true);

    const configurationNew = await getConfiguration(documentOne.uri);

    assert.strictEqual(configuration?.mappings.length, 1);
    assert.strictEqual(configurationNew?.mappings.length, 0);
  });

  test("updates configuration on tsconfig change", async () => {
    await subscribeToTsConfigChanges();

    await setConfig("absolutePathToWorkspace", true);
    await setConfig("ignoreTsConfigBaseUrl", false);
    await setConfig("extensionOnImport", true);
    await setConfig("mappings", {
      lib: "${workspaceFolder}/lib",
    });

    // Read existing configuration
    const documentOne = await openDocument(
      "demo-workspace/project-one/index.js"
    );
    const configuration = await getConfiguration(documentOne.uri);

    // change tsconfig file
    const absoluteUrl = getAbsoluteUrl(
      "demo-workspace/project-one/tsconfig.json"
    );
    const document = await vscode.workspace.openTextDocument(absoluteUrl);
    await vscode.window.showTextDocument(document);
    await vscode.window.activeTextEditor?.edit((editbuilder) => {
      editbuilder.replace(new vscode.Range(2, 24, 2, 27), "bla");
    });
    await document.save();

    // wait for the configuration to be updated..
    await delay(1500);

    // Read existing configuration
    const otherDocument = await openDocument(
      "demo-workspace/project-one/index.js"
    );
    const newConfiguration = await getConfiguration(otherDocument.uri);

    // Clean up
    await vscode.window.showTextDocument(document);
    await vscode.window.activeTextEditor?.edit((editbuilder) => {
      editbuilder.replace(new vscode.Range(2, 24, 2, 27), "one");
    });
    await document.save();

    assert.strictEqual(
      configuration?.mappings[1].value.endsWith(
        "/demo-workspace/project-one/baseurl-one"
      ),
      true
    );

    assert.strictEqual(
      newConfiguration?.mappings[1].value.endsWith(
        "/demo-workspace/project-one/baseurl-bla"
      ),
      true
    );
  });
});

function assertEndsWith(s: string, suffix: string, message: string = "") {
  if (s.endsWith(suffix)) {
    return;
  }
  assert.fail(`'${s}' doesn't endWith('${suffix}') ${message}`);
}
