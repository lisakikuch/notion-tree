export type TagDto = {
  id: string;
  name: string;
};

export type ListTagsResult = {
  data: TagDto[];
  meta: {};
};