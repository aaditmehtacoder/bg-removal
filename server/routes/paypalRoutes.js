// server/routes/paypalRoutes.js
import express from "express";
import { createOrder, captureOrder } from "../controllers/PaypalController.js";
import authUser from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-order", express.json(), authUser, createOrder);
router.post("/capture-order", express.json(), authUser, captureOrder);

export default router;
