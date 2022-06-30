// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import * as core from '@actions/core';

import { util } from './util';
import { grafana } from './grafana';
import { program } from 'commander';
import { runArgs } from './runArgs';

if (util.isTrue(process.env.GITHUB_ACTIONS)) {
    const args: runArgs = {
        dryRun: util.isFlag(core.getInput('dryRun')),
        sourcePath: core.getInput('sourcePath'),
    };
    grafana.run(args).then();
} else {
    grafana.setupCommand(program);
    program.parse(process.argv);
}
