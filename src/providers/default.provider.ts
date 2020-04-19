import { PathIntellisenseProvider } from "./provider.interface";
import { JavaScriptProvider } from "./javascript/javascript.provider";

export const DefaultProvider: PathIntellisenseProvider = {
  selector: "*",
  provider: JavaScriptProvider.provider,
  triggerCharacters: ["/", '"', "'"]
};
