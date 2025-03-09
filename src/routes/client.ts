import express, { Request, Response } from "express";
import { isAuthenticated } from "../middleware/auth-middleware";

interface AuthenticatedRequest extends Request {
  user?: any & { displayName: string }; // Ensuring 'user' has 'displayName'
}

const router = express.Router();

router.get(
  "/profile",
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    res.send(`Profile ${req.user?.displayName}`);
  },
);

export const clientRoute = router;
