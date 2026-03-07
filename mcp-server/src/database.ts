import { IDatabase } from './db/IDatabase.js';
import { createDbProvider } from './db/dbProviderFactory.js';

let instance: IDatabase;

export function getDatabase(): IDatabase {
  if (!instance) {
    instance = createDbProvider();
  }
  return instance;
}
