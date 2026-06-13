import { Router, type IRouter } from "express";
import healthRouter from "./health";
import regenerateRouter from "./regenerate";
import guardrailsRouter from "./guardrails";

const router: IRouter = Router();

router.use(healthRouter);
router.use(regenerateRouter);
router.use(guardrailsRouter);

export default router;
