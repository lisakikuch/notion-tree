import type { RequestHandler } from "express";
import * as tagService from "@/modules/tags/tags.service.js"
import type {
    CreateTagBody,
    TagParams
} from "@/modules/tags/tags.schemas.js";

export const listTags: RequestHandler = async (req, res) => {

    const userId = req.user!.sub;

    const tags = await tagService.listTags(userId);
    return res.status(200).json(tags);
}

export const createTag: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const body = req.body as unknown as CreateTagBody;

    const tag = await tagService.createTag(userId, body);
    return res.status(201).json(tag);
}

export const deleteTag: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const { id } = req.params as unknown as TagParams;

    await tagService.deleteTag(userId, id);
    return res.status(204).send();
}
