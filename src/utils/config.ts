import { workspace, WorkspaceConfiguration } from 'vscode';
import { Mapping } from "./fs-functions";

export interface Config {
    autoSlash: boolean,
    mappings: Mapping[],
    showHiddenFiles: boolean,
    withExtension: boolean
}

export function getConfig(): Config {
    const configuration = workspace.getConfiguration('path-intellisense');

    return {
        autoSlash: configuration['autoSlashAfterDirectory'],
        mappings: getMappings(configuration),
        showHiddenFiles: configuration['showHiddenFiles'],
        withExtension: configuration['extensionOnImport']
    }
}

function getMappings(configuration: WorkspaceConfiguration): Mapping[] {
        const mappings = configuration['mappings'];
        return Object.keys(mappings)
            .map(key => ({ key: key, value: mappings[key]}))
            .filter(mapping => !!workspace.rootPath || mapping.value.indexOf('${workspaceRoot}') === -1)
            .map(mapping => ({ key: mapping.key, value: mapping.value.replace('${workspaceRoot}', workspace.rootPath) }));
}