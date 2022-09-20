import { Fixtures } from '../../../../test/fixtures';
// import type { UpdateType } from '../../../config/types';
import { updateDependency } from '.';

const bufYaml1 = Fixtures.get('buf.1.lock');

describe('modules/manager/buf/update', () => {
  describe('updateDependency', () => {
    it('replaces existing value', () => {
      const upgrade = {
        depName: 'buf.build/googleapis/googleapis',
        managerData: { lineNumber: 4 },
        newValue: '2df0a828908fb3bf260eda85e12a9fea',
        depType: 'require',
      };
      const res = updateDependency({
        fileContent: bufYaml1,
        upgrade,
      });
      expect(res).not.toEqual(bufYaml1);
      expect(res).toContain(upgrade.newValue);
    });
  });
});
