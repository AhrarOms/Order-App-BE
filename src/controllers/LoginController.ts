import { Request, Response, NextFunction } from "express";

import { Role } from "../utility/constants";

import { GenerateSignature, ValidatePassword } from "../utility";
import { User } from "../models";

export const Login = async (
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

  return res.status(401).json({ msg: "Invalid Credentials" });
};

