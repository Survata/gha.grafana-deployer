// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { runDeployment } from './deployment';
import { util } from './util';
import { grafana } from './grafana';
import { git } from './git';

// mock the default function in sync-request so that it doesn't start up
jest.mock('sync-request', () => {
    return {
        default: jest.fn(),
    };
});

describe('test runDeployment()', () => {
    beforeAll(() => {
        // suppress all console.log
        global.console.log = jest.fn();
    });

    test('creates a folder', () => {
        util.getFolders = jest.fn().mockReturnValueOnce(['foo']);
        grafana.getFolderId = jest.fn();
        grafana.createFolder = jest.fn();
        util.getFolderFiles = jest.fn().mockReturnValueOnce([]);

        runDeployment('foo/bar');

        expect(grafana.createFolder).toBeCalled();
    });

    test('creates a dashboard', () => {
        util.getFolders = jest.fn().mockReturnValueOnce(['foo']);
        grafana.getFolderId = jest.fn().mockReturnValueOnce(1);
        grafana.createFolder = jest.fn();
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['bar']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: 'abc' });
        grafana.getDashboard = jest.fn().mockReturnValueOnce(undefined);
        grafana.importDashboard = jest.fn();

        runDeployment('foo/bar');

        expect(grafana.createFolder).not.toBeCalled();
        expect(grafana.importDashboard).toBeCalled();
    });

    test('updates a dashboard', () => {
        util.getFolders = jest.fn().mockReturnValueOnce(['foo']);
        grafana.getFolderId = jest.fn().mockReturnValueOnce(1);
        grafana.createFolder = jest.fn();
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['bar']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: 'abc' });
        grafana.getDashboard = jest.fn().mockReturnValueOnce({ uid: 'abc' });
        util.pathResolve = jest.fn();
        util.rmFile = jest.fn();
        util.writeJsonFile = jest.fn();
        git.diffDashboards = jest.fn().mockReturnValueOnce(true);
        grafana.importDashboard = jest.fn();

        runDeployment('foo/bar');

        expect(grafana.createFolder).not.toBeCalled();
        expect(grafana.importDashboard).toBeCalled();
    });

    test('dashboard is unchanged', () => {
        util.getFolders = jest.fn().mockReturnValueOnce(['foo']);
        grafana.getFolderId = jest.fn().mockReturnValueOnce(1);
        grafana.createFolder = jest.fn();
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['bar']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: 'abc' });
        grafana.getDashboard = jest.fn().mockReturnValueOnce({ uid: 'abc' });
        util.pathResolve = jest.fn();
        util.rmFile = jest.fn();
        util.writeJsonFile = jest.fn();
        git.diffDashboards = jest.fn().mockReturnValueOnce(false);
        grafana.importDashboard = jest.fn();

        runDeployment('foo/bar');

        expect(grafana.createFolder).not.toBeCalled();
        expect(grafana.importDashboard).not.toBeCalled();
    });
});
