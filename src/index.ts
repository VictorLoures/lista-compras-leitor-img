import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.post("/ocr", async (req: Request, res: Response) => {
  try {
    const { imageBase64, language = "por" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 missing" });
    }

    const params = new URLSearchParams();
    params.append("base64Image", imageBase64); // precisa incluir "data:image/jpeg;base64,..."
    params.append("language", language);
    params.append("isOverlayRequired", "false");
    params.append("OCREngine", "2");

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: "K83691706388957",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await ocrRes.json();

    if (data?.IsErroredOnProcessing) {
      return res
        .status(500)
        .json({ error: data?.ErrorMessage || "OCR error", raw: data });
    }

    const parsedText = data?.ParsedResults?.[0]?.ParsedText ?? "";
    const digits = (parsedText.match(/\d+/g) || []).join("") || null;

    return res.json({ raw: parsedText, digits, rawResponse: data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

app.listen(3099, () => {
  console.log(`🚀 Server running on http://localhost:${3099}`);
});
