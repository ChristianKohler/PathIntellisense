import { CompletionItemProvider, DocumentSelector } from "vscode";

export interface PathIntellisenseProvider {
  selector: DocumentSelector;
  provider: CompletionItemProvider;
  triggerCharacters?: string[];
}
