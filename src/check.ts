// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { util } from './util';

interface CheckSummary {
    folderCount: number;
    foldersWithoutFilesCount: number;
    failureCount: number;
}

/**
 * Runs all checks to ensure that we're able to perform a deployment.
 *
 * @param sourcePath - the deployment source path.
 */
export async function runChecks(sourcePath: string) {
    console.log('Running checks against', sourcePath, '...');

    // the grafana authorization must be set
    if (util.getGrafanaAuthorization() === '') {
        util.reportAndFail('environment variable must be set', 'GRAFANA_AUTHORIZATION');
    }

    // the grafana host must be set
    if (util.getGrafanaHost() === '') {
        util.reportAndFail('environment variable must be set', 'GRAFANA_HOST');
    }

    // the source path must exist
    const sourcePathExists: boolean = await util.pathExists(sourcePath);
    if (!sourcePathExists) {
        util.reportAndFail('source path must exist', sourcePath);
    }

    // check all dashboards in the repo
    await checkDashboardsInRepo(sourcePath);

    console.log('All checks passed\n');
}

/**
 * Check that the dashboards defined in the repo are valid.
 *
 * @param sourcePath - the deployment source path.
 */
async function checkDashboardsInRepo(sourcePath: string) {
    const summary: CheckSummary = { folderCount: 0, foldersWithoutFilesCount: 0, failureCount: 0 };

    const folders = await util.getFolders(sourcePath);
    const promises = folders.map(async (folder: string) => {
        await checkFolder(summary, sourcePath, folder);
    });
    await Promise.all(promises);

    if (summary.folderCount === 0) {
        util.reportAndFail('source path contains no folders');
    }

    if (summary.foldersWithoutFilesCount > 0) {
        util.reportAndFail('source path folder contains no files');
    }

    if (summary.failureCount > 0) {
        util.reportAndFail('dashboards found in the repo that are not valid for deployment');
    }
}

/**
 * Check the repo folder and files.
 *
 * @param summary
 * @param sourcePath
 * @param folder
 */
async function checkFolder(summary: CheckSummary, sourcePath: string, folder: string) {
    console.log('Checking folder', folder);
    summary.folderCount++;
    let fileCount: number = 0;
    const files: string[] = await util.getFolderFiles(sourcePath, folder);
    const promises = files.map(async (file: string) => {
        fileCount++;
        // await checkFile(summary, sourcePath, folder, file);
        console.log('Checking dashboard', file);
        const dashboardPath: string = util.pathResolve(sourcePath, folder, file);
        const dashboardJson = await util.readJsonFile(dashboardPath);
        if (dashboardJson['uid'] === undefined) {
            console.log('uid must exist');
            summary.failureCount++;
        }
        if (dashboardJson['id'] !== undefined) {
            console.log('id must not exist');
            summary.failureCount++;
        }
        if (dashboardJson['version'] !== undefined) {
            console.log('version must not exist');
            summary.failureCount++;
        }
    });
    await Promise.all(promises);
    if (fileCount === 0) {
        summary.foldersWithoutFilesCount++;
    }
}
