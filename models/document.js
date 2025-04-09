import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const documentSchema = new Schema(
  {
    caseId: {
      type: Types.ObjectId,
      required: true,
      ref: 'Case',
    },
    title: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.plugin(toJSON);

export const DocumentModel = model('Document', documentSchema);

