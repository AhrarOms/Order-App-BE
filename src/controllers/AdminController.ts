import { Request, Response, NextFunction } from "express";

import { Role } from "../utility/constants";

import { GenerateSignature, ValidatePassword } from "../utility";
import { User, Counter } from "../models";
import { RequestTicket } from "../models/Request";

export const AdminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user?.role === Role.Admin) {
    const validation = await ValidatePassword(
      password,
      user.password,
      user.salt
    );

    if (validation) {
      const signature = await GenerateSignature({
        _id: user._id,
        role: user.role,
      });

      return res.status(200).json({
        signature,
        email: user.email,
        id: user._id,
        role: user.role,
        firstName: user.firstName,
      });
    }
  }

  return res.status(401).json({ msg: "Invalid Credentials" });
};

// Approve or Reject Request Ticket and Save it on DB

export const ApproveOrRejectRequestTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status } = req.body;
  const ticket = await RequestTicket.findById(req.params.id);

  if (ticket) {
    ticket.status = status;
    await ticket.save();
    return res.status(200).json({ msg: "Request Ticket Updated" });
  }

  return res.status(404).json({ msg: "Request Ticket Not Found" });
};

// populate Counter unitial counter seq is 0 and name is request

export const AddCounter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  const counter = new Counter({
    name: name,
  });
  await counter.save();
  return res.status(200).json({ msg: "Counter Added" });
};
