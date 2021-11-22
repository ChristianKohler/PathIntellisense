# [2.5.0](https://github.com/ChristianKohler/PathIntellisense/compare/v2.4.2...v2.5.0) (2021-11-22)


### Features

* **ignoreTsConfigBaseUrl:** implemented ([fb323d9](https://github.com/ChristianKohler/PathIntellisense/commit/fb323d94e26d6bb988ef86c5a36082e4fe13fc40)), closes [#161](https://github.com/ChristianKohler/PathIntellisense/issues/161)

## [2.4.2](https://github.com/ChristianKohler/PathIntellisense/compare/v2.4.1...v2.4.2) (2021-11-04)


### Bug Fixes

* **windows:** path parse issue ([285ab92](https://github.com/ChristianKohler/PathIntellisense/commit/285ab92f9ffd45fca3df0d037fdc028f108aa560))
* json test newline error ([465d22d](https://github.com/ChristianKohler/PathIntellisense/commit/465d22d2c99ded93f5a6c15ad7d5454bc9b5b615))
* replace deprecated textedit with inserttext ([9df6e6a](https://github.com/ChristianKohler/PathIntellisense/commit/9df6e6ae5250b11052a5007c0de648e0f09c54d8))

## [2.4.1](https://github.com/ChristianKohler/PathIntellisense/compare/v2.4.0...v2.4.1) (2021-10-29)


### Bug Fixes

* loop not awaiting result ([7cb5b70](https://github.com/ChristianKohler/PathIntellisense/commit/7cb5b70732483378648299eac2f556a223a0a04a))
* make sure that fileinfo has isFile set when called ([115e7f4](https://github.com/ChristianKohler/PathIntellisense/commit/115e7f4e835c6f3b34175ab83e12e2601396e5ea))

# [2.4.0](https://github.com/ChristianKohler/PathIntellisense/compare/v2.3.0...v2.4.0) (2021-07-19)


### Features

* add untrustedWorkspaces support ([cb71dc8](https://github.com/ChristianKohler/PathIntellisense/commit/cb71dc8aa5a2dd009ce4a2c0d8289f5c53c3656c))

# [2.3.0](https://github.com/ChristianKohler/PathIntellisense/compare/v2.2.1...v2.3.0) (2020-09-11)


### Bug Fixes

* duplicate function name ([b5f5238](https://github.com/ChristianKohler/PathIntellisense/commit/b5f523851aefed7ae92ff49bc914e261eb3aea77))


### Features

* **mapping:** add support for workspaceFolder placeholders ([b07960e](https://github.com/ChristianKohler/PathIntellisense/commit/b07960e38d70b94218fda76c2b54689593e1e905))

## [2.2.1](https://github.com/ChristianKohler/PathIntellisense/compare/v2.2.0...v2.2.1) (2020-06-12)


### Bug Fixes

* **bundle:** whitelist dependencies ([16c85ae](https://github.com/ChristianKohler/PathIntellisense/commit/16c85ae20bd953462c89bb844d8b876cdbd3114f))

# [2.2.0](https://github.com/ChristianKohler/PathIntellisense/compare/v2.1.6...v2.2.0) (2020-06-05)


### Features

* **build:** enable continous deploy ([335a253](https://github.com/ChristianKohler/PathIntellisense/commit/335a25384b5bace59354ef6683e5b76ab54e124c))

## [2.1.6](https://github.com/ChristianKohler/PathIntellisense/compare/v2.1.5...v2.1.6) (2020-06-05)

### Bug Fixes

- **build:** make sure changelog is updated ([c4da5e9](https://github.com/ChristianKohler/PathIntellisense/commit/c4da5e923890bb340d41aaa836bf1bc5f91050d0))

## v2.0.0

- [Changed] Refactored provider structure
- [Fixed] Multi root workspace support

## v1.4.2

- [Hotfix] Fixed broken intellisense on windows

## v1.4.1

- [Hotfix] Fresh rebuild

## v1.4.0

- [Feature] Added setting to define how to handle absolute paths Fixes #45, #55

## v1.3.0

- [Feature] Files from "files.exclude" are now ignored as well
- [Feature] Basic ts config support
- [Bug] Fixed #26
- [Bug] Fixed #56
- [Bug] Fixed #59
- Perf. improvements

## v1.2.0

- [Feature] Add Option to automatically add a slash after directory. Thank you @koelpinl #41
- [Bug] Fixed autocompletion for names with dashes. Thank you @kasperekt #36

## v1.1.0

- [Feature] Custom Mappings #19, #5
- [Feature] Setting to enable display of hidden files #12
- [Bug] Fixed #11

## v1.0.2

- [Bug] Fixed #15
- [Bug] Fixed #16

## v1.0.1

- Fixed compatibility with VS Code 1.3

## v1.0.0

- [Feature] Added .. on top of each suggestion, Removed trailing slash
- [Bugs] Various bugs fixed

## v0.2.0

- [Feature] Remove file extension within imports (configurable)

## v0.1.0

- Added slash after folders, group by folder and files, file icon

## v0.0.5

- Fixed windows path issue

## v0.0.3

- Fixed unknown publisher issue

## v0.0.2

- Updated Readme.md

## v0.0.1

- Initial
