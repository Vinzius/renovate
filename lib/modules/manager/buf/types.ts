export type BufRepository = {
  version: string;
  deps: {
    remote: string;
    owner: string;
    repository: string;
    commit: string;
  }[];
};
