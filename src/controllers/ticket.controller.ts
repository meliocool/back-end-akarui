import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import TicketModel, { ticketDTO, TypeTicket } from "../models/ticket.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await ticketDTO.validate(req.body);
      const result = await TicketModel.create(req.body);
      response.success(res, result, "Ticket created successfully!");
    } catch (error) {
      response.error(res, error, "Failed to create ticket!");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        limit = 10,
        page = 1,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TypeTicket> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await TicketModel.find(query)
        .populate("events")
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();
      const count = await TicketModel.countDocuments(query);
      response.pagination(
        res,
        result,
        {
          total: count,
          current: page,
          totalPages: Math.ceil(count / limit),
        },
        "All Tickets successfully found!"
      );
    } catch (error) {
      response.error(res, error, "Failed to find all ticket!");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await TicketModel.findById(id);
      if (!result) {
        return response.notFound(res, "Not found!");
      }
      response.success(res, result, "Success finding one ticket!");
    } catch (error) {
      response.error(res, error, "Failed to find one ticket!");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await TicketModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Ticket updated successfully!");
    } catch (error) {
      response.error(res, error, "Failed to update ticket!");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await TicketModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Ticket removed successfully!");
    } catch (error) {
      response.error(res, error, "Failed to remove ticket!");
    }
  },
  async findAllByEvent(req: IReqUser, res: Response) {
    try {
      const { eventId } = req.params;
      if (!isValidObjectId(eventId)) {
        return response.notFound(res, "Tickets Not Found!");
      }
      const result = await TicketModel.find({ events: eventId }).exec();
      response.success(res, result, "Tickets found for this event!");
    } catch (error) {
      response.error(res, error, "Failed to find all ticket by event!");
    }
  },
};
