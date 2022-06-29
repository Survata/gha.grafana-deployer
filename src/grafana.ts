// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { util } from './util';
import { Command } from 'commander';
import { runDeployment } from './deployment';
import { runChecks } from './check';
import { runArgs } from './runArgs';
import axios, {AxiosResponse} from "axios";

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
            .action((options) => {
                const args: runArgs = {
                    dryRun: util.isTrue(options.dryRun),
                    sourcePath: options.sourcePath,
                };
                run(args);
            });
    }

    /**
     * Runs the Command.
     *
     * @param args
     */
    export function run(args: runArgs): void {
        runChecks(args.sourcePath);
        if (!args.dryRun) {
            runDeployment(args.sourcePath);
        }
        console.log('Run succeeded');
    }

    /**
     * Gets a grafana folder id by name.
     *
     * @param folderName - the folder name.
     */
    export async function getFolderId(folderName: string): Promise<number> {
        const r: AxiosResponse = await get('/api/folders');
        if (r.status !== 200) {
            util.reportAndFail('call to get folders failed', getResponseError(r));
        }

        const folders: any[] = r.data;
        const folder: any = folders.find((p) => {
            return p['title'] === folderName;
        });
        return folder === undefined ? undefined : folder['id'];
    }

    /**
     * Get a grafana dashboard.
     *
     * @param uid - the dashboard's uid.
     */
    export async function getDashboard(uid: string): Promise<any> {
        const r: AxiosResponse = await get('/api/dashboards/uid/'.concat(uid));
        if (r.status !== 200) {
            if (r.status === 404) {
                return undefined;
            }
            util.reportAndFail('call to get dashboard failed', getResponseError(r));
        }

        return r.data['dashboard'];
    }

    /**
     * Create a grafana folder.
     *
     * @param folderName - the folder name.
     */
    export function createFolder(folderName: string): number {
        const res: AxiosResponse = post('/api/folders', { title: folderName });
        if (res.status !== 200) {
            util.reportAndFail('create folder failed', getResponseError(res));
        }

        const folder: any = JSON.parse(res.data);
        return folder['id'];
    }

    /**
     * Import a dashboard into grafana.
     *
     * @param dashboardContent - dashboard content, in JSON.
     * @param folderId - the folder id that holds the dashboard.
     */
    export function importDashboard(dashboardContent: any, folderId: number): void {
        const res: AxiosResponse = post('/api/dashboards/import', {
            dashboard: dashboardContent,
            overwrite: true,
            folderId: folderId,
        });
        if (res.status !== 200) {
            util.reportAndFail('import dashboard failed', getResponseError(res));
        }
    }
}

/**
 * Performs an HTTP GET.
 *
 * @param path - the path.
 */
async function get(path: string): Promise<AxiosResponse> {
    return await axios.get('http://'.concat(util.getGrafanaHost(), path), {
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
// @ts-ignore
function post(path: string, data: any): AxiosResponse {
    axios.post('http://'.concat(util.getGrafanaHost(), path), data, {
        headers: {
            Accept: 'application/json',
            Authorization: getAuthorization(),
            'Content-Type': 'application/json',
        }
    }).then(r => {
        return r
    })
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
