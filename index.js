import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const SHEET_ID = "1Pt1mRzmLdUkDyYTOo-5Bo9NCR8-hlebSjcY7fe0LEcM";
const SHEET_NAME = "Sheet1";
const API_KEY = process.env.API_KEY;

app.get("/marks", async (req, res) => {
  try {
    const { masterId, rollNumber, dob } = req.query;

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    const response = await axios.get(url);
    const rows = response.data.values || [];

    const records = rows.slice(1).map(r => ({
      full_name: r[0],
      master_id: r[1],
      roll_number: r[2],
      dob: r[3],
      obtained_marks: r[4],
      advertisement_no: r[5],
      visible_from: r[6],
      visible_to: r[7]
    }));

    const today = new Date().toISOString().split("T")[0];

    const result = records.find(r =>
      r.master_id === masterId &&
      r.roll_number === rollNumber &&
      r.dob === dob &&
      today >= r.visible_from &&
      today <= r.visible_to
    );

    if (!result) return res.json({ found: false });

    res.json({ found: true, data: result });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));