import { IsEmail, Length, isEmail } from "class-validator";
import { Role } from "../utility/constants";

export class CreateCustomerInput {
  email: string;

  phone: string;

  firstName: string;

  lastName: string;

  password: string;

  classId: string;

  slip: string;

  role: string;

  userName: string;

  state: string;

  classType: string;
}

export class UserLoginInput {
  email: string;

  password: string;
}

export class EditCustomerProfileInput {
  firstName: string;

  lastName: string;

  address: string;
}

export interface CustomerPayload {
  _id: string;
  phone: string;
  role: Role | String;
}

export class CartItem {
  _id: string;
  unit: number;
}

export class OrderInputs {
  txnId: string;
  amount: string;
  items: [CartItem];
}

export class CreateDeliveryUserInput {
  @IsEmail()
  email: string;

  @Length(7, 12)
  phone: string;

  @Length(6, 12)
  password: string;

  @Length(3, 12)
  firstName: string;

  @Length(3, 12)
  lastName: string;

  @Length(6, 24)
  address: string;

  @Length(4, 12)
  pincode: string;
}
