import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInput,
  EditCustomerProfileInput,
  UserLoginInput,
} from "../dto";
import { LeaderBoard, PlayCount, User } from "../models";

import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Role } from "../utility/constants";
import { sendMail } from "../services/MailService";
import { Client } from "../models";
import { Ledger } from "../models/Ledger";

const mongoose = require("mongoose");

export const ClientSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();

  try {
    const { username, email, password, depositAmount } = req.body;

    session.startTransaction();

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const existingUser = await User.findOne({ email: email,username }).session(session);

    if (existingUser !== null) {
      return res.status(400).json({ message: "User already exist!" });
    }

    const user = new Client({
      username,
      email,
      password: userPassword,
      salt,
      depositAmount,
    });

    const result = await user.save({ session });

    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id,
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

export const ClientLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json(validationError);
    }

    const { email, password } = customerInputs;
    const user = await Client.findOne({ email });

    const playCount = await PlayCount.findOne();

    console.log("playCount", playCount);

    if (user) {
      const validation = await ValidatePassword(
        password,
        user.password,
        user.salt
      );

      if (validation) {
        const signature = await GenerateSignature({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        });

        console.log("user", user);

        return res.status(200).json({
          signature,
          id: user._id,
          username: user?.username || user?.fullName,
          playCount: playCount?.playCount,
        });
      }
    }

    return res.status(401).json({ msg: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
  }
};

export const GetClientProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Client.findById(customer._id);

    if (profile) {
      return res.status(201).json(profile);
    }
  }
  return res.status(400).json({ msg: "Error while Fetching Profile" });
};

export const EditClientProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length > 0) {
    return res.status(400).json(validationError);
  }

  const { firstName, lastName, address } = customerInputs;

  if (customer) {
    const profile = await User.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;
      const result = await profile.save();

      return res.status(201).json(result);
    }
  }
  return res.status(400).json({ msg: "Error while Updating Profile" });
};

// Enter Ledger

export const AddLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const { deposit } = req.body;

    const client = await Client.findById(user?._id);

    if (client) {
      const ledger = {
        deposit,
      };

      const result = await Ledger.create(ledger);

      client.ledgerId.push(result._id);
      await client.save();
      return res.status(201).json(client);
    }
  } catch (err) {
    console.log(err);
  }
};

// Add to LeaderBoard

export const AddToLeaderBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, username, networth } = req.body;

    //  console.log("id", req.body);

    if(!networth) return res.status(400).json({msg: "Networth is required"})

    const client = await Client.findById(id);

    console.log("client", client);

    if (client) {
      const leaderboard = {
        userId: client?._id,
        username,
        networth,
      };

      const isClientExist = await LeaderBoard.findOne({ userId: client?._id });

      if (isClientExist) {
        await LeaderBoard.findOneAndUpdate(
          { userId: client?._id },
          { networth: networth }
        );
        return res.status(201).json(isClientExist);
      }

      const learderBoard = await LeaderBoard.create(leaderboard);

      return res.status(201).json(learderBoard);
    }
  } catch (err) {
    console.log(err);
  }
};

// get LeaderBoard

export const GetLeaderBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const leaderboard = await LeaderBoard.find().sort({ networth: -1 });

    return res.status(201).json(leaderboard);
  } catch (err) {
    console.log(err);
  }
};
