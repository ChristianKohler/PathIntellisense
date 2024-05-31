import * as vscode from "vscode";
import { Context } from "./createContext";
import { Config } from "../configuration/configuration.interface";
import { FileInfo } from "./file-utills";

export function createPathCompletionItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  return fileInfo.isFile
    ? createFileItem(fileInfo, config, context)
    : createFolderItem(
        fileInfo,
        config.autoSlash,
        config.autoTrigger,
        context.importRange
      );
}

function createFolderItem(
  fileInfo: FileInfo,
  autoSlash: boolean,
  autoTrigger: boolean,
  importRange: vscode.Range
): vscode.CompletionItem {
  var newText =
    autoSlash || autoTrigger ? `${fileInfo.file}/` : `${fileInfo.file}`;

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.Folder,
    sortText: `a_${fileInfo.file}`,
    range: importRange,
    insertText: newText,
    command: autoTrigger
      ? {
          title: "Trigger suggest",
          command: "editor.action.triggerSuggest",
        }
      : undefined,
  };
}

function createFileItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  const insertText = createCompletionItemInsertText(fileInfo, config, context);

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.File,
    sortText: `b_${fileInfo.file}`,
    range: context.importRange,
    insertText: insertText,
  };
}

function createCompletionItemInsertText(
  fileInfo: FileInfo,
  config: Config,
  context: Context
) {
  const shouldExcludeDocumentExtension =
    context.isImport &&
    !config.withExtension &&
    fileInfo.documentExtension === context.documentExtension;

  return shouldExcludeDocumentExtension
    ? getFileNameWithoutExtension(fileInfo.file)
    : fileInfo.file;
}

function getFileNameWithoutExtension(fileName: string) {
  let index = fileName.lastIndexOf(".");
  return index !== -1 ? fileName.substring(0, index) : fileName;
}
