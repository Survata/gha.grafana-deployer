// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { runChecks } from './check';
import { util } from './util';

describe('test runChecks()', () => {
    beforeAll(() => {
        // suppress all console.log
        global.console.log = jest.fn();
    });

    test('fails when GRAFANA_AUTHORIZATION is not found', () => {
        util.getGrafanaAuthorization = jest.fn().mockReturnValueOnce('');
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('environment variable must be set GRAFANA_AUTHORIZATION');
    });

    test('fails when GRAFANA_HOST is not found', () => {
        util.getGrafanaAuthorization = jest.fn().mockReturnValueOnce('GRAFANA_AUTHORIZATION');
        util.getGrafanaHost = jest.fn().mockReturnValueOnce('');
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('environment variable must be set GRAFANA_HOST');
    });

    test('fails when source path is not found', () => {
        util.getGrafanaHost = jest.fn().mockReturnValueOnce('GRAFANA_HOST');
        util.pathExists = jest.fn().mockReturnValueOnce(false);
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('source path must exist foo/bar');
    });

    test('fails when source path has no folders', () => {
        util.pathExists = jest.fn().mockReturnValueOnce(true);
        util.getFolders = jest.fn().mockReturnValueOnce([]);
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('source path contains no folders');
    });

    test('fails when source path folder has no files', () => {
        util.pathExists = jest.fn().mockReturnValueOnce(true);
        util.getFolders = jest.fn().mockReturnValueOnce(['etc']);
        util.getFolderFiles = jest.fn().mockReturnValueOnce([]);
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('source path folder contains no files');
    });

    test('fails when dashboard uid is not found', () => {
        util.pathExists = jest.fn().mockReturnValue(true);
        util.getFolders = jest.fn().mockReturnValue(['etc']);
        util.getFolderFiles = jest.fn().mockReturnValue(['xyz']);
        util.readJsonFile = jest.fn().mockReturnValue({});
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('dashboards found in the repo that are not valid for deployment');
    });

    test('fails when dashboard id is found', () => {
        util.pathExists = jest.fn().mockReturnValueOnce(true);
        util.getFolders = jest.fn().mockReturnValueOnce(['etc']);
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['xyz']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: '', id: '' });
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('dashboards found in the repo that are not valid for deployment');
    });

    test('fails when dashboard version is found', () => {
        util.pathExists = jest.fn().mockReturnValueOnce(true);
        util.getFolders = jest.fn().mockReturnValueOnce(['etc']);
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['xyz']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: '', version: '' });
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        expect(() => {
            runChecks('foo/bar');
        }).toThrow('dashboards found in the repo that are not valid for deployment');
    });

    test('succeeds', () => {
        util.pathExists = jest.fn().mockReturnValueOnce(true);
        util.getFolders = jest.fn().mockReturnValueOnce(['etc']);
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['xyz']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: '' });
        util.reportAndFail = jest.fn().mockImplementationOnce((...messages) => {
            throw new Error(messages.join(' '));
        });

        runChecks('foo/bar');
    });
});
