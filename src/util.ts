// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import fs from 'fs';
import path from 'path';
import * as f from "fs/promises";

export namespace util {
    /**
     * Tests if the provided string is "true".
     *
     * @param val
     */
    export function isTrue(val: string | undefined): boolean {
        if (val == undefined) {
            return false;
        }
        switch (val.toLowerCase()) {
            case 'true':
            case '1':
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
    export function pathExists(path: string): boolean {
        return fs.existsSync(path);
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
    export function getFolders(sourcePath: string): string[] {
        const folders: string[] = [];
        fs.readdirSync(sourcePath).forEach((directory) => {
            const directoryPath: string = path.resolve(sourcePath, directory);
            if (fs.lstatSync(directoryPath).isDirectory()) {
                folders.push(directory);
            }
        });
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
    export function getFolderFiles(sourcePath: string, folder: string): string[] {
        const folderPath: string = path.resolve(sourcePath, folder);
        return fs.readdirSync(folderPath);
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
        await f.rm(path)
    }

    /**
     * Reads a file and parses it into JSON.
     *
     * @param path - the file to read.
     *
     * @returns the JSON object.
     */
    export function readJsonFile(path: string): any {
        const rawData = fs.readFileSync(path);
        return JSON.parse(rawData.toString());
    }

    /**
     * Writes a file after converting the data into a JSON string.
     *
     * @param path - the file to write.
     * @param data - the data to write.
     */
    export function writeJsonFile(path: string, data: any): void {
        const rawData = JSON.stringify(data, null, 2);
        fs.writeFileSync(path, rawData);
    }
}
