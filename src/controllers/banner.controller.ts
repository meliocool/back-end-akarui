import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import BannerModel, { bannerDTO, TypeBanner } from "../models/banner.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await bannerDTO.validate(req.body);
      const result = await BannerModel.create(req.body);
      response.success(res, result, "Banner created successfully!");
    } catch (error) {
      response.error(res, error, "Failed to create banner!");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        limit = 10,
        page = 1,
        search,
      } = req.query as unknown as IPaginationQuery;
      const query: FilterQuery<TypeBanner> = {};
      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }
      const result = await BannerModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();
      const count = await BannerModel.countDocuments(query);
      response.pagination(
        res,
        result,
        {
          total: count,
          current: page,
          totalPages: Math.ceil(count / limit),
        },
        "All Banners successfully found!"
      );
    } catch (error) {
      response.error(res, error, "Failed to find all banners!");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await BannerModel.findById(id);
      if (!result) {
        return response.notFound(res, "Not found!");
      }
      response.success(res, result, "Success finding one banner!");
    } catch (error) {
      response.error(res, error, "Failed to find one banner!");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await BannerModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Banner updated successfully!");
    } catch (error) {
      response.error(res, error, "Failed to update a banner!");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "Not found!");
      }
      const result = await BannerModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, null, "Banner removed successfully!");
    } catch (error) {
      response.error(res, error, "Failed to remove a banner!");
    }
  },
};
