import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import { requireRole } from "@/middleware/rbac";
import {
	createResourceController,
	deactivateResourceController,
	listResourcesController,
	updateResourceController,
} from "../controllers/admin-resource-controller";
const router = Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get("/", listResourcesController);
router.post("/", createResourceController);
router.put("/:id", updateResourceController);
router.delete("/:id", deactivateResourceController);

export default router;
