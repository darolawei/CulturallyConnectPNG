import { Router, type IRouter } from "express";
import { speechToText, ensureCompatibleFormat } from "@workspace/integrations-openai-ai-server/audio";

const router: IRouter = Router();

router.post("/openai/transcribe", async (req, res) => {
  const { audio, mimeType } = req.body as {
    audio: string;
    mimeType?: string;
  };

  if (!audio) {
    res.status(400).json({ error: "No audio data provided" });
    return;
  }

  try {
    const rawBuffer = Buffer.from(audio, "base64");
    const { buffer, format } = await ensureCompatibleFormat(rawBuffer);
    const text = await speechToText(buffer, format);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "Transcription failed — please try again." });
  }
});

export default router;
