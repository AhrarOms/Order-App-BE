import express from "express";

import { AddLedger, AddToLeaderBoard, ClientLogin, ClientSignUp, GetLeaderBoard } from "../controllers";

import { Authenticate } from "../middleware";

const router = express.Router();

/* ------------------- SignUp / Create Customer --------------------- */
router.post("/signup", ClientSignUp);

/* ------------------- Login --------------------- */
router.post("/login", ClientLogin);

router.post("/add-to-leaderBoard", AddToLeaderBoard);

router.get("/leader-board", GetLeaderBoard);


/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Add Ledger --------------------- */
router.post("/add-ledger", AddLedger);

export { router as ClientRoute };
