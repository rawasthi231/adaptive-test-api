import express from "express";

import QuestionController from "../controllers/question";

const router = express.Router();

router
  .route("/")
  .post(QuestionController.create)
  .get(QuestionController.getAll);

router
  .route("/:id")
  .get(QuestionController.getOne)
  .put(QuestionController.update)
  .delete(QuestionController.destroy);

export default router;
