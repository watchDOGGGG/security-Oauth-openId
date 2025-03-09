import oauth2orize from "oauth2orize";
import Client from "../models/clients";
import Token from "../models/token";
import { v4 as uuidv4 } from "uuid";

// Create OAuth 2.0 server
const oauthServer = oauth2orize.createServer();

// Client serialization for sessions
oauthServer.serializeClient((client, done) => {
  done(null, client.clientId);
});

// Client deserialization from sessions
oauthServer.deserializeClient(async (clientId, done) => {
  try {
    const client = await Client.findOne({ clientId });
    if (!client) return done(null, false);
    return done(null, client);
  } catch (error) {
    return done(error as Error);
  }
});

// Authorization Code Grant
oauthServer.grant(
  oauth2orize.grant.code(
    async (client, redirectUri, user, ares, done: Function) => {
      try {
        console.log("✅ GRANT FLOW EXECUTED");
        console.log("Client:", client);
        console.log("Redirect URI:", redirectUri);
        console.log("User:", user);

        const authCode = uuidv4();
        console.log("Generated Auth Code:", authCode);

        // Store the auth code with relevant information
        await Token.create({
          code: authCode,
          clientId: client.clientId,
          userId: user._id, // Make sure this matches your user model
          redirectUri: redirectUri,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          scope: ares.scope || "",
        });

        done(null, authCode);
      } catch (error) {
        console.error("❌ Error in grant.code:", error);
        done(error as Error);
      }
    },
  ),
);

// Exchange authorization code for access token
oauthServer.exchange(
  oauth2orize.exchange.code(
    async (client, code, redirectUri, done: Function) => {
      try {
        console.log("✅ EXCHANGE FLOW EXECUTED");
        console.log("Client:", client);
        console.log("Code:", code);
        console.log("Redirect URI:", redirectUri);

        // Find the authorization code
        const authToken = await Token.findOne({
          code: code,
          clientId: client.clientId,
        });

        if (!authToken) {
          console.error("❌ Auth code not found");
          return done(null, false);
        }

        if (authToken.expiresAt < new Date()) {
          console.error("❌ Auth code expired");
          await Token.deleteOne({ _id: authToken._id });
          return done(null, false);
        }

        // Generate access token
        const accessToken = uuidv4();
        const refreshToken = uuidv4();

        // Create a new token record
        await Token.create({
          accessToken,
          refreshToken,
          clientId: authToken.clientId,
          userId: authToken.userId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });

        // Delete the used authorization code
        await Token.deleteOne({ _id: authToken._id });

        // Return the tokens
        return done(null, accessToken, refreshToken, {
          expires_in: 3600,
        });
      } catch (error) {
        console.error("❌ Error in exchange.code:", error);
        return done(error as Error);
      }
    },
  ),
);

export { oauthServer };
