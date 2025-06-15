import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import CategoryModel, { categoryDTO } from "../models/category.model";
import response from "../utils/response";
import { isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await categoryDTO.validate(req.body); // Validate input from user
      const result = await CategoryModel.create(req.body); // Create or INSERT INTO
      response.success(res, result, "Category created successfully!");
    } catch (error) {
      response.error(res, error, "Failed to create category!");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query as unknown as IPaginationQuery;
    try {
      const query = {};
      if (search) {
        Object.assign(query, {
          $or: [
            {
              name: { $regex: search, $options: "i" },
            },
            {
              description: { $regex: search, $options: "i" },
            },
          ],
        });
      }
      const result = await CategoryModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();
      const count = await CategoryModel.countDocuments(query);
      response.pagination(
        res,
        result,
        {
          total: count,
          totalPages: Math.ceil(count / limit),
          current: page,
        },
        `Successfully finding ${search || "All Category"}`
      );
    } catch (error) {
      response.error(res, error, "Failed to find all category!");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params; // from url
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await CategoryModel.findById(id);
      if (!result) {
        return response.notFound(res, "Not found!");
      }
      response.success(res, result, "Success finding category");
    } catch (error) {
      response.error(res, error, "Failed to find one category!");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params; // from url
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await CategoryModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Success updating a category");
    } catch (error) {
      response.error(res, error, "Failed to update category!");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params; // from url
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await CategoryModel.findByIdAndDelete(id, { new: true });
      response.success(res, result, "Success deleting a category");
    } catch (error) {
      response.error(res, error, "Failed to delete category!");
    }
  },
};
