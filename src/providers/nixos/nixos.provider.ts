import * as vscode from "vscode";
import { PathIntellisenseProvider } from "../provider.interface";
import { getConfiguration } from "../../configuration/configuration.service";
import { Config, Mapping } from "../../configuration/configuration.interface";
import { createContext, Context } from "../../utils/createContext";
import { getChildrenOfPath, getPathOfFolderToLookupFiles } from '../../utils/file-utills';
import { createPathCompletionItem } from '../../utils/createCompletionItem';

export const NixProvider: PathIntellisenseProvider = {
  selector: {
    pattern: '**/*.nix',
    scheme: 'file'
  },
  provider: {
    provideCompletionItems,
  },
  triggerCharacters: ["/"],
};

async function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.CompletionItem[]> {
  const context = createContext(document, position);
  const config = await getConfiguration(document.uri);

  const typedString = getTypedString(context, config);
  return typedString === null
    ? Promise.resolve([])
    : provide(context, config, typedString);
}

/**
 * Returns the currently typed string, prior to the cursor position.
 * Should have the same effect as context.fromString, expect that it doesn't
 * require string quotations to be present, making it compatible with nix files.
 * This is important because in nix, string quoted paths are explicitly forced as absolute,
 * a relative path may not use any quotations, making context.fromString return null.
 * This function will too return null if it decides a path completion is not appropriate
 * at the current cursor position.
 * @param context
 * @param config
 */
function getTypedString(context: Context, config: Config): null | string {
  const { fromString: contextFromString } = context;

  let noQuoteString: undefined | string = undefined;

  if (!contextFromString) {
    const cursorPos = context.importRange.start.character;
    const lineUpToCursor = context.textFullLine.slice(0, cursorPos);
    noQuoteString = lineUpToCursor.match(/\.{0,2}\/[^\"\'\,\s]*$/)?.[0];
  }

  const fromString = noQuoteString ?? contextFromString;

  if (fromString) {
    const startsWithDot = fromString[0] === ".";
    const startsWithSlash = fromString[0] === "/";
    const startsWithMapping = config.mappings.some(({ key }) =>
      fromString.startsWith(key)
    );

    return (
      startsWithDot ||
      startsWithMapping ||
      (startsWithSlash && config.showOnAbsoluteSlash)
    ) ? fromString : null;
  }

  return null;
}

/**
 * Provide Completion Items
 */
async function provide(
  context: Context,
  config: Config,
  directPathString: string
): Promise<vscode.CompletionItem[]> {
  const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);

  const rootPath =
    config.absolutePathTo ||
    (config.absolutePathToWorkspace ? workspace?.uri.fsPath : undefined);

  const path = getPathOfFolderToLookupFiles(
    context.document.uri.fsPath,
    directPathString,
    rootPath,
    config.mappings
  );

  const childrenOfPath = await getChildrenOfPath(
    path,
    config.showHiddenFiles,
    config.filesExclude
  );

  return [
    ...childrenOfPath.map((child) =>
      createPathCompletionItem(child, config, context)
    ),
  ];
}
