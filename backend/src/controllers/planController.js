
const Plan = require("../models/Plan");
const Office = require("../models/OfficeModel");


const createPlan = async (req, res) => {
  try {
    const { title, price, category, officeId } = req.body;

    // Find office using custom 'id' field
    const office = await Office.findOne({ id: officeId });

    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    // Use office._id to reference in Plan
    const newPlan = await Plan.create({
      title,
      price,
      category,
      office: office._id,
    });

    res.status(201).json(newPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all plans (optionally filter by officeId)
const getAllPlans = async (req, res) => {
  try {
    const { officeId } = req.query;
    const filter = officeId ? { office: officeId } : {};

    const plans = await Plan.find(filter).populate("office");
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get plans by category (and optionally office)
const getPlansByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { officeId } = req.query;
    const filter = { category };

    if (officeId) filter.office = officeId;

    const plans = await Plan.find(filter).populate("office");
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPlansByOfficeId = async (req, res) => {
  try {
    const { id } = req.params; // this is the custom "id" field from Office

    // Find office by custom "id" field
    const office = await Office.findOne({ id });

    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    // Find plans using office's _id
    const plans = await Plan.find({ office: office._id }).populate("office");

    if (!plans.length) {
      return res.status(404).json({ message: "No plans found for this office" });
    }

    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // If officeId is being updated, verify it exists
    if (req.body.officeId) {
      const office = await Office.findById(req.body.officeId);
      if (!office) {
        return res.status(404).json({ message: "Office not found" });
      }
      req.body.office = req.body.officeId;
      delete req.body.officeId;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan)
      return res.status(404).json({ message: "Plan not found" });

    res.status(200).json(updatedPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await Plan.findByIdAndDelete(id);
    if (!deletedPlan)
      return res.status(404).json({ message: "Plan not found" });

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlansByCategory,
  updatePlan,
  deletePlan,
  getPlansByOfficeId 
};
