import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import * as ctrl from "./export.controller";

const router = Router();
router.use(authMiddleware);

router.post("/start", ctrl.startExport);
router.get("/status/:id", ctrl.getStatus);
router.get("/download/:id", ctrl.download);

export default router;
