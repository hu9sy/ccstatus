import process from 'node:process';
import { cli } from 'gunshi';
import { name, version, description } from '../../package.json';
import { serviceCommand } from './service';
import { incidentCommand } from './incident';
import { container, SERVICE_TOKENS } from '../lib/service-container.ts';
import { StatusService } from '../services/status-service.ts';
import { Cache } from '../lib/cache.ts';
import { logger } from '../lib/logger.ts';

// Initialize services in DI container
container.register(SERVICE_TOKENS.CACHE, () => new Cache({ ttlMs: 300000 })); // 5 minutes
container.register(SERVICE_TOKENS.LOGGER, () => logger);
container.register(SERVICE_TOKENS.STATUS_SERVICE, () => {
  const cache = container.resolve<Cache>(SERVICE_TOKENS.CACHE);
  return new StatusService(cache);
});

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
