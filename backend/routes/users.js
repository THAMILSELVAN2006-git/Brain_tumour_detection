const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all user routes (Admin Only)
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin Only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Change user status (active/deactive)
// @route   PUT /api/users/:id/status
// @access  Private (Admin Only)
router.put('/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    // Don't allow admin to deactivate themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'Self deactivation is prohibited' });
    }

    user.isActive = isActive !== undefined ? isActive : user.isActive;
    await user.save();

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: `Set user status of ${user.email} to: ${user.isActive ? 'Active' : 'Deactivated'}`
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'Self deletion is prohibited' });
    }

    const email = user.email;
    await user.deleteOne();

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: `Deleted user account: ${email}`
    });

    res.status(200).json({
      success: true,
      message: `User account ${email} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
