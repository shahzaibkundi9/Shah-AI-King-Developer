import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import * as ctrl from "./conversation.controller";

const router = Router();
router.use(authMiddleware);

router.get("/", ctrl.listConversations);
router.get("/:id/messages", ctrl.getMessages);
router.post("/:id/send", ctrl.sendMessage);
router.post("/:id/assign-template", ctrl.assignTemplate);

export default router;
