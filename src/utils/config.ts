import { workspace, WorkspaceConfiguration, Uri, WorkspaceFolder } from 'vscode';
import { Mapping } from "./fs-functions";
import { readFileSync } from "fs";

export interface Config {
    folder?: WorkspaceFolder,
    autoSlash: boolean,
    mappings: Mapping[],
    showHiddenFiles: boolean,
    withExtension: boolean,
    absolutePathToWorkspace: boolean,
    filesExclude: {}[]
}

export function getConfig(resource: Uri, workspaceConfigs: Object[] = []): Config {
    const configuration = workspace.getConfiguration('path-intellisense', resource);
    const folder = workspace.getWorkspaceFolder(resource);
    const rootPath = folder && folder.uri.fsPath;

    const workspaceMappings: Mapping[] = workspaceConfigs.reduce<Mapping[]>((previous, config) => {
        return previous.concat(createMappingsFromWorkspaceConfig(rootPath, config))
    }, [])

    return {
        folder,
        autoSlash: configuration['autoSlashAfterDirectory'],
        mappings: [...getMappings(rootPath, configuration), ...workspaceMappings],
        showHiddenFiles: configuration['showHiddenFiles'],
        withExtension: configuration['extensionOnImport'],
        absolutePathToWorkspace: configuration['absolutePathToWorkspace'],
        filesExclude: workspace.getConfiguration('files', resource)['exclude']
    }
}

export function getWorkspaceConfigs(): PromiseLike<Object[]> {
    return workspace.findFiles('[tj]sconfig.json', '**/node_modules/**').then(files => {
        if (files && files.length > 0) {
            return files.map(file => JSON.parse(readFileSync(file.fsPath).toString()));
        } else {
            return [];
        }
    });
}

function createMappingsFromWorkspaceConfig(rootPath: string, tsconfig): Mapping[] {
    const mappings: Mapping[] = [];

    if (tsconfig && tsconfig.compilerOptions) {
        const { baseUrl, paths } = tsconfig.compilerOptions;

        if (baseUrl) {
            mappings.push({ key: baseUrl, value: `${rootPath}/${baseUrl}` })
        }

        // Todo: paths property
    }

    return mappings;
}

function getMappings(rootPath: string, configuration: WorkspaceConfiguration): Mapping[] {
    const mappings = configuration['mappings'];
    return Object.keys(mappings)
        .map(key => ({ key: key, value: mappings[key] }))
        .filter(mapping => !!rootPath || mapping.value.indexOf('${workspaceRoot}') === -1)
        .map(mapping => ({ key: mapping.key, value: mapping.value.replace('${workspaceRoot}', rootPath) }));
}