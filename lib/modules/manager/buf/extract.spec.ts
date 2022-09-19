import { Fixtures } from '../../../../test/fixtures';
import { extractPackageFile } from '.';

const buflock1 = Fixtures.get('buf.1.lock');

describe('modules/manager/buf/extract', () => {
  describe('extractPackageFile()', () => {
    it('returns null for empty', () => {
      expect(extractPackageFile('nothing here')).toBeNull();
    });

    it('parses proper input', () => {
      expect(extractPackageFile(buflock1)).toMatchObject({
        packageFileVersion: 'v1',
        deps: [
          {
            depName: 'googleapis/googleapis',
            currentValue: '62f35d8aed1149c291d606d958a7ce32',
            datasource: 'buf',
          },
          {
            depName: 'opentelemetry/opentelemetry',
            currentValue: '038316eb65414db8bb0cd88c47a4ee0f',
            datasource: 'buf',
          },
        ],
      });
    });
  });
});
