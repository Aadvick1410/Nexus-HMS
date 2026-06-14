import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification && notification.userId.toString() === req.user._id.toString()) {
    notification.isRead = true;
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } else {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }
});

// Helper function to create a notification (called internally by other controllers)
const createNotification = async (userId, title, message, type) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};

export { getNotifications, markAsRead, createNotification };
