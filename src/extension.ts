'use strict';
import { ExtensionContext, languages } from 'vscode';
import { PathIntellisense } from './PathIntellisense';
import { getChildrenOfPath } from './utils/fs-functions';

export function activate(context: ExtensionContext) {
	const provider = new PathIntellisense(getChildrenOfPath);
	const triggers = ['/', '"', '\''];
	context.subscriptions.push(languages.registerCompletionItemProvider('*', provider, ...triggers));
}

export function deactivate() {
}