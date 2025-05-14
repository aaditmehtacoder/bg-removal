// server/controllers/PaypalController.js
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import userModel from "../models/userModel.js";

// configure PayPal environment
const env = new checkoutNodeJssdk.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new checkoutNodeJssdk.core.PayPalHttpClient(env);

// 1) Create an order
export async function createOrder(req, res) {
  try {
    const { plan } = req.body;  
    // map plan → USD amounts
    const amounts = { Basic: 10, Advanced: 50, Business: 250 };
    if (!amounts[plan]) throw new Error("Unknown plan");

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amounts[plan].toString()
        }
      }]
    });

    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ error: err.message });
  }
}

// 2) Capture an order and top up credits
export async function captureOrder(req, res) {
  try {
    const { orderID, plan } = req.body;
    const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({});
    const capture = await client.execute(captureRequest);

    if (capture.statusCode === 201) {
      // determine how many credits to add
      const qty = plan === "Basic" ? 100
                : plan === "Advanced" ? 500
                : 5000;
      // authUser middleware will set req.clerkId
      await userModel.findOneAndUpdate(
        { clerkId: req.clerkId },
        { $inc: { creditBalance: qty } }
      );
      return res.json({ success: true, creditsAdded: qty });
    }

    res.status(400).json({ success: false, message: "Capture failed" });
  } catch (err) {
    console.error("captureOrder error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
