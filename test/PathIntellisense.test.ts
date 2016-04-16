import {
    CompletionItemProvider,
    TextDocument,
    Position,
    CancellationToken,
    CompletionItem,
    CompletionList,
    TextLine
} from 'vscode';
import * as assert from 'assert';
import { PathIntellisense } from '../src/PathIntellisense';
import { getTextWithinString } from '../src/text-parser';

suite("PathIntellisense General Tests", () => {
    test("not in string",               () => assert.equal(false, should('any text', 5)) );
    test("in string",                   () => assert.equal(true, should('any text"/"', 10)) );
});

suite("PathIntellisense Require/Import Tests", () => {
    test("in requirestring",            () => assert.equal(true, should("require('./')", 11)) );
    test("in requirestring - no .",     () => assert.equal(false, should("require('/')", 10)) );
    test("in importstring",             () => assert.equal(true, should("import {} from './'", 18)) );
});

function should(text, position) {
    return new PathIntellisense(() => {}).shouldProvide(text, getTextWithinString(text, position));
}