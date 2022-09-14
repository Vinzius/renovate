import { getPkgReleases } from '..';
import { Fixtures } from '../../../../test/fixtures';
import * as httpMock from '../../../../test/http-mock';
import { EXTERNAL_HOST_ERROR } from '../../../constants/error-messages';
import { apiPaths, datasource, defaultRegistryUrl, pageSize } from './common';

const depName = 'googleapis/googleapis';
const depId = 'c84e502e-8a35-4bdc-aae4-a5dbdf9a685c';
const getRepositoryExpectedBody = `{"fullName":"${depName}"}`;
const listRepositoryTagsExpectedBody = `{"repositoryId":"${depId}","pageSize":${pageSize},"reverse":true}`;

describe('modules/datasource/buf/index', () => {
  describe('getReleases', () => {
    it('throws for error', async () => {
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.getRepository}`,
          (obj) => obj === getRepositoryExpectedBody
        )
        .replyWithError('error');
      await expect(
        getPkgReleases({
          datasource,
          depName,
        })
      ).rejects.toThrow(EXTERNAL_HOST_ERROR);
    });

    it('returns null for 404', async () => {
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.getRepository}`,
          (obj) => obj === getRepositoryExpectedBody
        )
        .reply(404);
      expect(
        await getPkgReleases({
          datasource,
          depName,
        })
      ).toBeNull();
    });

    it('returns null for empty result', async () => {
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.getRepository}`,
          (obj) => obj === getRepositoryExpectedBody
        )
        .reply(200, {});
      expect(
        await getPkgReleases({
          datasource,
          depName,
        })
      ).toBeNull();
    });

    it('returns null for empty 200 OK', async () => {
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.getRepository}`,
          (obj) => obj === getRepositoryExpectedBody
        )
        .reply(200, { versions: [] });
      expect(
        await getPkgReleases({
          datasource,
          depName,
        })
      ).toBeNull();
    });

    it('throws for 5xx', async () => {
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.getRepository}`,
          (obj) => obj === getRepositoryExpectedBody
        )
        .reply(502);
      await expect(
        getPkgReleases({
          datasource,
          depName,
        })
      ).rejects.toThrow(EXTERNAL_HOST_ERROR);
    });

    it('processes real data', async () => {
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.getRepository}`,
          (obj) => obj === getRepositoryExpectedBody
        )
        .reply(200, Fixtures.get('googleapis-repository.json'));
      httpMock
        .scope(defaultRegistryUrl)
        .post(
          `/${apiPaths.listRepositoryTags}`,
          (obj) => obj === listRepositoryTagsExpectedBody
        )
        .reply(200, Fixtures.get('googleapis-tags.json'));
      const res = await getPkgReleases({
        datasource,
        depName,
      });
      expect(res).toMatchSnapshot();
      expect(res?.releases).toHaveLength(2);
    });
  });
});
