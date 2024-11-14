import express from "express";

import authRouter from "./auth";
import testRouter from "./test";
import questionRouter from "./question";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/tests", testRouter);
router.use("/questions", questionRouter);

export default router;
