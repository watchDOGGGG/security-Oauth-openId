import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user) {
    return next();
  }

  // Store the original URL for redirection after login
  const originalUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  // Redirect to login with the current URL as the redirect target
  res.redirect(`/auth/login?redirect=${encodeURIComponent(originalUrl)}`);
};

/**
 * Middleware to check if user is NOT authenticated (for login/register pages)
 */
export const isNotAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  // If there's a redirect parameter, go there, otherwise go to home
  const redirectTo = req.query.redirect ? (req.query.redirect as string) : "/";
  res.redirect(redirectTo);
};
