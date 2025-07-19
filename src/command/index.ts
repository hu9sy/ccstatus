import process from 'node:process';
import { cli } from 'gunshi';
import { name, version, description } from '../../package.json';
import { serviceCommand } from './service';
import { incidentCommand } from './incident';

const subCommands = new Map();
subCommands.set('service', serviceCommand);
subCommands.set('incident', incidentCommand);

const mainCommand = serviceCommand;

await cli(process.argv.slice(2), mainCommand, {
    name,
    version,
    description,
    subCommands,
    renderHeader: null,
});
