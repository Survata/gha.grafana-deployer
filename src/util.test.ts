// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import { util } from './util';

describe('test isTrue()', () => {
    test('when false', () => {
        expect(util.isTrue(undefined)).toBe(false);
        expect(util.isTrue('false')).toBe(false);
        expect(util.isTrue('0')).toBe(false);
    });
    test('when true', () => {
        expect(util.isTrue('true')).toBe(true);
        expect(util.isTrue('1')).toBe(true);
        expect(util.isTrue(true)).toBe(true);
    });
});

describe('test getFolders()', () => {
    test('when found', async () => {
        const folders: string[] = await util.getFolders('.');
        expect(folders.length).toEqual(6);
    });
    test('when not found', async () => {
        const folders: string[] = await util.getFolders('./src');
        expect(folders.length).toEqual(0);
    });
});

describe('test getFolderFiles()', () => {
    test('when found', async () => {
        const folders: string[] = await util.getFolderFiles('.', 'src');
        expect(folders.length).toEqual(10);
    });
});
