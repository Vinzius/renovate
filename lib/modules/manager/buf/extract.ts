import { load } from 'js-yaml';
import { logger } from '../../../logger';
import { BufDatasource } from '../../datasource/buf';
import type { PackageDependency, PackageFile } from '../types';
import type { BufRepository } from './types';

function getDep(obj: BufRepository['deps'][0]): PackageDependency {
  const dep: PackageDependency = {
    depName: `${obj.owner}/${obj.repository}`,
    currentValue: obj.commit,
  };
  if (obj.remote === 'buf.build') {
    dep.datasource = BufDatasource.id;
  } else {
    dep.skipReason = 'unsupported-remote';
  }
  return dep;
}

export function extractPackageFile(content: string): PackageFile | null {
  logger.trace({ content }, 'buf.extractPackageFile()');
  try {
    const payload = load(content, { json: true }) as BufRepository;
    if (typeof payload.version !== 'string' || payload.version !== 'v1') {
      logger.trace({ version: payload.version }, 'Support of v1 only');
      return null;
    }
    return {
      packageFileVersion: payload.version,
      deps: payload.deps.map(getDep),
    };
  } catch (err) {
    logger.trace({ err }, 'Error parsing the yaml');
    return null;
  }
}
