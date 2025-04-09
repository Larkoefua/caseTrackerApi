import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const updateSchema = new Schema(
  {
    caseId: {
      type: Types.ObjectId,
      required: [true, 'Case ID is required'],
      ref: 'Case',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [3, 'Message must be at least 3 characters long'],
    },
    updateType: {
      type: String,
      enum: {
        values: ['status', 'document', 'court', 'general'],
        message: 'Invalid update type',
      },
      default: 'general',
    },
    createdBy: {
      type: Types.ObjectId,
      required: [true, 'Creator ID is required'],
      ref: 'User',
    },
    isAutomatic: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
updateSchema.index({ caseId: 1, createdAt: -1 });
updateSchema.index({ createdBy: 1 });

updateSchema.plugin(toJSON);

export const UpdateModel = model('Update', updateSchema);

