import express, { Request, Response, NextFunction } from "express";
import {
  UserSignUp,
  UserLogin,
  UserForgetPassword,
  AddRequest,
  GetRequest,
  EditRequest,
  DeleteRequest,
  ChangeRequestTicketStatus,
  GetAllRequest,
  ApproveOrRejectRequestTicket,
  AddCounter,
} from "../controllers/UserController";

import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- SignUp / Create Customer --------------------- */
router.post("/signup", UserSignUp);

/* ------------------- Login --------------------- */
router.post("/login", UserLogin);

/* ------------------- Forget Password --------------------- */
router.post("/forget-password", UserForgetPassword);

/* ------------------- add counter --------------------- */
router.post("/add-counter", AddCounter);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Add Request --------------------- */
router.post("/add-request", AddRequest);

/* ------------------- Get Request  --------------------- */
router.get("/get-request/:id", GetRequest);

/* ------------------- Get All Request  --------------------- */
router.get("/get-all-request", GetAllRequest);

/* ------------------- Edit Reqiest --------------------- */
router.put("/edit-request/:id", EditRequest);

/* ------------------- Delete Request --------------------- */

router.delete("/delete-request/:id", DeleteRequest);

/* ------------------- Change Status --------------------- */

router.put("/change-status/:id", ChangeRequestTicketStatus);

router.put("/approve-or-reject-request/:id", ApproveOrRejectRequestTicket);

export { router as UserRoute };
