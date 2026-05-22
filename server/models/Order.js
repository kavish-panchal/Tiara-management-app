const mongoose = require("mongoose");

const sizeBreakdownSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const productionProgressSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    labour: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      default: null,
    },
    finishDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const designSchema = new mongoose.Schema(
  {
    skuCode: {
      type: String,
      required: true,
    },
    sizeBreakdown: [sizeBreakdownSchema],
    productionProgress: [productionProgressSchema],
    specialRemarks: {
      type: String,
      default: "",
    },
  },
  { _id: true },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    partyName: {
      type: String,
      required: true,
      trim: true,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    orderCompleted: {
      type: Date,
      default: null,
    },
    orderDelivered: {
      type: Date,
      default: null,
    },
    specialNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in-production", "completed", "cancelled"],
      default: "pending",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    designs: [designSchema],
  },
  {
    timestamps: true,
  },
);

// Auto-increment orderNumber before saving (format: YY0001)
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString().slice(-2); // Get last 2 digits (e.g., "26" for 2026)

    // Find the last order for the current year
    const yearPattern = new RegExp(`^${yearPrefix}`);
    const lastOrder = await this.constructor
      .findOne({ orderNumber: yearPattern })
      .sort({ orderNumber: -1 })
      .limit(1);

    let sequenceNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      // Extract the sequence number from the last order (e.g., "260005" -> 5)
      const lastSequence = parseInt(lastOrder.orderNumber.slice(2), 10);
      sequenceNumber = lastSequence + 1;
    }

    // Format: YY + 4-digit sequence (e.g., "260001", "260002")
    this.orderNumber = `${yearPrefix}${sequenceNumber.toString().padStart(4, "0")}`;
  }
});

// Virtual for checking if order is overdue
orderSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== "completed" &&
    this.status !== "cancelled" &&
    new Date() > this.dueDate
  );
});

// Virtual for checking if order is due today
orderSchema.virtual("isDueToday").get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  return today.getTime() === due.getTime();
});

module.exports = mongoose.model("Order", orderSchema);
