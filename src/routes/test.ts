import express from "express";

import TestController from "../controllers/test";

const router = express.Router();

router.get("/:testId", TestController.getById);
router.get("/:uniqueURL", TestController.getByUrl);
router.post("/:testId/start", TestController.start);
router.post(
  "/:testId/questions/:questionId/answer",
  TestController.submitAnswer
);

export default router;
