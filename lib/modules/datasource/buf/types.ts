// https://buf.build/bufbuild/buf/docs/main:buf.alpha.registry.v1alpha1#buf.alpha.registry.v1alpha1.Repository
export type BufRepository = {
  id: string;
  name: string;
  createTime?: string;
  updateTime?: string;
};

// https://buf.build/bufbuild/buf/docs/main:buf.alpha.registry.v1alpha1#buf.alpha.registry.v1alpha1.GetRepositoryByFullNameResponse
export type BufGetRepositoryResponse = {
  repository: BufRepository;
  counts: {
    tagsCount: number;
  };
};

// https://buf.build/bufbuild/buf/docs/main:buf.alpha.registry.v1alpha1#buf.alpha.registry.v1alpha1.RepositoryTag
export type BufRepositoryTag = {
  id: string;
  name: string;
  commitName: string;
  author: string;
  createTime?: string;
};

// https://buf.build/bufbuild/buf/docs/main:buf.alpha.registry.v1alpha1#buf.alpha.registry.v1alpha1.RepositoryTagService.ListRepositoryTags
export type BufListRepositoryTagsResponse = {
  repositoryTags: BufRepositoryTag[];
};
