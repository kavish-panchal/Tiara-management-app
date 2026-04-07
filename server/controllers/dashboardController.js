const Order = require('../models/Order');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all orders
    const allOrders = await Order.find();

    // Pending orders (status = pending)
    const pending = allOrders.filter(order => order.status === 'pending').length;

    // Active orders (status = in-production)
    const activeOrders = allOrders.filter(order => order.status === 'in-production').length;

    // Orders due today
    const dueToday = allOrders.filter(order => {
      const dueDate = new Date(order.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && order.status !== 'completed' && order.status !== 'delivered';
    }).length;

    // Overdue orders (due date < today and not completed/delivered)
    const overdue = allOrders.filter(order => {
      const dueDate = new Date(order.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && order.status !== 'completed' && order.status !== 'delivered';
    }).length;

    // Completed orders
    const completed = allOrders.filter(order => order.status === 'completed' || order.status === 'delivered').length;

    res.json({
      pending,
      activeOrders,
      dueToday,
      overdue,
      completed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};

