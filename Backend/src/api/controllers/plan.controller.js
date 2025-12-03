import Plan from '../models/plan.model.js';

export async function getPlans(req, res, next) {
  try {
    const plans = await Plan.find({ activo: true });
    res.json(plans);
  } catch (err) {
    next(err);
  }
}

export async function createPlan(req, res, next) {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
}

export async function updatePlan(req, res, next) {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

export async function deletePlan(req, res, next) {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
