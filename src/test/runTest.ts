import * as path from "path";

import { runTests } from "vscode-test";
import { TestOptions } from "vscode-test/out/runTest";

async function main() {
  try {
    const testOptions: TestOptions = {
      // The folder containing the Extension Manifest package.json
      // Passed to `--extensionDevelopmentPath`
      extensionDevelopmentPath: path.resolve(__dirname, "../../"),
      // The path to test runner
      // Passed to --extensionTestsPath
      extensionTestsPath: path.resolve(__dirname, "./suite/index"),
      launchArgs: [
        `${path.resolve("./src/test/demo-workspace/demo.code-workspace")}`,
        "--disable-extensions"
      ]
    };

    // Download VS Code, unzip it and run the integration test
    await runTests(testOptions);
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
