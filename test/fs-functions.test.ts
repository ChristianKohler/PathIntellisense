import * as assert from 'assert';
import { getPath, Mapping } from '../src/utils/fs-functions';

suite("GetPath", () => {
    test("resolves folder", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "./sub/";

        const resolved = getPath(fileNameUnix, text);
        
        assert.equal(resolved, "/Users/dummy/src/sub/");
    });

    test("resolves absolute path to root if no rootPath defined", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "/sub/";

        const resolved = getPath(fileNameUnix, text);
        
        assert.equal(resolved, "/sub/");
    });

    test("resolves / to root if no rootPath defined", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "/";

        const resolved = getPath(fileNameUnix, text);
        
        assert.equal(resolved, "/");
    });

    test("resolves absoute path to workspace if rootPath defined", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "/sub/";
        const rootPath = "/Users/dummy";

        const resolved = getPath(fileNameUnix, text, rootPath);
        
        assert.equal(resolved, "/Users/dummy/sub/");
    });

    test("resolves folder up", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "../src/";

        const resolved = getPath(fileNameUnix, text);
        
        assert.equal(resolved, "/Users/dummy/src/");
    });

    test("ignores everything after last slash", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "./myfile";

        const resolved = getPath(fileNameUnix, text);
        
        assert.equal(resolved, "/Users/dummy/src/");
    });

    test("replaces mapping if found", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "~/src/";
        const mappings: Mapping[] = [
            { key: "~", value: "/root/" }
        ];

        const resolved = getPath(fileNameUnix, text, null, mappings);
        
        assert.equal(resolved, "/root/src/");
    });

    test("replaces mapping multiple chars if found", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "awesome/src/sub/";
        const mappings: Mapping[] = [
            { key: "awesome", value: "/root/" }
        ];

        const resolved = getPath(fileNameUnix, text, null, mappings);
        
        assert.equal(resolved, "/root/src/sub/");
    });

    test("ignores mapping if not found", () => {
        const fileNameUnix = "/Users/dummy/src/dummy.ts";
        const text = "./sub/";
        const mappings: Mapping[] = [
            { key: "~", value: "/root/" }
        ];

        const resolved = getPath(fileNameUnix, text, null, mappings);
        
        assert.equal(resolved, "/Users/dummy/src/sub/");
    });
});