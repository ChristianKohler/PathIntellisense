import { workspace, WorkspaceConfiguration } from 'vscode';
import { Mapping } from "./fs-functions";
import { readFileSync } from "fs";
import * as JSON from 'json5';

export interface Config {
    autoSlash: boolean,
    mappings: Mapping[],
    showHiddenFiles: boolean,
    withExtension: boolean,
    absolutePathToWorkspace: boolean,
    filesExclude: {}[]
}

export function getConfig(tsconfig?): Config {
    const configuration = workspace.getConfiguration('path-intellisense');

    return {
        autoSlash: configuration['autoSlashAfterDirectory'],
        mappings: [...getMappings(configuration), ...createMappingsFromTsConfig(tsconfig)],
        showHiddenFiles: configuration['showHiddenFiles'],
        withExtension: configuration['extensionOnImport'],
        absolutePathToWorkspace: configuration['absolutePathToWorkspace'],
        filesExclude: workspace.getConfiguration('files')['exclude']
    }
}

export function getTsConfig() {
    return workspace.findFiles('tsconfig.json', '**/node_modules/**').then(files => {
        if (files && files[0]) {
            return JSON.parse(readFileSync(files[0].fsPath).toString());
        } else {
            return {};
        }
    });
}

function createMappingsFromTsConfig(tsconfig): Mapping[] {
    const mappings: Mapping[] = [];

    if (tsconfig && tsconfig.compilerOptions) {
        const { baseUrl, paths } = tsconfig.compilerOptions;

        if (baseUrl) {
            mappings.push({ key: baseUrl, value: `${workspace.rootPath}/${baseUrl}` })
        }

        // Todo: paths property
    }

    return mappings;
}

function getMappings(configuration: WorkspaceConfiguration): Mapping[] {
        const mappings = configuration['mappings'];
        return Object.keys(mappings)
            .map(key => ({ key: key, value: mappings[key]}))
            .filter(mapping => !!workspace.rootPath || mapping.value.indexOf('${workspaceRoot}') === -1)
            .map(mapping => ({ key: mapping.key, value: mapping.value.replace('${workspaceRoot}', workspace.rootPath) }));
}
