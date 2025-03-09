import { Router, type Request, type Response, type Express } from "express";
import passport from "../config/passport";
import User from "../models/user";
import clients from "../models/clients";

const router = Router();

// Register a new user
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, email, password } = req.body;

    const findOne = await User.findOne({ email: email });
    if (findOne) {
      return res
        .status(400)
        .send({ message: "User with this email already exists" });
    }

    const createdUser = await User.create({ username, email, password });

    return res
      .status(201)
      .json({ message: "User registered successfully", data: createdUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// Login route
router.post("/login", (req, res, next) => {
  // Store the original redirect URL which might be an OAuth authorization request

  const redirectTo = req.query.redirect || "/";

  passport.authenticate("local", (err: any, user: Express.User, info: any) => {
    if (err) return next(err);
    if (!user) {
      // If this is an API request, return JSON
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Otherwise render the login page with error
      return res.render("login", {
        error: "Invalid email or password",
        redirect: redirectTo,
      });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }

      console.log("User successfully logged in:", user);

      // If this is an API request, return JSON
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.json({ message: "Login successful", user });
      }

      // Redirect to the original destination (which might be an OAuth authorization request)
      return res.redirect(
        `http://localhost:5000/oauth/authorize?response_type=code&client_id=cb5176ca9b85b423472fdbd0624403e4&redirect_uri=http://localhost:5000/callback` as string,
      );
    });
  })(req, res, next);
});

// Login page
router.get("/login", (req, res) => {
  // If user is already logged in and there's a redirect URL, redirect immediately
  if (req.isAuthenticated() && req.query.redirect) {
    return res.redirect(req.query.redirect as string);
  }

  res.render("login", {
    redirect: "/oauth/authorize",
    error: req.flash("error"),
  });
});

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Get current session
router.get("/session", passport.authenticate("session"), (req, res) => {
  res.json({ session: req.session, user: req.user });
});

export { router as authRoute };
