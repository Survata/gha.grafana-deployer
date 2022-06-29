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
    });
});
