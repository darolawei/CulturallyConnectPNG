import { Router, type IRouter } from "express";
import healthRouter from "./health";
import provincesRouter from "./provinces";
import openaiConversationsRouter from "./openai/conversations";
import openaiTranscribeRouter from "./openai/transcribe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(provincesRouter);
router.use(openaiConversationsRouter);
router.use(openaiTranscribeRouter);

export default router;
