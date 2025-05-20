const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
  id: { type: String, },
  name: { type: String },
  imageThumbnail: { type: String, },
  centerImages: [{ type: String }],
  location: { type: String },
  description: { type: String },
  pointOfContact: { type: String },
  address: {
    unitNumber: { type: String },
    street: { type: String },
    landmark: { type: String },
    locality: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  amenities: [{ type: String }],
  pricing: {
    Conference_Room: [{ type: String }],
    Meeting_Room: [{ type: String }],
    Day_Pass: [{ type: String }],
  },
  selectedPricing: {
    Conference_Room: { type: String, default: "" },
    Meeting_Room: { type: String, default: "" },
    Day_Pass: { type: String, default: "" },
  },
  operatingHours: {
    type: Map,
    of: String,
    default: {},
  },
});

const Office = mongoose.model("Office", officeSchema);
module.exports = Office;
