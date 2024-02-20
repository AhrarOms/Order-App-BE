import { Request, Response, NextFunction } from "express";

import { Log, User } from "../models";

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
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
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
        lastName: user?.lastName,
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
  const ticket = await RequestTicket.findById(req.params.id).populate(
    "requester"
  );
  const user = req.user;

  const emailDetails = {
    email: ticket?.requester.email,
    subject: `Request Ticket Status ${status}`,
    purchaser: `Administartor`,
    requester: `${ticket?.requester.firstName} ${ticket?.requester.lastName}`,
    previouseStatus: ticket?.status,
    newStatus: req.body.status,
    date: new Date().toLocaleString(),
    productName: ticket?.productName,
    reqId: ticket?.reqId,
  };

  if (ticket && user?.role === Role.Admin) {
    ticket.status = status;
    ticket.comments = comments;
    await ticket.save();

    // create log
    const log = new Log({
      requestId: ticket._id,
      pastStatus: ticket.status,
      currentStatus: status,
      user: user._id,
    });

    await log.save();

    await sendMail(emailDetails, "approveRejectRequest");

    return res.status(200).json({ msg: "Request Ticket Updated" });
  }

  return res.status(404).json({ msg: "Request Ticket Not Found" });
};

export const UserResetPassword = async (
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

    // update Counter check if there is counter or create new one

    const counter = await Counter.findOne({ name: "request" });

    if (user?.role === Role.Requester || user?.role === Role.Admin) {
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

// Get All current Request without Status Goods_In_Warehouse and Rejected

export const GetAllRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (
      (user && user.role === Role.Admin) ||
      user.role === Role.Purchaser ||
      user.role === Role.Requester
    ) {
      const request = await RequestTicket.find({
        status: { $nin: [Status.Goods_In_Warehouse, Status.Rejected] },
      })
        .sort({ createdAt: -1 })
        .populate("requester");

      if (request) {
        return res.status(201).json(request);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// get current requestes by requester id

export const GetCurrentRequesterEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Requester) {
      const request = await RequestTicket.find({
        requester: mongoose.Types.ObjectId(user?._id),
        status: { $nin: [Status.Goods_In_Warehouse, Status.Rejected] },
      })
        .sort({ createdAt: -1 })
        .populate("requester");

      if (request) {
        return res.status(201).json(request);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
// Get All Past Request without Status Goods_In_Warehouse and Rejected

export const GetAllPastRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (
      (user && user.role === Role.Admin) ||
      user.role === Role.Purchaser ||
      user.role === Role.Requester
    ) {
      const request = await RequestTicket.find({
        status: { $in: [Status.Goods_In_Warehouse, Status.Rejected] },
      })
        .sort({ createdAt: -1 })
        .populate("requester");

      if (request) {
        return res.status(201).json(request);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// get current requestes by requester id

export const GetPastRequesterEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Requester) {
      const request = await RequestTicket.find({
        requester: mongoose.Types.ObjectId(user?._id),
        status: { $in: [Status.Goods_In_Warehouse, Status.Rejected] },
      })
        .sort({ createdAt: -1 })
        .populate("requester");

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

    if (user && user.role === "Admin") {
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
      const request = await RequestTicket.findById(req.params.id).populate(
        "requester"
      );

      const emailDetails = {
        email: request?.requester.email,
        subject: "Request Ticket Status Changed",
        purchaser: `${user.firstName} ${user.lastName}`,
        requester: `${request?.requester.firstName} ${request?.requester.lastName}`,
        previouseStatus: request?.status,
        newStatus: req.body.status,
        date: new Date().toLocaleString(),
        productName: request?.productName,
        reqId: request?.reqId,
        eta: req.body?.eta ? req.body?.eta : "",
      };

      if (request) {
        request.status = req.body.status;

        if (req.body?.eta) {
          request.eta = req.body.eta;
        }

        const log = new Log({
          requestId: request._id,
          pastStatus: request.status,
          currentStatus: req.body.status,
          user: user._id,
        });

        await log.save();

        const result = await request.save();
        await sendMail(emailDetails, "changeRequestStatus");

        return res.status(201).json(result);
      }
    }

    return res.status(400).json({ msg: "Error while Changing Status" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// get all logs by admin

export const GetAllLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Admin) {
      const logs = await Log.find({})
        .sort({ createdAt: 1 })
        .populate("user requestId");

      if (logs) {
        return res.status(201).json(logs);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Logs" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// get all logs by requester

export const GetAllLogsByRequester = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logs = await Log.find({
      user: mongoose.Types.ObjectId(req.user?._id),
    })
      .sort({ createdAt: 1 })
      .populate("user requestId")
      .limit(20);

    if (logs) {
      return res.status(201).json(logs);
    }

    return res.status(400).json({ msg: "Error while Fetching Logs" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// get logs by request id

export const GetLogsByRequestId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logs = await Log.find({
      requestId: mongoose.Types.ObjectId(req.params.id),
    })
      .sort({ createdAt: 1 })
      .populate("user requestId");

    if (logs) {
      return res.status(201).json(logs);
    }

    return res.status(400).json({ msg: "Error while Fetching Logs" });
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
      // const users = await User.find({ role: { $ne: Role.Admin } });
      const users = await User.find();

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

// get all request with the satatus Rejected and Goods_In_Warehouse

export const GetAllRequestWithRejectedStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if ((user && user.role === Role.Admin) || user.role === Role.Purchaser) {
      const request = await RequestTicket.find({
        status: { $in: [Status.Rejected, Status.Goods_In_Warehouse] },
      })
        .sort({ createdAt: -1 })
        .populate("requester");

      if (request) {
        return res.status(201).json(request);
      }
    }

    return res.status(400).json({ msg: "Error while Fetching Request" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
