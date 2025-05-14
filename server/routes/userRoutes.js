import express from "express";
import { userCredits, clerkWebhooks } from "../controllers/UserController.js";
import authUser from "../middlewares/auth.js";

const router = express.Router();

router.post("/webhooks", clerkWebhooks);
router.get("/credits", authUser, userCredits);

export default router;