import { subscribeToTsConfigChanges } from "../../configuration/tsconfig.service";
import { delay } from "../utils/delay";
import { openDocument } from "../utils/open-document";
import * as vscode from "vscode";
import { setConfig, setDefaults } from "../utils/set-config";
import * as assert from "assert";

suite("AbsolutePathTo", () => {
  test("asbolutePathTo and showOnAbsoluteSlash", async () => {
    const DELAY = () => delay(1000);
    const P_PROJ = "project-three-absolute-changes";
    await setDefaults();
    await subscribeToTsConfigChanges();

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
      await openDocument(`demo-workspace/${P_PROJ}/index.js`);

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
