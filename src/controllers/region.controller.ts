import { Request, Response } from "express";
import response from "../utils/response";
import RegionModel from "../models/region.model";

export default {
  async findByCity(req: Request, res: Response) {
    try {
      const { name } = req.query;
      const result = await RegionModel.findByCity(`${name}`);
      response.success(
        res,
        result,
        "Successfully obtained region from city name!"
      );
    } catch (error) {
      response.error(res, error, "Failed to obtain region by city name");
    }
  },
  async getAllProvinces(req: Request, res: Response) {
    try {
      const result = await RegionModel.getAllProvinces();
      response.success(res, result, "All Provinces successfully queried!");
    } catch (error) {
      response.error(res, error, "Failed to query all Provinces");
    }
  },
  async getProvince(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await RegionModel.getProvince(Number(id));
      response.success(res, result, "Province obtained successfully!");
    } catch (error) {
      response.error(res, error, "Failed to get a Province");
    }
  },
  async getRegency(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await RegionModel.getRegency(Number(id));
      response.success(res, result, "Regency obtained successfully!");
    } catch (error) {
      response.error(res, error, "Failed to get a Regency");
    }
  },
  async getDistrict(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await RegionModel.getDistrict(Number(id));
      response.success(res, result, "District obtained succesfully!");
    } catch (error) {
      response.error(res, error, "Failed to get a District");
    }
  },
  async getVillage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await RegionModel.getVillage(Number(id));
      response.success(res, result, "Village obtained succesfully!");
    } catch (error) {
      response.error(res, error, "Failed to get a village");
    }
  },
};
