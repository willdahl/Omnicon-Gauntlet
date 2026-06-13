import { Router, type IRouter } from "express";
import healthRouter from "./health";
import regenerateRouter from "./regenerate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(regenerateRouter);

export default router;
