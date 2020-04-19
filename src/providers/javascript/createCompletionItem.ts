import * as vscode from "vscode";
import { Context } from "./createContext";
import { Config } from "../../configuration/configuration.interface";
import { FileInfo } from "../../utils/file-utills";

export function createPathCompletionItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  return fileInfo.isFile
    ? createFileItem(fileInfo, config, context)
    : createFolderItem(fileInfo, config.autoSlash, context.importRange);
}

function createFolderItem(
  fileInfo: FileInfo,
  autoSlash: boolean,
  importRange: vscode.Range
): vscode.CompletionItem {
  var newText = autoSlash ? `${fileInfo.file}/` : `${fileInfo.file}`;

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.Folder,
    textEdit: new vscode.TextEdit(importRange, newText),
    sortText: `a_${fileInfo.file}`,
  };
}

function createFileItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  const textEdit = createCompletionItemTextEdit(fileInfo, config, context);

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.File,
    sortText: `b_${fileInfo.file}`,
    textEdit,
  };
}

function createCompletionItemTextEdit(
  fileInfo: FileInfo,
  config: Config,
  context: Context
) {
  if (config.withExtension || !context.isImport) {
    return undefined;
  }

  const fragments = fileInfo.file.split(".");
  const extension = fragments[fragments.length - 1];

  if (extension !== context.documentExtension) {
    return undefined;
  }

  let index = fileInfo.file.lastIndexOf(".");
  const newText =
    index != -1 ? fileInfo.file.substring(0, index) : fileInfo.file;
  return new vscode.TextEdit(context.importRange, newText);
}
