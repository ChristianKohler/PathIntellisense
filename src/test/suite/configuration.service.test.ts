import * as assert from "assert";
import { beforeEach, afterEach } from "mocha";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { getConfiguration } from "../../configuration/configuration.service";
import { subscribeToTsConfigChanges } from "../../configuration/tsconfig.service";
import { delay } from "../utils/delay";
import { getAbsoluteUrl, openDocument } from "../utils/open-document";

async function setConfig(key: string, value: any) {
  const cfg = vscode.workspace.getConfiguration();
  await cfg.update(
    `path-intellisense.${key}`,
    value,
    vscode.ConfigurationTarget.Workspace
  );
}

function assertEndsWith(s: string, suffix: string, message: string = "") {
  if (s.endsWith(suffix)) {
    return;
  }
  assert.fail(`'${s}' doesn't endWith('${suffix}') ${message}`);
}

suite("Configuration Service", () => {
  beforeEach(async () => {
    await setConfig("autoSlashAfterDirectory", undefined);
    await setConfig("autoTriggerNextSuggestion", undefined);
    await setConfig("showHiddenFiles", undefined);
    await setConfig("extensionOnImport", undefined);
    await setConfig("absolutePathToWorkspace", undefined);
    await setConfig("absolutePathTo", undefined);
    await setConfig("showOnAbsoluteSlash", undefined);
    await setConfig("exclude", undefined);
    await setConfig("mappings", undefined);
    await setConfig("ignoreTsConfigBaseUrl", undefined);
  });

  afterEach(async () => {
    await setConfig("autoSlashAfterDirectory", undefined);
    await setConfig("autoTriggerNextSuggestion", undefined);
    await setConfig("showHiddenFiles", undefined);
    await setConfig("extensionOnImport", undefined);
    await setConfig("absolutePathToWorkspace", undefined);
    await setConfig("absolutePathTo", undefined);
    await setConfig("showOnAbsoluteSlash", undefined);
    await setConfig("exclude", undefined);
    await setConfig("mappings", undefined);
    await setConfig("ignoreTsConfigBaseUrl", undefined);
  });

  test("has different configuration for the workspaceFolders", async () => {
    await subscribeToTsConfigChanges();

    await setConfig("absolutePathToWorkspace", true);
    await setConfig("extensionOnImport", true);
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

  test("does not use tsconfig is diabled", async () => {
    await subscribeToTsConfigChanges();

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

    const deferredTests: [any, string[]][] = [
      [
        assertEndsWith,
        [
          configuration?.mappings[1].value,
          "/demo-workspace/project-one/baseurl-one",
        ],
      ],
      [
        assertEndsWith,
        [
          newConfiguration?.mappings[1].value,
          "/demo-workspace/project-one/baseurl-bla",
        ],
      ],
    ];

    // after(async() => {}) doesn't seem to be allowed/work inside a test, so we
    //  clean up first, then call the deferred tests afterwards

    // Clean up
    await vscode.window.showTextDocument(document);
    await vscode.window.activeTextEditor?.edit((editbuilder) => {
      editbuilder.replace(new vscode.Range(2, 24, 2, 27), "one");
    });
    await document.save();

    for (let [assertFunc, args] of deferredTests) {
      assertFunc(...args);
    }
  });

  test("asbolutePathTo and showOnAbsoluteSlash", async () => {
    const DELAY = () => delay(500);
    const P_PROJ = "project-three-absolute-changes";
    subscribeToTsConfigChanges();

    const subTestResults: string[][] = [];

    const subTest = async ({
      testName,
      config,
      numSuggestions,
      expectedText,
      afterSlash,
    }: {
      testName: string;
      config: any;
      numSuggestions: number;
      expectedText: string;
      afterSlash?: string;
    }) => {
      // Read existing configuration
      const document = await openDocument(`demo-workspace/${P_PROJ}/index.js`);
      const configuration = await getConfiguration(document.uri);

      Promise.all(Object.entries(config).map(([k, v]) => setConfig(k, v)));

      const editor: vscode.TextEditor = vscode.window.activeTextEditor!;

      const docInsert = (where: any, what: string) => {
        return editor.edit((editBuilder) => {
          editBuilder.insert(where, what);
        });
      };

      const docDelete = (where: any) => {
        return editor.edit((editBuilder) => {
          editBuilder.delete(where);
        });
      };

      const EVERYTHING = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 100)
      );

      let jobSteps = docInsert(
        editor.selection.active,
        "import {foo} from '/"
      ).then(DELAY);

      if (afterSlash) {
        jobSteps = jobSteps
          .then(() => docInsert(editor.selection.active, afterSlash))
          .then(DELAY);
      }

      for (let i = 0; i < numSuggestions; i++) {
        jobSteps = jobSteps
          .then(() =>
            vscode.commands.executeCommand("editor.action.triggerSuggest")
          )
          .then(DELAY)
          .then(() =>
            vscode.commands.executeCommand("acceptSelectedSuggestion")
          )
          .then(DELAY);

        if (config.autoSlashAfterDirectory !== true) {
          jobSteps = jobSteps
            .then(() => docInsert(editor.selection.active, "/"))
            .then(DELAY);
        }
      }

      jobSteps = jobSteps
        .then(() => {
          const text = editor.document.getText();
          subTestResults.push([testName, text, expectedText]);
        })
        .then(DELAY)
        .then(() => docDelete(EVERYTHING))
        .then(DELAY);

      await jobSteps;
    };

    const configBase = {
      absolutePathToWorkspace: true,
      absolutePathTo: "${workspaceFolder}/myfolder/",
      showOnAbsoluteSlash: true,
      autoSlashAfterDirectory: true,
    };

    let subTests = [
      // Basic test
      {
        testName: "basic",
        config: configBase,
        numSuggestions: 2,
        expectedText: "import {foo} from '/mysubfolder/fileInSubfolder",
      },
      // Disable auto-slash
      {
        testName: "disable autoslash",
        config: { ...configBase, autoSlashAfterDirectory: false },
        numSuggestions: 2,
        // Note: Even though 'fileInSubfolder is a file (.js), a trailing slash
        //  is expected because of the test rig, not the extension
        expectedText: "import {foo} from '/mysubfolder/fileInSubfolder/",
      },
      // Change absolutePathTo to just workspaceFolder (mimic absolutePathToWorkspace=true)
      {
        testName: "mimic absolutePathToWorkspace",
        config: { ...configBase, absolutePathTo: "${workspaceFolder}" },
        numSuggestions: 2,
        expectedText: "import {foo} from '/myfolder/mysubfolder/",
      },
      // Use workspaceFolder + .. parent path
      {
        testName: "workspace parent",
        config: { ...configBase, absolutePathTo: "${workspaceFolder}/.." },
        numSuggestions: 3,
        // Note: This is a little fragile, as it depends on the folder structure
        //  outside the workspace folder.  If this fails, consider increasing
        //  the delay and ensuring it still works (and just picks another path)
        expectedText: "import {foo} from '/project-one/myfolder/mysubfolder/",
      },
      // Ensure that (odd) mappings that start with '/' still work
      {
        testName: "mappings",
        config: {
          ...configBase,
          mappings: { "/o": "${workspaceFolder}/otherfolder" },
        },
        numSuggestions: 2,
        // Note: This is a little fragile, as it depends on the folder structure
        //  outside the workspace folder.  If this fails, consider increasing
        //  the delay and ensuring it still works (and just picks another path)
        afterSlash: "o/",
        expectedText: "import {foo} from '/o/othersub/otherfile",
      },
    ];

    for (let testDef of subTests) {
      await subTest(testDef);
    }

    for (let [testName, text, expectedText] of subTestResults) {
      assert.strictEqual(text, expectedText, testName);
    }
  }).timeout(60_000);
});
