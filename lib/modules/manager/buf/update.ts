// TODO: types (#7154)
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { dump, load } from 'js-yaml';
import { logger } from '../../../logger';
import type { UpdateDependencyConfig } from '../types';
import type { BufRepository } from './types';

export function updateDependency({
  fileContent,
  upgrade,
}: UpdateDependencyConfig): string | null {
  try {
    logger.debug(`buf.updateDependency: ${upgrade.newValue}`);
    if (typeof upgrade.newValue !== 'string' || upgrade.newValue.length === 0) {
      logger.debug({ newValue: upgrade.newValue }, `Invalid new value`);
      return null;
    }
    const payload = load(fileContent, { json: true }) as BufRepository;
    const pos = payload.deps.findIndex(
      (obj) =>
        upgrade.depName === `${obj.remote}/${obj.owner}/${obj.repository}`
    );
    if (pos < 0) {
      logger.debug(
        { depName: upgrade.depName },
        `Could not find dependency in content`
      );
      return null;
    }
    payload.deps[pos].commit = upgrade.newValue;
    return dump(payload);
  } catch (err) {
    logger.debug({ err }, 'Error setting new buf.yaml version');
    return null;
  }
}
