import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDAO, TEvent } from "../models/event.model";
import { FilterQuery } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TEvent;
      await eventDAO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "Event Created Successfully!");
    } catch (error) {
      response.error(res, error, "Failed to Create an Event");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
      } = req.query as unknown as IPaginationQuery;
      const query: FilterQuery<TEvent> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }
      const result = await EventModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();
      const count = await EventModel.countDocuments(query);
      response.pagination(
        res,
        result,
        {
          current: page,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        "Success Finding All Event!"
      );
    } catch (error) {
      response.error(res, error, "Failed to Find All an Event");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await EventModel.findById(id);
      if (!result) {
        return response.notFound(res, "Not found!");
      }
      response.success(res, result, "One event Found!");
    } catch (error) {
      response.error(res, error, "Failed to find an event!");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await EventModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Event updated successfully!");
    } catch (error) {
      response.error(res, error, "Failed to Update an Event");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await EventModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Event removed successfully!");
    } catch (error) {
      response.error(res, error, "Failed to Remove an Event");
    }
  },
  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;
      const result = await EventModel.findOne({
        slug,
      });
      response.success(res, result, `Event found! ${slug}`);
    } catch (error) {
      response.error(res, error, "Failed to Find One Event by slug");
    }
  },
};
