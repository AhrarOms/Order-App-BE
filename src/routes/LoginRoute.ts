import express from "express";
import { Login } from "../controllers/LoginController";


const router = express.Router();

/* ------------------- Login --------------------- */
router.post("/", Login);

export { router as LoginRoute };
