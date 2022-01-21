export interface Config {
  autoSlash: boolean;
  autoTrigger: boolean;
  mappings: Mapping[];
  showHiddenFiles: boolean;
  withExtension: boolean;
  absolutePathToWorkspace: boolean;
  absolutePathTo: string | null;
  showOnAbsoluteSlash: boolean;
  filesExclude: { [key: string]: string };
}

export interface Mapping {
  key: string;
  value: string;
}
