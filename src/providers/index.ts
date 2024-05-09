import { PathIntellisenseProvider } from "./provider.interface";
import { DefaultProvider } from "./default.provider";
import { JavaScriptProvider } from "./javascript/javascript.provider";
import { NixProvider } from './nixos/nixos.provider';

export const providers: PathIntellisenseProvider[] = [
  JavaScriptProvider,
  NixProvider,
  DefaultProvider,
];
