import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";

const router = Router();

// Route to handle AI content generation
router.get('/get-result', aiController.getResult);

export default router;