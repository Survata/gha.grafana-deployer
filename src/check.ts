// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { util } from './util';

/**
 * Runs all checks to ensure that we're able to perform a deployment.
 *
 * @param sourcePath - the deployment source path.
 */
export function runChecks(sourcePath: string): void {
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
    if (!util.pathExists(sourcePath)) {
        util.reportAndFail('source path must exist', sourcePath);
    }

    // check all dashboards in the repo
    checkDashboardsInRepo(sourcePath);

    console.log('All checks passed\n');
}

/**
 * Check that the dashboards defined in the repo are valid.
 *
 * @param sourcePath - the deployment source path.
 */
function checkDashboardsInRepo(sourcePath: string) {
    let folderCount: number = 0;
    let foldersWithoutFilesCount: number = 0;
    let failureCount: number = 0;

    util.getFolders(sourcePath).forEach((folder) => {
        console.log('Checking folder', folder);
        folderCount++;
        let fileCount: number = 0;
        util.getFolderFiles(sourcePath, folder).forEach((file) => {
            console.log('Checking dashboard', file);
            fileCount++;
            const dashboardPath: string = util.pathResolve(sourcePath, folder, file);
            const dashboardJson = util.readJsonFile(dashboardPath);
            if (dashboardJson['uid'] === undefined) {
                console.log('uid must exist');
                failureCount++;
            }
            if (dashboardJson['id'] !== undefined) {
                console.log('id must not exist');
                failureCount++;
            }
            if (dashboardJson['version'] !== undefined) {
                console.log('version must not exist');
                failureCount++;
            }
        });
        if (fileCount === 0) {
            foldersWithoutFilesCount++;
        }
    });

    if (folderCount === 0) {
        util.reportAndFail('source path contains no folders');
    }

    if (foldersWithoutFilesCount > 0) {
        util.reportAndFail('source path folder contains no files');
    }

    if (failureCount > 0) {
        util.reportAndFail('dashboards found in the repo that are not valid for deployment');
    }
}
