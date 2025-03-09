import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  userId: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<IToken>({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  clientId: { type: String, required: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model<IToken>("Token", TokenSchema);
