import { PathIntellisenseProvider } from "./provider.interface";
import { DefaultProvider } from "./default.provider";
import { JavaScriptProvider } from "./javascript/javascript.provider";

export const providers: PathIntellisenseProvider[] = [
  JavaScriptProvider,
  DefaultProvider,
];
