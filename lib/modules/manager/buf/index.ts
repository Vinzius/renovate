import { ProgrammingLanguage } from '../../../constants';
import { BufDatasource } from '../../datasource/buf';
import { id as versioning } from '../../versioning/git';
import { extractPackageFile } from './extract';
import { updateDependency } from './update';

export { extractPackageFile, updateDependency };

export const displayName = 'Buf Modules';
export const url = 'https://buf.build/explore';

export const language = ProgrammingLanguage.Protobuf;

export const defaultConfig = {
  fileMatch: ['(^|/)buf\\.lock$'],
  versioning,
};

export const supportedDatasources = [BufDatasource.id];
