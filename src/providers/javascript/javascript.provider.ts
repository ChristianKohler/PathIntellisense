import * as vscode from "vscode";
import { PathIntellisenseProvider } from "../provider.interface";
import { getConfiguration } from "../../configuration/configuration.service";
import { Config, Mapping } from "../../configuration/configuration.interface";
import { createContext, Context } from "./createContext";

import { createPathCompletionItem } from "./createCompletionItem";
import {
  getPathOfFolderToLookupFiles,
  getChildrenOfPath,
} from "../../utils/file-utills";

export const JavaScriptProvider: PathIntellisenseProvider = {
  selector: {
    language: "javascript",
    scheme: "file",
  },
  provider: {
    provideCompletionItems,
  },
  triggerCharacters: ["/", '"', "'"],
};

async function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.CompletionItem[]> {
  const context = createContext(document, position);
  const config = await getConfiguration(document.uri);

  return shouldProvide(context, config)
    ? provide(context, config)
    : Promise.resolve([]);
}

/**
 * Checks if we should provide any CompletionItems
 * @param context
 * @param config
 */
function shouldProvide(context: Context, config: Config): boolean {
  const { fromString, isImport } = context;

  if (!fromString || fromString.length === 0) {
    return false;
  }

  if (!isImport) {
    return true;
  }

  const startsWithDot = fromString[0] === ".";
  const startsWithSlash = fromString[0] === "/";
  const startsWithMapping = config.mappings.some(({ key }) =>
    fromString.startsWith(key)
  );

  return isImport && (
    startsWithDot
    || startsWithMapping
    || (startsWithSlash && config.showOnAbsoluteSlash)
  );
}

/**
 * Provide Completion Items
 */
async function provide(
  context: Context,
  config: Config
): Promise<vscode.CompletionItem[]> {
  const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);


  const rootPath = config.absolutePathTo||(config.absolutePathToWorkspace
    ? workspace?.uri.fsPath
    : undefined);

  const path = getPathOfFolderToLookupFiles(
    context.document.uri.fsPath,
    context.fromString,
    rootPath,
    config.mappings
  );

  const childrenOfPath = await getChildrenOfPath(path, config);

  return [
    ...childrenOfPath.map((child) =>
      createPathCompletionItem(child, config, context)
    ),
  ];
}
