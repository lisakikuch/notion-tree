import type { RequestHandler } from "express";
import * as interestService from "@/modules/interests/interests.service.js"
import type {
    ListInterestsQuery,
    CreateInterestBody,
    PatchInterestBody,
    InterestIdParams
} from "@/modules/interests/interests.schemas.js";

export const listInterests: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const query = req.validated?.query as ListInterestsQuery;

    const interests = await interestService.listInterests(userId, query);
    return res.status(200).json(interests);
};

export const getInterestById: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const { id } = req.validated?.params as InterestIdParams;

    const interest = await interestService.getInterestById(userId, id);
    return res.status(200).json(interest);
};

export const createInterest: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const body = req.validated?.body as CreateInterestBody;

    const interest = await interestService.createInterest(userId, body);
    return res.status(201).json(interest);
};

export const patchInterest: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const { id } = req.validated?.params as InterestIdParams;
    const body = req.validated?.body as PatchInterestBody;

    const interest = await interestService.patchInterest(userId, id, body);
    return res.status(200).json(interest);
};

export const deleteInterest: RequestHandler = async (req, res) => {
    const userId = req.user!.sub;
    const { id } = req.validated?.params as InterestIdParams;

    await interestService.deleteInterest(userId, id);
    return res.status(204).send();
};