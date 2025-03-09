import { Router, type Request, type Response, type Express } from "express";
import passport from "../config/passport";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  res.send(`<a href="/auth/google"> Authenticate with google </a>`);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/client/profile",
  }),
);

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
  });
});

// Get current session
router.get("/session", passport.authenticate("session"), (req, res) => {
  res.json({ session: req.session, user: req.user });
});

export { router as authRoute };
