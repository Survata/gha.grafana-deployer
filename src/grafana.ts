// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { util } from './util';
import { Command } from 'commander';
import { runDeployment } from './deployment';
import { runChecks } from './check';
import { runArgs } from './runArgs';
import axios, { AxiosResponse } from 'axios';

export namespace grafana {
    /**
     * Sets up the Command.
     *
     * @param program
     */
    export function setupCommand(program: Command) {
        program
            .command('deploy', { isDefault: true })
            .description('deploys to grafana')
            .option('-d, --dry-run', 'performs a dry run of the deployment')
            .option('-s, --sourcePath <path>', 'specifies the source path to deploy', './monitoring')
            .action(async (options) => {
                const args: runArgs = {
                    dryRun: util.isTrue(options.dryRun),
                    sourcePath: options.sourcePath,
                };
                await run(args);
            });
    }

    /**
     * Runs the Command.
     *
     * @param args
     */
    export async function run(args: runArgs): Promise<void> {
        if (args.dryRun) {
            console.log('Performing dry run');
        }
        await runChecks(args.sourcePath);
        await runDeployment(args);
        console.log('Run succeeded');
    }

    /**
     * Gets a grafana folder id by name.
     *
     * @param folderName - the folder name.
     */
    export async function getFolderId(folderName: string): Promise<number | any> {
        try {
            const r: AxiosResponse = await get('/api/folders');
            const folders: any[] = r.data;
            const folder: any = folders.find((p) => {
                return p['title'] === folderName;
            });
            return folder === undefined ? -1 : folder['id'];
        } catch (e: any) {
            util.reportAndFail('call to get folders failed', getResponseError(e.response));
        }
    }

    /**
     * Get a grafana dashboard.
     *
     * @param uid - the dashboard's uid.
     */
    export async function getDashboard(uid: string): Promise<any> {
        try {
            const r: AxiosResponse = await get('/api/dashboards/uid/'.concat(uid));
            return r.data['dashboard'];
        } catch (e: any) {
            if (e.response.status === 404) {
                return undefined;
            }
            util.reportAndFail('call to get dashboard failed', getResponseError(e.response));
        }
    }

    /**
     * Create a grafana folder.
     *
     * @param folderName - the folder name.
     */
    export async function createFolder(folderName: string): Promise<any> {
        try {
            const res: AxiosResponse = await post('/api/folders', { title: folderName });
            const folder: any = res.data;
            return folder['id'];
        } catch (e: any) {
            util.reportAndFail('create folder failed', getResponseError(e.response));
        }
    }

    /**
     * Import a dashboard into grafana.
     *
     * @param dashboardContent - dashboard content, in JSON.
     * @param folderId - the folder id that holds the dashboard.
     */
    export async function importDashboard(dashboardContent: any, folderId: number): Promise<void> {
        try {
            await post('/api/dashboards/import', {
                dashboard: dashboardContent,
                overwrite: true,
                folderId: folderId,
            });
        } catch (e: any) {
            util.reportAndFail('import dashboard failed', getResponseError(e.response));
        }
    }
}

/**
 * Performs an HTTP GET.
 *
 * @param path - the path.
 */
async function get(path: string): Promise<AxiosResponse> {
    return axios.get('http://'.concat(util.getGrafanaHost(), path), {
        headers: {
            Authorization: getAuthorization(),
        },
    });
}

/**
 * Performs an HTTP POST.
 *
 * @param path - the path.
 * @param data - the data to post.
 */
async function post(path: string, data: any) {
    return axios.post('http://'.concat(util.getGrafanaHost(), path), data, {
        headers: {
            Accept: 'application/json',
            Authorization: getAuthorization(),
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Get basic authorization setting.
 */
function getAuthorization(): string {
    return 'Basic '.concat(Buffer.from(util.getGrafanaAuthorization()).toString('base64'));
}

/**
 * Get response error.
 *
 * @param res - the failing {@link Response}
 */
function getResponseError(res: AxiosResponse): any {
    return { statusCode: String(res.status), body: res.data };
}
