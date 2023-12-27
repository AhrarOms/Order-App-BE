import express from "express";
import {
  AddCounter,
  AdminLogin,
  ApproveOrRejectRequestTicket,
} from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- Login --------------------- */
router.post("/login", AdminLogin);

/* ------------------- add counter --------------------- */
router.post("/add-counter", AddCounter);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Approve / Reject Request --------------------- */
router.put("/approve-or-reject-request/:id", ApproveOrRejectRequestTicket);

export { router as AdminRoute };
