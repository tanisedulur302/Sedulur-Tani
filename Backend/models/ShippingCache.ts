import mongoose, { Schema, Document } from "mongoose";

export interface IShippingCache extends Document {
  cache_key: string;
  origin: string;
  destination: string;
  weight: number;
  courier: string;
  costs: any[];
  created_at: Date;
  expires_at: Date;
}

const ShippingCacheSchema: Schema = new Schema({
  cache_key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  courier: {
    type: String,
    required: true,
  },
  costs: {
    type: Array,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
});

// Index untuk auto-delete expired cache
ShippingCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IShippingCache>(
  "ShippingCache",
  ShippingCacheSchema
);
