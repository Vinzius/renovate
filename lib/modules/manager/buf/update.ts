// TODO: types (#7154)
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { logger } from '../../../logger';
import type { UpdateDependencyConfig } from '../types';

export function updateDependency({
  fileContent,
  upgrade,
}: UpdateDependencyConfig): string | null {
  try {
    logger.debug(`buf.updateDependency: ${upgrade.newValue}`);
    return fileContent;
  } catch (err) {
    logger.debug({ err }, 'Error setting new buf.yaml version');
    return fileContent;
  }
}
