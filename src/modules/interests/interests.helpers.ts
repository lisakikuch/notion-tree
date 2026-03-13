import type { InterestDetailRow, InterestDto, InterestListItemDto, InterestListRow, InterestTag, InterestTagRow } from '@/modules/interests/interests.types.js';

export function mapTags(tags: InterestTagRow[]): InterestTag[] {
    return tags.map((t) => t.tag);
}

export function mapInterestListItem(interest: InterestListRow): InterestListItemDto {
    return {
        ...interest,
        tags: mapTags(interest.tags),
    };
}

export function mapInterestDetail(interest: InterestDetailRow): InterestDto {
    return {
        ...interest,
        tags: mapTags(interest.tags),
    };
}