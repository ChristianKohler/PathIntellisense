// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages } from "vscode";
import { providers } from "./providers";
import { subscribeToConfigurationService } from "./configuration/configuration.service";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  /**
   * Subscribe to the configuration service
   */
  subscribeToConfigurationService().then(configurationServiceSubscription => {
    context.subscriptions.push(...configurationServiceSubscription);
  });

  /**
   * Register Providers
   * Add new providers in src/providers/
   * */
  providers.forEach(provider => {
    const disposable = languages.registerCompletionItemProvider(
      provider.selector,
      provider.provider,
      ...(provider.triggerCharacters || [])
    );

    context.subscriptions.push(disposable);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
