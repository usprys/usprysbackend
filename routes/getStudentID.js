import express from "express";
import axios from "axios";
import https from "https";
import tls from "tls";
import FormData from "form-data";

const router = express.Router();

// ✅ Fixed HTTPS agent — works in Node 18–22+
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureOptions: 0x4, // legacy renegotiation allowed
});

// ✅ Helper function to send POST request safely
const fetchStudentData = async (url, form) => {
  const startTime = Date.now();
  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    httpsAgent,
    timeout: 30000, // 30s to handle slow SSL handshake
  });

  // Check if it took too long (network or SSL issues)
  if (Date.now() - startTime > 20000) {
    throw new Error("Request timed out or SSL handshake too slow.");
  }

  return response.data;
};

// ✅ Main route
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

    const data = await fetchStudentData(url, form);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("POST request failed:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch data due to SSL, timeout, or network issue.",
    });
  }
});

export default router;
