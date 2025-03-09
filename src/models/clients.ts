import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  grants: string[];
}

const ClientSchema = new Schema<IClient>({
  clientId: { type: String, required: true, unique: true },
  clientSecret: { type: String, required: true },
  redirectUris: { type: [String], required: true },
  grants: { type: [String], required: true },
});

export default mongoose.model<IClient>("Client", ClientSchema);
