// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

// ncc wasn't including fs/promises when using import, using require works
const fs = require('fs').promises;
import path from 'path';

export namespace util {
    /**
     * Tests if the provided string is "true".
     *
     * @param val
     */
    export function isTrue(val: string | boolean | undefined): boolean {
        if (val === undefined) {
            return false;
        }
        switch (val) {
            case 'true':
            case '1':
            case true:
                return true;
            default:
                return false;
        }
    }

    /**
     * Report the messages to the console and fail the run.
     *
     * @param messages - the messages to report.
     */
    export function reportAndFail(...messages: string[]): void {
        console.log('Run failed due to', messages);
        process.exit(1);
    }

    /**
     * Checks if a path exists.
     *
     * @param path - the path to check.
     */
    export async function pathExists(path: string) {
        return await fs.access(path);
    }

    /**
     * Resolves multiple path segments into a single path.
     *
     * @param pathSegments
     */
    export function pathResolve(...pathSegments: string[]): string {
        return path.resolve(...pathSegments);
    }

    /**
     * Get the source folders.
     *
     * @param sourcePath - the deployment source path.
     *
     * @returns an array of folder names.
     */
    export async function getFolders(sourcePath: string) {
        const folders: string[] = [];
        const entries: string[] = await fs.readdir(sourcePath);
        const promises = entries.map(async (directory) => {
            const directoryPath: string = path.resolve(sourcePath, directory);
            const entryStats = await fs.lstat(directoryPath);
            if (entryStats.isDirectory()) {
                folders.push(directory);
            }
        });
        await Promise.all(promises);

        return folders;
    }

    /**
     * Get the source files in a source folder.
     *
     * @param sourcePath - the deployment source path.
     * @param folder - a folder within the deployment source.
     *
     * @returns an array of file names.
     */
    export async function getFolderFiles(sourcePath: string, folder: string): Promise<string[]> {
        const folderPath: string = path.resolve(sourcePath, folder);
        return fs.readdir(folderPath);
    }

    /**
     * Get grafana authorization.
     */
    export function getGrafanaAuthorization(): string {
        return process.env.GRAFANA_AUTHORIZATION || '';
    }

    /**
     * Get grafana host.
     */
    export function getGrafanaHost(): string {
        return process.env.GRAFANA_HOST || '';
    }

    /**
     * Removes a file if it exits.
     *
     * @param path - the file to remove.
     */
    export async function rmFile(path: string) {
        await fs.rm(path, { force: true });
    }

    /**
     * Reads a file and parses it into JSON.
     *
     * @param path - the file to read.
     *
     * @returns the JSON object.
     */
    export async function readJsonFile(path: string) {
        const rawData = await fs.readFile(path);
        return JSON.parse(rawData.toString());
    }

    /**
     * Writes a file after converting the data into a JSON string.
     *
     * @param path - the file to write.
     * @param data - the data to write.
     */
    export async function writeJsonFile(path: string, data: any) {
        const rawData = JSON.stringify(data, null, 2);
        await fs.writeFile(path, rawData);
    }
}
