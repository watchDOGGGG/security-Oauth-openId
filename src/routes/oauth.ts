import { Router } from "express";
import passport from "../config/passport";
import { oauthServer } from "../config/oauth";
import Client from "../models/clients";

const router = Router();

// Authorization endpoint
router.get(
  "/authorize",
  (req, res, next): any => {
    // Check if required OAuth parameters are present
    const { response_type, client_id, redirect_uri } = req.query;

    if (!response_type) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing required parameter: response_type",
      });
    }

    if (!client_id) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing required parameter: client_id",
      });
    }

    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      // Redirect to login with the current URL as the redirect target
      const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      return res.redirect(
        `/auth/login?redirect=${encodeURIComponent(currentUrl)}`,
      );
    }

    next();
  },
  oauthServer.authorize(async (clientId, redirectUri, done: Function) => {
    try {
      const client = await Client.findOne({ clientId });
      if (!client) return done(null, false);

      if (!client.redirectUris.includes(redirectUri)) {
        return done(null, false);
      }

      console.log("🔹 authorize() called with:", clientId, redirectUri);
      return done(null, client, redirectUri);
    } catch (error) {
      return done(error);
    }
  }),
  (req, res): any => {
    console.log("🔹 Authorization Response:", res.locals);

    if (!res.locals.oauth2 || !res.locals.oauth2.transactionID) {
      return res.status(500).json({ error: "Missing OAuth2 transaction ID" });
    }

    const transactionID = res.locals.oauth2.transactionID;
    const client = res.locals.oauth2.client;

    console.log("✅ OAuth Transaction ID:", transactionID);
    console.log("✅ Client Info:", client);

    // Render the consent page with the transactionID
    res.render("consent", {
      transactionID,
      client,
      redirect_uri: req.query.redirect_uri,
      user: req.user,
    });
  },
);

// User decision endpoint
router.post(
  "/authorize/decision",
  passport.authenticate("session"),
  (req, res, next): any => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    next();
  },
  oauthServer.decision(),
);

// Token endpoint - Exchange authorization code for access token
router.post("/token", oauthServer.token(), oauthServer.errorHandler());

// Callback endpoint for testing
router.get("/callback", (req, res): any => {
  if (!req.query.code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  res.json({ message: "Authorization successful!", code: req.query.code });
});

export { router as oauthRoutes };
