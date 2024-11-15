import express from "express";

import TestController from "../controllers/test";

import { isAdmin } from "../middlewares";

const router = express.Router();

router.post("/", isAdmin, TestController.create);

router.get("/:testId", isAdmin, TestController.getById);
router.get("/:uniqueURL", TestController.getByUrl);
router.post("/:testId/start", TestController.start);
router.post(
  "/:testId/questions/:questionId/answer",
  TestController.submitAnswer
);

export default router;
