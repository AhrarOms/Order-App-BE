import express from "express";
import { AdminLogin } from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- Login --------------------- */
router.post("/login", AdminLogin);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Approve / Reject Request --------------------- */

export { router as AdminRoute };
