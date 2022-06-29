// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';
import { execSync } from 'child_process';

export namespace git {
    /**
     * Diff two dashboards.
     *
     * @param existingDashboardPath - the existing dashboard in grafana.
     * @param repoDashboardPath - the dashboard in the repo.
     *
     * @returns {boolean} - true if the dashboards are different.
     */
    export function diffDashboards(existingDashboardPath: string, repoDashboardPath: string): boolean {
        const command: string = 'git diff --no-index --ignore-all-space "'.concat(
            existingDashboardPath,
            '" "',
            repoDashboardPath,
            '" || true',
        );
        const results: string = execCommand(command);
        return results.length > 0;
    }
}

/**
 * Executes a command.
 *
 * @param {string} command - the command to run.
 *
 * @returns {string} - the command output or 'unknown' if the command throws.
 */
function execCommand(command: string): string {
    try {
        return execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch (ex) {
        return 'unknown';
    }
}
