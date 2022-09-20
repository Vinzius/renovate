import { logger } from '../../../logger';
import { ExternalHostError } from '../../../types/errors/external-host-error';
import { cache } from '../../../util/cache/package/decorator';
import { HttpError } from '../../../util/http';
import * as gitVersioning from '../../versioning/git';
import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
import {
  apiPaths,
  datasource,
  defaultRegistryUrl,
  homepageUrl,
  pageSize,
} from './common';
import type { BufListRepositoryCommitsResponse } from './types';

export class BufDatasource extends Datasource {
  static readonly id = datasource;

  constructor() {
    super(datasource);
  }

  override readonly customRegistrySupport = false;

  override readonly defaultRegistryUrls = [defaultRegistryUrl];

  override readonly defaultVersioning = gitVersioning.id;

  override readonly caching = true;

  private getRepositoryCommits(
    registryUrl: string,
    repositoryOwner: string,
    repositoryName: string
  ): Promise<BufListRepositoryCommitsResponse> {
    return this.http
      .postJson<BufListRepositoryCommitsResponse>(
        `${registryUrl}${apiPaths.listRepositoryCommits}`,
        {
          headers: { 'content-type': 'application/json' },
          body: {
            repositoryOwner,
            repositoryName,
            reference: 'main',
            pageSize,
            reverse: true,
          },
        }
      )
      .then((obj) => obj.body);
  }

  @cache({
    namespace: `datasource-${datasource}`,
    key: ({ registryUrl, packageName }: GetReleasesConfig) =>
      // TODO: types (#7154)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `${registryUrl}-${packageName}`,
  })
  async getReleases({
    registryUrl,
    packageName,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    if (!registryUrl) {
      logger.debug('no registry url for buf');
      return null;
    }
    const result: ReleaseResult = {
      homepage: homepageUrl,
      releases: [],
    };
    try {
      logger.trace({ registryUrl, packageName }, 'fetching buf commits');
      const components = packageName.split('/');
      if (components.length !== 2) {
        logger.error(
          { components },
          'splitting packageName created an invalid array length (should be 2)'
        );
        return null;
      }
      const commitsRes = await this.getRepositoryCommits(
        registryUrl,
        components[0],
        components[1]
      );
      result.releases = commitsRes.repositoryCommits.map((obj) => ({
        version: obj.name,
        releaseTimestamp: obj.createTime,
        isStable: true,
      }));
      // console.log(`data: ${JSON.stringify(result.releases)}`)
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
