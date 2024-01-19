import { Request, Response, NextFunction } from "express";

import { User } from "../models";

import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";

import { sendMail } from "../services/MailService";
import { RequestTicket } from "../models/Request";
import { Role, Status } from "../utility/constants";
import { Counter } from "../models/Counter";

const mongoose = require("mongoose");

export const sendEmailFunc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, classId } = req.body;
    await sendMail(email, classId);
    return res.status(200).json({ message: "Email Sent" });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export const UserSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();

  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    session.startTransaction();

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const existingUser = await User.findOne({ email: email }).session(session);

    if (existingUser !== null) {
      return res.status(400).json({ message: "User already exist!" });
    }

    const user = new User({
      email: email,
      password: userPassword,
      role: role,
      salt: salt,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    });

    const result = await user.save({ session });

    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id,
      phone: result.phone,
      role: result.role,
    });
    // Send the result
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      signature,

      email: result.email,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const validation = await ValidatePassword(
      password,
      user.password,
      user.salt
    );

    if (validation) {
      const signature = await GenerateSignature({
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        signature,
        id: user._id,
        firstName: user.firstName,
        role: user.role,
        email: user.email,
      });
    }
  }

  return res.json({ msg: "Message" });
};

// Approve or Reject Request Ticket and Save it on DB

export const ApproveOrRejectRequestTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, comments } = req.body;
  const ticket = await RequestTicket.findById(req.params.id);
  const user = req.user;

  if (ticket && user?.role === Role.Admin) {
    ticket.status = status;
    ticket.comments = comments;
    await ticket.save();
    return res.status(200).json({ msg: "Request Ticket Updated" });
  }

  return res.status(404).json({ msg: "Request Ticket Not Found" });
};

export const UserForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(newPassword, salt);

    if (user) {
      user.password = userPassword;
      user.salt = salt;

      await user.save();

      return res.status(200).json({ msg: "Password Changed Successfully" });
    }

    return res.status(400).json({ msg: "Error while Changing Password" });
  } catch (err) {
    return res.status(500).json({ msg: "Error while Fetching Pdf" });
  }
};

// Add Request

export const AddRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productName, quantity, codeNumber, sellingPrice, status, image } =
      req.body;

    const user = req.user;
    console.log("USer", user.role);
    console.log("USer", Role.Admin);

    // update Counter check if there is counter or create new one

    const counter = await Counter.findOne({ name: "request" });

    if (user?.role === Role.Requester || user?.role === Role.Admin) {
      console.log("Counter------");
      const request = new RequestTicket({
        productName,
        quantity,
        codeNumber,
        sellingPrice,
        status,
        image,
        requester: user._id,
        reqId: "REQ" + counter.seq,
      });

      const result = await request.save();

      // increment Counter by one

      await Counter.findOneAndUpdate({ name: "request" }, { $inc: { seq: 1 } });

      return res.status(201).json(result);
    }

    return res.status(400).json({ msg: "Error while Adding Request" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// edit request

export const EditRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productName, quantity, codeNumber, sellingPrice, status, image } =
      req.body;

    const user = req.user;

    if (user && (user.role === Role.Requester || user.role === Role.Admin)) {
      const request = await RequestTicket.findById(req.params.id);

      if (request) {
        request.productName = productName;
        request.quantity = quantity;
        request.codeNumber = codeNumber;
        request.sellingPrice = sellingPrice;
        request.status = status;
        request.image = image;

        const result = await request.save();
        return res.status(201).json(result);
      }
    }

    return res.status(400).json({ msg: "Error while Editing Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

//get request

export const GetRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const request = await RequestTicket.findById(req.params.id);

      if (request) {
        return res.status(201).json(request);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get All Request

export const GetAllRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (
      user &&
      (user.role === Role.Purchaser ||
        user.role === Role.Admin ||
        user.role === Role.Requester)
    ) {
      const request = await RequestTicket.find({});

      if (request) {
        return res.status(201).json(request);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// delete request

export const DeleteRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === "Requester") {
      const request = await RequestTicket.findById(req.params.id);

      if (request) {
        await request.remove();
        return res.status(201).json({ msg: "Request Deleted Successfully" });
      }
    }

    return res.status(400).json({ msg: "Error while Deleting Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Change Request Ticket Status by Purchaser

export const ChangeRequestTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Purchaser) {
      const request = await RequestTicket.findById(req.params.id);

      if (request && request.status === Status.Approved) {
        request.status = req.body.status;

        const result = await request.save();
        return res.status(201).json(result);
      }
    }

    return res.status(400).json({ msg: "Error while Changing Status" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
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

// get all users except role "Admin" check thr role if it is admin then return all users

export const GetAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Admin) {
      const users = await User.find({ role: { $ne: Role.Admin } });

      if (users) {
        return res.status(201).json(users);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Users" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// delete user

export const DeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Admin) {
      const user = await User.findById(req.params.id);

      if (user) {
        await user.remove();
        return res.status(201).json({ msg: "User Deleted Successfully" });
      }
    }

    return res.status(400).json({ msg: "Error while Deleting User" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// change status by Purchaser check if the request ticket is in approved status then only change the status

export const ChangeStatusByPurchaser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Purchaser) {
      const request = await RequestTicket.findById(req.params.id);

      if (request && request.status === Status.Approved) {
        request.status = req.body.status;

        const result = await request.save();
        return res.status(201).json(result);
      }
    }

    return res.status(400).json({ msg: "Error while Changing Status" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
