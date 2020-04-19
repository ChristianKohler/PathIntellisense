import * as vscode from "vscode";

export interface Context {
  textFullLine: string;
  fromString?: string;
  isImport: boolean;
  document: vscode.TextDocument;
  importRange: vscode.Range;
  documentExtension: string | undefined;
}

export function createContext(
  document: vscode.TextDocument,
  position: vscode.Position
): Context {
  const textFullLine = document.getText(document.lineAt(position).range);
  const fromString = getFromString(textFullLine, position.character);
  const isImport = isImportExportOrRequire(textFullLine);
  const importRange = importStringRange(textFullLine, position);
  const documentExtension = extractExtension(document);
  return {
    textFullLine,
    fromString,
    isImport,
    document,
    importRange,
    documentExtension,
  };
}

function getFromString(textFullLine: string, position: number) {
  const textToPosition = textFullLine.substring(0, position);
  const quoatationPosition = Math.max(
    textToPosition.lastIndexOf('"'),
    textToPosition.lastIndexOf("'"),
    textToPosition.lastIndexOf("`")
  );
  return quoatationPosition !== -1
    ? textToPosition.substring(quoatationPosition + 1, textToPosition.length)
    : undefined;
}

function isImportExportOrRequire(textFullLine: string) {
  let isImport = textFullLine.substring(0, 6) === "import";
  let isExport = textFullLine.substring(0, 6) === "export";
  let isRequire = textFullLine.indexOf("require(") !== -1;
  return isImport || isExport || isRequire;
}

function importStringRange(
  line: string,
  position: vscode.Position
): vscode.Range {
  const textToPosition = line.substring(0, position.character);
  const slashPosition = textToPosition.lastIndexOf("/");

  const startPosition = new vscode.Position(position.line, slashPosition + 1);
  const endPosition = position;

  return new vscode.Range(startPosition, endPosition);
}

export function extractExtension(document: vscode.TextDocument) {
  if (document.isUntitled) {
    return undefined;
  }

  const fragments = document.fileName.split(".");
  const extension = fragments[fragments.length - 1];

  if (!extension || extension.length > 3) {
    return undefined;
  }

  return extension;
}
