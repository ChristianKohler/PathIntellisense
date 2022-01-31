import * as vscode from "vscode";
import { resolve } from "path";

export async function openDocument(relativeUri: string) {
  const absoluteUrl = getAbsoluteUrl(relativeUri);
  const document = await vscode.workspace.openTextDocument(absoluteUrl);
  await vscode.window.showTextDocument(document);
  return document;
}

export function getAbsoluteUrl(relativeUri: string) {
  const rootUri = resolve(__dirname, "../../../src/test/");
  return resolve(rootUri, relativeUri);
}

export function getFileUri(relativeUri: string) {
  return vscode.Uri.file(getAbsoluteUrl(relativeUri));
}
