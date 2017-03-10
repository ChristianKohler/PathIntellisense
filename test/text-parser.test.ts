import * as assert from 'assert';
import { Position } from 'vscode';
import { isImportOrRequire, getTextWithinString, importStringRange } from '../src/utils/text-parser';

suite("Text Parser Tests", () => {

    test("ChecksWhenIsImportStatement", () => {
        assert.equal(true, isImportOrRequire('import { } from'));
        assert.equal(false, isImportOrRequire('var x = 1'));
    });
    
    test("ChecksWhenIsRequireStatement", () => {
        assert.equal(true, isImportOrRequire('var x = require()'));
        assert.equal(false, isImportOrRequire('var x = 1'));
    });
    
    test("GetsTextWithinString", () => {
        assert.equal('hello', getTextWithinString("require('hello')", 14));
        assert.equal('hell', getTextWithinString("require('hello')", 13));
        assert.equal('', getTextWithinString("require('hello')", 15));
    });

    test("importStringRange", () => {
        const requireRange = importStringRange("const test = require('./file')", new Position(0, 28));
        assert.equal(requireRange.end.line, requireRange.start.line, 'Require range line index');
        assert.equal(requireRange.start.character, 24, 'Require range start character');
        assert.equal(requireRange.end.character, 28, 'Require range end character');

        const importRange = importStringRange("import testing from './some-file';", new Position(0, 33));
        assert.equal(importRange.end.line, importRange.start.line, 'Import range line index');
        assert.equal(importRange.start.character, 23, 'Import range start character');
        assert.equal(importRange.end.character, 33, 'Import range end character');
    });

});