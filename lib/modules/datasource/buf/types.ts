//
export type BufRepositoryCommit = {
  name: string;
  createTime?: string;
};

//
export type BufListRepositoryCommitsResponse = {
  repositoryCommits: BufRepositoryCommit[];
};
