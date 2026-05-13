import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

const SHEET_ID = "1Pt1mRzmLdUkDyYTOo-5Bo9NCR8-hlebSjcY7fe0LEcM";
const SHEET_NAME = "Sheet1";
const API_KEY = process.env.API_KEY;


app.get("/marks", async (req, res) => {
  try {
    const { advertisement_no, masterId, rollNumber, dob } = req.query;

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
      r.advertisement_no?.trim() === advertisement_no?.trim() &&
      r.master_id?.trim() === masterId?.trim() &&
      r.roll_number?.trim() === rollNumber?.trim() &&
      r.dob?.trim() === dob?.trim() &&
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


app.get("/advertisements", async (req, res) => {
  try {
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    const response = await axios.get(url);
    const rows = response.data.values || [];

    const today = new Date().toISOString().split("T")[0];

    const records = rows.slice(1).map(r => ({
      advertisement_no: r[5],
      visible_from: r[6],
      visible_to: r[7]
    }));

    const activeAds = records.filter(r =>
      today >= r.visible_from && today <= r.visible_to
    );

    // unique
    const uniqueAds = [
      ...new Set(activeAds.map(r => r.advertisement_no))
    ];

    const result = uniqueAds.map(ad => ({
      advertisement_no: ad
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed to load advertisements" });
  }
});


app.listen(PORT, () => console.log("Server running on", PORT));