import { Router } from "express";
import * as ctrl from "./auth.controller";
const router = Router();

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);

export default router;
