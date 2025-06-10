import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import OrderModel, {
  orderDAO,
  OrderStatus,
  TypeOrder,
  TypeVoucher,
} from "../models/order.model";
import TicketModel from "../models/ticket.model";
import { FilterQuery } from "mongoose";
import { getId } from "../utils/id";
import payment from "../utils/payment";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const payload = {
        ...req.body,
        createdBy: userId,
      } as TypeOrder;

      await orderDAO.validate(payload);

      const ticket = await TicketModel.findById(payload.ticket);

      if (!ticket) {
        return response.notFound(res, "Ticket Not Found!");
      }

      if (ticket.quantity < payload.quantity) {
        return response.error(res, null, "Ticket Sold Out!");
      }

      const total: number = +ticket?.price * +payload.quantity;
      const orderId = getId();

      // Object.assign(payload, {
      //   ...payload,
      //   total,
      // });
      // const result = await OrderModel.create(payload);

      const midtransPayload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: total,
        },
        // customer_details: {
        //   first_name: req.user?.fullName,
        //   email: req.user?.email,
        // }
      };

      const midtransResponse = await payment.createLink(midtransPayload);

      const finalOrderPayload = {
        ...payload,
        orderId,
        total,
        payment: midtransResponse, // Langsung sertakan info dari Midtrans
        createdBy: userId,
      };

      await OrderModel.create(finalOrderPayload);

      return response.success(
        res,
        midtransResponse,
        "Order Successfully Created!"
      );
    } catch (error) {
      console.error("CREATE_ORDER_ERROR:", error);
      response.error(res, error, "Failed to Create an Order!");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeOrder> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({
        search,
      });

      const result = await OrderModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      const count = await OrderModel.countDocuments(query);
      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        "Success Finding All Order!"
      );
    } catch (error) {
      response.error(res, error, "Failed to Find All Orders!");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;
      const result = await OrderModel.findOne({
        orderId,
      });
      if (!result) {
        return response.notFound(res, "Order Not Found!");
      }
      response.success(res, result, "Order Found Successfully!");
    } catch (error) {
      response.error(res, error, "Failed to Find This Order!");
    }
  },
  async findAllByMember(req: IReqUser, res: Response) {},

  async completed(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      const order = await OrderModel.findOne({
        orderId,
        createdBy: userId,
      });

      if (!order) {
        return response.notFound(res, "Order Not Found");
      }

      if (order.status === OrderStatus.COMPLETED) {
        return response.error(res, null, "Order is Already Completed!");
      }

      const vouchers: TypeVoucher[] = Array.from(
        { length: order.quantity },
        () => {
          return {
            isPrint: false,
            voucherId: getId(),
          } as TypeVoucher;
        }
      );
      const result = await OrderModel.findOneAndUpdate(
        {
          orderId,
          createdBy: userId,
        },
        {
          vouchers,
          status: OrderStatus.COMPLETED,
        },
        {
          new: true,
        }
      );
      const ticket = await TicketModel.findById(order.ticket);
      if (!ticket) {
        return response.notFound(res, "Ticket for this Order is Not Found!");
      }
      await TicketModel.updateOne(
        {
          _id: ticket._id,
        },
        {
          quantity: ticket.quantity - order.quantity,
        }
      );
      response.success(res, result, "Order Completed Successfully!");
    } catch (error) {
      response.error(res, error, "Order is not Completed!");
    }
  },
  async pending(req: IReqUser, res: Response) {
    try {
    } catch (error) {
      response.error(res, error, "Order failed to Pending!");
    }
  },
  async cancelled(req: IReqUser, res: Response) {
    try {
    } catch (error) {
      response.error(res, error, "Failed to cancel Order!");
    }
  },
};
