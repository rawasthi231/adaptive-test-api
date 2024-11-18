import express from "express";

import TestController from "../controllers/test";

import { isAdmin } from "../middlewares";

const router = express.Router();

router
  .route("/")
  .all(isAdmin)
  .post(TestController.create)
  .get(TestController.getAll);

router.get("/user/attempted", TestController.getUserTests);

router
  .route("/:testId")
  .all(isAdmin)
  .get(TestController.getById)
  .delete(TestController.destroy);

router.get("/:uniqueURL/url", TestController.getByUrl);
router.post("/:testId/start", TestController.start);
router.post(
  "/:testId/questions/:questionId/answer",
  TestController.submitAnswer
);

export default router;
