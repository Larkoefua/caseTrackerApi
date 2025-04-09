import { Schema, Types, model } from "mongoose";
import mongoose from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const caseSchema = new Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    courtInfo: {
      courtName: String,
      judge: String,
      hearingDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique case number before saving
caseSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const count = await mongoose.models.Case.countDocuments();
      const year = new Date().getFullYear();
      this.caseNumber = `CASE-${year}-${(count + 1).toString().padStart(5, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

caseSchema.plugin(toJSON);

export const CaseModel = model('Case', caseSchema);

