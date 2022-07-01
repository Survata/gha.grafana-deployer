// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { runDeployment } from './deployment';
import { util } from './util';
import { grafana } from './grafana';
import { git } from './git';
import { runArgs } from './runArgs';

describe('test runDeployment()', () => {
    const testArgs: runArgs = { dryRun: false, sourcePath: 'foo/bar' };

    beforeAll(() => {
        // suppress all console.log
        global.console.log = jest.fn();
    });

    test('creates a folder', async () => {
        util.getFolders = jest.fn().mockReturnValueOnce(['foo']);
        grafana.getFolderId = jest.fn();
        grafana.createFolder = jest.fn();
        util.getFolderFiles = jest.fn().mockReturnValueOnce([]);

        await runDeployment(testArgs);

        expect(grafana.createFolder).toBeCalled();
    });

    test('creates a dashboard', async () => {
        util.getFolders = jest.fn().mockReturnValueOnce(['foo']);
        grafana.getFolderId = jest.fn().mockReturnValueOnce(1);
        grafana.createFolder = jest.fn();
        util.getFolderFiles = jest.fn().mockReturnValueOnce(['bar']);
        util.readJsonFile = jest.fn().mockReturnValueOnce({ uid: 'abc' });
        grafana.getDashboard = jest.fn().mockReturnValueOnce(undefined);
        grafana.importDashboard = jest.fn();

        await runDeployment(testArgs);

        expect(grafana.createFolder).not.toBeCalled();
        expect(grafana.importDashboard).toBeCalled();
    });

    test('updates a dashboard', async () => {
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

        await runDeployment(testArgs);

        expect(grafana.createFolder).not.toBeCalled();
        expect(grafana.importDashboard).toBeCalled();
    });

    test('dashboard is unchanged', async () => {
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

        await runDeployment(testArgs);

        expect(grafana.createFolder).not.toBeCalled();
        expect(grafana.importDashboard).not.toBeCalled();
    });
});
