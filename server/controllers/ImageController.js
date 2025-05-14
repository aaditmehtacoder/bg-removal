// controllers/ImageController.js

import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import userModel from "../models/userModel.js";

/**
 * POST /api/image/remove-bg
 * Requires: 
 *   - authUser middleware (attaches req.clerkId)
 *   - multer middleware (single file upload under field name "image")
 */
const removeBgImage = async (req, res) => {
  try {
    // 1) Grab the authenticated Clerk user ID
    const clerkId = req.clerkId;
    if (!clerkId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: clerkId missing" });
    }

    // 2) Look up the user in Mongo
    const user = await userModel.findOne({ clerkId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3) Ensure they have credits remaining
    if (user.creditBalance <= 0) {
      return res.json({
        success: false,
        message: "No credit balance",
        creditBalance: user.creditBalance,
      });
    }

    // 4) Read the uploaded file from multer
    const imagePath = req.file.path;
    const imageStream = fs.createReadStream(imagePath);

    // 5) Prepare FormData for Clipdrop API
    const form = new FormData();
    form.append("image_file", imageStream);

    // 6) Call the Clipdrop remove-background endpoint
    const apiResponse = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      form,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
          ...form.getHeaders(),          // important for multipart boundary
        },
        responseType: "arraybuffer",
      }
    );

    // 7) Convert binary to base64 data URI
    const base64 = Buffer.from(apiResponse.data, "binary").toString("base64");
    const resultImage = `data:${req.file.mimetype};base64,${base64}`;

    // 8) Deduct one credit and save
    user.creditBalance -= 1;
    await user.save();

    // 9) Return the processed image and new balance
    return res.json({
      success: true,
      resultImage,
      creditBalance: user.creditBalance,
      message: "Background removed successfully",
    });
  } catch (error) {
    console.error("removeBgImage error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

export { removeBgImage };
