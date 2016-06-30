# Path Intellisense
Visual Studio Code plugin that autocompletes filenames.

## Installation
In the command palette (cmd-shift-p) select Install Extension and choose Path Intellisense.

## Usage
![IDE](http://i.giphy.com/iaHeUiDeTUZuo.gif)

## Ideas
Filesystem api calls are slow. That's why this plugin tries to keep fs access to a minimum. 
I added a few checks before calling the fs api. For more information about this, have a look a the unit tests.  

## Contributing
Something missing? Found a bug? - Create a pull request or an issue.
[Github](https://github.com/ChristianKohler/PathIntellisense)

## Settings
### File extension in import statements
Path Intellisense removes the file extension by default if the statement is a import statement. To enable file extensions set the following setting to true:

```javascript
{
	"path-intellisense.extensionOnImport": true,
}
```

## History
* v1.0.0 - Added .. on top of each suggestion, Removed trailing slash, bugs fixed
* v0.2.0 - Remove file extension within imports (configurable)
* v0.1.0 - Added slash after folders, group by folder and files, file icon
* v0.0.5 - Fixed windows path issue
* v0.0.3 - Fixed unknown publisher issue
* v0.0.2 - Updated Readme.md
* v0.0.1 - Initial 

## License
This software is released under [MIT License](http://www.opensource.org/licenses/mit-license.php)