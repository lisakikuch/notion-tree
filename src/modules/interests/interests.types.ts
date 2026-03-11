export type InterestTag = {
    id: string;
    name: string;
};

export type InterestTagRow = {
    tag: InterestTag
};

export type InterestListRow = {
  id: string;
  title: string;
  lastAccessedAt: Date;
  tags: InterestTagRow[];
};

export type InterestDetailRow = {
  id: string;
  title: string;
  reflection: string | null;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: InterestTagRow[];
};

export type InterestListItemDto = {
  id: string;
  title: string;
  lastAccessedAt: Date;
  tags: InterestTag[];
};

export type InterestDto = {
  id: string;
  title: string;
  reflection: string | null;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: InterestTag[];
};

export type ListInterestsResult = {
    items: InterestListItemDto[];
    nextCursor: string | null;
};