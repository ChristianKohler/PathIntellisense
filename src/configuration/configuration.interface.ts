export type SortBy = 'none' | 'name' | 'type' | 'modified' | 'size' | 'r-name' | 'r-type' | 'r-modified' | 'r-size';

export interface Config {
  autoSlash: boolean;
  autoTrigger: boolean;
  mappings: Mapping[];
  showHiddenFiles: boolean;
  withExtension: boolean;
  absolutePathToWorkspace: boolean;
  absolutePathTo: string | null;
  showOnAbsoluteSlash: boolean;
  filesExclude: FilesExclude;
  sortBy: SortBy;
  showFoldersBeforeFiles: boolean;
}

export interface FilesExclude {
  [key: string]: string;
}

export interface Mapping {
  key: string;
  value: string;
}
