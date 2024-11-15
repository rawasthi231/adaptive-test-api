import express from "express";

import authRouter from "./auth";
import testRouter from "./test";
import questionRouter from "./question";

import { authenticate, isAdmin } from "../middlewares";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/tests", authenticate, testRouter);
router.use("/questions", authenticate, isAdmin, questionRouter);

export default router;
