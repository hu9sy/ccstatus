type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

export enum ServiceLifetime {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
}

interface ServiceDescriptor<T> {
  factory: ServiceFactory<T>;
  lifetime: ServiceLifetime;
  instance?: ServiceInstance<T>;
}

export class ServiceContainer {
  private services = new Map<string | symbol, ServiceDescriptor<unknown>>();

  register<T>(
    token: string | symbol,
    factory: ServiceFactory<T>,
    lifetime: ServiceLifetime = ServiceLifetime.SINGLETON
  ): void {
    this.services.set(token, {
      factory,
      lifetime,
    });
  }

  resolve<T>(token: string | symbol): T {
    const descriptor = this.services.get(token);
    if (!descriptor) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    if (descriptor.lifetime === ServiceLifetime.SINGLETON) {
      if (!descriptor.instance) {
        descriptor.instance = descriptor.factory();
      }
      return descriptor.instance as T;
    }

    return descriptor.factory() as T;
  }

  isRegistered(token: string | symbol): boolean {
    return this.services.has(token);
  }

  clear(): void {
    this.services.clear();
  }
}

export const container = new ServiceContainer();

// Service tokens
export const SERVICE_TOKENS = {
  STATUS_SERVICE: Symbol('StatusService'),
  LOGGER: Symbol('Logger'),
  CACHE: Symbol('Cache'),
} as const;