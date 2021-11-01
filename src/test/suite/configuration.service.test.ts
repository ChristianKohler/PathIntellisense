import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { getConfiguration } from "../../configuration/configuration.service";
import { subscribeToTsConfigChanges } from "../../configuration/tsconfig.service";
import { delay } from "../utils/delay";
import { getAbsoluteUrl, openDocument } from "../utils/open-document";

suite("Configuration Service", () => {
  test("has different configuration for the workspaceFolders", async () => {
    await subscribeToTsConfigChanges();

    const document = await openDocument("demo-workspace/project-one/index.js");
    const configurationProjectOne = await getConfiguration(document.uri);

    const document2 = await openDocument("demo-workspace/project-two/index.js");
    const configurationProjectTwo = await getConfiguration(document2.uri);

    assert.equal(configurationProjectOne?.absolutePathToWorkspace, true);
    assert.equal(configurationProjectOne?.withExtension, true);
    assert.equal(
      configurationProjectOne?.mappings[0].value.endsWith(
        "/demo-workspace/project-one/lib"
      ),
      true
    );
    assert.equal(
      configurationProjectOne?.mappings[1].value.endsWith(
        "/demo-workspace/project-one/baseurl-one"
      ),
      true
    );

    assert.equal(configurationProjectTwo?.absolutePathToWorkspace, true);
    assert.equal(configurationProjectTwo?.withExtension, true);
    assert.equal(
      configurationProjectTwo?.mappings[0].value.endsWith(
        "/demo-workspace/project-two/lib"
      ),
      true
    );
    assert.equal(
      configurationProjectTwo?.mappings[1].value.endsWith(
        "/demo-workspace/project-two/baseurl-two"
      ),
      true
    );
  });

  test("still can load the config with a wrong ts config", async () => {
    assert.doesNotThrow(async () => {
      await subscribeToTsConfigChanges();
    });
  });

  test("has default configuration for non project folder files", async () => {
    await subscribeToTsConfigChanges();
    const document = await openDocument(
      "demo-workspace/file-outside-folders.js"
    );
    const configuration = await getConfiguration(document.uri);

    assert.equal(configuration?.absolutePathToWorkspace, true);
    assert.equal(configuration?.withExtension, true);
    assert.equal(configuration?.mappings.length, 0);
  });

  test("updates configuration on tsconfig change", async () => {
    await subscribeToTsConfigChanges();

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

    assert.equal(
      configuration?.mappings[1].value.endsWith(
        "/demo-workspace/project-one/baseurl-one"
      ),
      true
    );

    assert.equal(
      newConfiguration?.mappings[1].value.endsWith(
        "/demo-workspace/project-one/baseurl-bla"
      ),
      true
    );

    // Clean up
    await vscode.window.showTextDocument(document);
    await vscode.window.activeTextEditor?.edit((editbuilder) => {
      editbuilder.replace(new vscode.Range(2, 24, 2, 27), "one");
    });
    await document.save();
  });
});
