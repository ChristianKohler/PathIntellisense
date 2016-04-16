import * as assert from 'assert';
import { isImportOrRequire, getTextWithinString } from '../src/text-parser';

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
});