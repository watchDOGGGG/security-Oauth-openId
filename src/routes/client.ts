import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import crypto from 'crypto'
import Client from '../models/clients'
import Token from "../models/token";
import jwt from 'jsonwebtoken'

dotenv.config();

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<any> => {
  try {
    const {redirectUris, grants} = req.body

    const clientId = crypto.randomBytes(16).toString("hex")
    const clientSecrete = crypto.randomBytes(32).toString("hex")

    const newClient = await Client.create({clientId, clientSecrete, redirectUris, grants})

    return res.status(201).send({message: 'grant created successfully', data:{clientId, clientSecrete}})
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error" , error});
  }
});

router.post("/token", async (req: Request, res: Response):Promise<any> => {
    const { client_id, client_secret, code } = req.body;
  
    const client = await Client.findOne({ clientId: client_id, clientSecret: client_secret });
    if (!client) return res.status(400).json({ error: "Invalid client credentials" });
  
    const authCode = await Token.findOne({ clientId: client_id, code });
    if (!authCode) return res.status(400).json({ error: "Invalid code" });
  
    const accessToken = jwt.sign({ clientId: client_id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
  
    await Token.deleteOne({ code });
  
    res.json({ access_token: accessToken, token_type: "Bearer", expires_in: 3600 });
  });

export const clientRoute = router
