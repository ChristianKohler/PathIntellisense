import * as assert from "assert";
import { resolve } from "path";
import { Suite as BenchmarkSuite, Suite, Event } from "benchmark";
const { promisify } = require("util");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import {
  subscribeToConfigurationService,
  getConfiguration,
} from "../../configuration/configuration.service";

suite.skip("Performance Test", () => {
  test("config service is faster than direct call", async function () {
    this.timeout(20000);

    await subscribeToConfigurationService();

    const document = await openDocument("demo-workspace/project-one/index.js");

    const result = await runBenchmark(document);

    const currentTarget = (<{ currentTarget: Suite }>result).currentTarget;
    const fastest = (<{ name: string }[]>(
      (<unknown>currentTarget.filter("fastest"))
    ))[0].name;

    assert.equal(fastest, "config service");
  });
});

function runBenchmark(document: vscode.TextDocument) {
  return new Promise(function (resolve, reject) {
    new BenchmarkSuite()
      .add("vs code config", function () {
        vscode.workspace.getConfiguration("path-intellisense", document);
      })
      .add("vs code config without scope", function () {
        vscode.workspace.getConfiguration("path-intellisense");
      })
      .add("config service", function () {
        getConfiguration();
      })
      .on("cycle", function (event: Event) {
        console.log(String(event.target));
      })
      .on("complete", resolve)
      .run({ async: false });
  });
}

async function openDocument(relativeUri: string) {
  const absoluteUrl = getAbsoluteUrl(relativeUri);
  const document = await vscode.workspace.openTextDocument(absoluteUrl);
  await vscode.window.showTextDocument(document);
  return document;
}

function getAbsoluteUrl(relativeUri: string) {
  const rootUri = resolve(__dirname, "../../../src/test/");
  return resolve(rootUri, relativeUri);
}
