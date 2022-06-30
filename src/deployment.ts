// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { git } from './git';
import { grafana } from './grafana';
import { util } from './util';

/**
 * Runs a deployment to a given grafana host.
 *
 * @param sourcePath - the deployment source path.
 */
export async function runDeployment(sourcePath: string) {
    console.log('Running deployment against', util.getGrafanaHost(), '...');

    // loop through the folders and deploy them
    const folders: string[] = await util.getFolders(sourcePath);
    folders.forEach((folder) => {
        deployFolder(sourcePath, folder);
    });
}

/**
 * Deploys a folder to grafana.
 *
 * @param sourcePath - the deployment source path.
 * @param folder - the folder to deploy.
 */
async function deployFolder(sourcePath: string, folder: string) {
    console.log('Deploying folder', folder);
    let folderId: Number = await grafana.getFolderId(folder);

    // deploy the folder, create it if it doesn't exist
    if (folderId === undefined) {
        console.log('Creating folder in grafana');
        folderId = grafana.createFolder(folder);
    } else {
        console.log('Folder exists in grafana');
    }

    // loop through and deploy the dashboards in this folder
    const folders: string[] = await util.getFolderFiles(sourcePath, folder);
    folders.forEach((file) => {
        deployDashboard(sourcePath, folder, folderId.valueOf(), file);
    });
}

/**
 * Deploys a dashboard to grafana.
 *
 * @param sourcePath - the deployment source path.
 * @param folder - the folder the contains the dashboard.
 * @param folderId - the grafana folder id.
 * @param file - the dashboard file to deploy.
 */
async function deployDashboard(sourcePath: string, folder: string, folderId: number, file: string) {
    console.log('Deploying dashboard', file);
    const key: string = folder.concat('/', file);

    // load the dashboard file and get it's uid
    const dashboardPath: string = util.pathResolve(sourcePath, key);
    const dashboardJson = await util.readJsonFile(dashboardPath);
    const uid: string = dashboardJson['uid'];

    // get the dashboard that is in grafana
    const grafanaDashboard: any = await grafana.getDashboard(uid);

    // deploy the dashboard, create it if it doesn't exist or update it if it's changed
    if (grafanaDashboard === undefined) {
        console.log('Creating dashboard in grafana');
        grafana.importDashboard(dashboardJson, folderId);
    } else {
        // get the dashboard in grafana
        const workPath: string = util.pathResolve(sourcePath, folder, uid.concat('.json'));
        await util.rmFile(workPath); // just to be safe, delete the local copy of the grafana dashboard
        delete grafanaDashboard['id']; // remove the id as it may vary between grafana hosts
        delete grafanaDashboard['version']; // remove the version as it may vary between grafana hosts
        await util.writeJsonFile(workPath, grafanaDashboard); // write the grafana dashboard to a local file for diffing

        // diff the repo dashboard against the grafana dashboard
        const hasDashboardChanged: boolean = git.diffDashboards(workPath, dashboardPath);
        if (hasDashboardChanged) {
            console.log('Updating dashboard in grafana');
            grafana.importDashboard(dashboardJson, folderId);
        } else {
            console.log('Dashboard is unchanged');
        }
        await util.rmFile(workPath); // we don't need it anymore
    }
}
