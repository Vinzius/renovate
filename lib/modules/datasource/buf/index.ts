import { logger } from '../../../logger';
import { ExternalHostError } from '../../../types/errors/external-host-error';
import { cache } from '../../../util/cache/package/decorator';
import { HttpError } from '../../../util/http';
import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
import {
  apiPaths,
  datasource,
  defaultRegistryUrl,
  homepageUrl,
  pageSize,
} from './common';
import type {
  BufGetRepositoryResponse,
  BufListRepositoryTagsResponse,
} from './types';

export class BufDatasource extends Datasource {
  static readonly id = datasource;

  constructor() {
    super(datasource);
  }

  override readonly customRegistrySupport = false;

  override readonly defaultRegistryUrls = [defaultRegistryUrl];

  override readonly caching = true;

  private getRepository(
    registryUrl: string,
    repositoryFullName: string
  ): Promise<BufGetRepositoryResponse> {
    return this.http
      .postJson<BufGetRepositoryResponse>(
        `${registryUrl}${apiPaths.getRepository}`,
        {
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fullName: repositoryFullName }),
        }
      )
      .then((obj) => obj.body);
  }

  private getRepositoryTags(
    registryUrl: string,
    repositoryId: string
  ): Promise<BufListRepositoryTagsResponse> {
    return this.http
      .postJson<BufListRepositoryTagsResponse>(
        `${registryUrl}${apiPaths.listRepositoryTags}`,
        {
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ repositoryId, pageSize, reverse: true }),
        }
      )
      .then((obj) => obj.body);
  }

  @cache({
    namespace: `datasource-${datasource}`,
    key: ({ registryUrl, packageName }: GetReleasesConfig) =>
      // TODO: types (#7154)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `${registryUrl}`,
  })
  async getReleases({
    registryUrl,
    packageName,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    if (!registryUrl) {
      return null;
    }
    const result: ReleaseResult = {
      homepage: homepageUrl,
      releases: [],
    };
    try {
      logger.trace({ registryUrl, packageName }, 'fetching buf repository');
      const repositoryRes = await this.getRepository(registryUrl, packageName);
      logger.trace(
        { registryUrl, repositoryId: repositoryRes.repository.id },
        'fetching buf repository tags'
      );
      const tagsRes = await this.getRepositoryTags(
        registryUrl,
        repositoryRes.repository.id
      );
      result.releases = tagsRes.repositoryTags.map((obj) => ({
        version: obj.commitName,
        releaseTimestamp: obj.createTime,
      }));
    } catch (err) {
      // istanbul ignore else: not testable with nock
      if (err instanceof HttpError) {
        if (err.response?.statusCode !== 404) {
          throw new ExternalHostError(err);
        }
      }
      this.handleGenericErrors(err);
    }

    return result.releases.length ? result : null;
  }
}
