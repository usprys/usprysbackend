// routes/bsid.js
import express from "express";
import axios from "axios";
import https from "https";
import FormData from "form-data";

const router = express.Router();

// Create HTTPS agent to handle SSL/TLS issues (only if trusted source)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Only use if target site is trusted
  secureOptions: 0x4, // Allow legacy renegotiation
});

router.post("/", async (req, res) => {
  try {
    const {
      type,
      aadhaar_number,
      gurdian_mobile_number,
      name,
      father_name,
      mother_name,
      dob,
    } = req.body;

    // Build form data
    const form = new FormData();
    form.append("ci_csrf_token", "");
    form.append("pass_out_status_id", "1");
    form.append("district_id", "20");

    let url = "";

    switch (type) {
      case "aadhaar":
        form.append("aadhaar_number", aadhaar_number);
        url =
          "https://banglarshiksha.wb.gov.in/Ajax_ep/ajax_get_bs_id_by_aadhaar";
        break;

      case "mobile":
        form.append("gurdian_mobile_number", gurdian_mobile_number);
        form.append("name", name);
        url =
          "https://banglarshiksha.wb.gov.in/Ajax_ep/ajax_get_bs_id_by_gurdian_mobile_no";
        break;

      case "details":
        form.append("name", name);
        form.append("father_name", father_name);
        form.append("mother_name", mother_name);
        form.append("dob", dob);
        url = "https://banglarshiksha.wb.gov.in/Ajax_ep/ajax_get_bs_id";
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid request type.",
        });
    }

    const response = await axios.post(url, form, {
      headers: form.getHeaders(),
      httpsAgent,
      timeout: 60000, // 15s timeout
    });

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("POST request failed:", error.message);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch data due to SSL or network issue.",
    });
  }
});

export default router;
