const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Prettier config file has the correct name and is valid JSON', () => {
    const root = path.dirname(__dirname);
    const correctPath = path.join(root, '.prettierrc');
    const typoPath = path.join(root, '.pretierrc');

    assert.ok(fs.existsSync(correctPath), '.prettierrc should exist');
    assert.ok(!fs.existsSync(typoPath), '.pretierrc should not exist');
    const contents = fs.readFileSync(correctPath, 'utf8');
    assert.doesNotThrow(() => JSON.parse(contents), 'config should be valid JSON');
