import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";




// Get monthly analytics for user
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          "splits.user": userObjId,
        },
      },
      { $unwind: "$splits" },
      {
        $match: {
          "splits.user": userObjId,
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            category: "$category",
          },
          total: { $sum: "$splits.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": -1 } },
    ]);

    const paymentAgg = await Invoice.aggregate([
      {
        $match: {
          user: userObjId,
          status: "paid",
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": -1 } },
    ]);

    const monthlyExpenses = {};
    const categoryBreakdown = {};
    let totalAllTime = 0;
    let totalTransactions = 0;

    expenseAgg.forEach((item) => {
      const month = item._id.month;
      const category = item._id.category;
      const amount = item.total;
      const count = item.count;

      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = {
          total: 0,
          categories: {},
          count: 0,
        };
      }

      monthlyExpenses[month].total += amount;
      monthlyExpenses[month].count += count;

      if (!monthlyExpenses[month].categories[category]) {
        monthlyExpenses[month].categories[category] = 0;
      }
      monthlyExpenses[month].categories[category] += amount;

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }
      categoryBreakdown[category] += amount;

      totalAllTime += amount;
      totalTransactions += count;
    });

    const monthlyPayments = {};
    let totalPayments = 0;

    paymentAgg.forEach((item) => {
      const month = item._id.month;
      monthlyPayments[month] = {
        total: item.total,
        count: item.count,
      };
      totalPayments += item.total;
    });

    // Convert to percentages
    const categoryPercentages = {};
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryPercentages[category] = {
        amount: categoryBreakdown[category],
        percentage:
          totalAllTime > 0
            ? ((categoryBreakdown[category] / totalAllTime) * 100).toFixed(1)
            : 0,
      };
    });

    // Calculate averages
    const monthCount = Object.keys(monthlyExpenses).length;
    const avgMonthlyExpense = monthCount > 0 ? totalAllTime / monthCount : 0;

    res.json({
      monthlyExpenses,
      monthlyPayments,
      categoryBreakdown: categoryPercentages,
      summary: {
        totalExpenses: totalAllTime,
        totalPayments,
        avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
        monthsTracked: monthCount,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error("Get monthly analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get category trends
export const getCategoryTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const months = parseInt(req.query?.months) || 6; // Last 6 months by default

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);

    const trendAgg = await Expense.aggregate([
      {
        $match: {
          "splits.user": userObjId,
          date: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: "$splits" },
      {
        $match: {
          "splits.user": userObjId,
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            category: "$category",
          },
          total: { $sum: "$splits.amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const trends = {};

    trendAgg.forEach((item) => {
      const month = item._id.month;
      const category = item._id.category;

      if (!trends[month]) {
        trends[month] = {};
      }

      trends[month][category] = item.total;
    });

    res.json({ trends });
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

