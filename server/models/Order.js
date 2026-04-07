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
  },
  { _id: true },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
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
    specialNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in-production", "completed", "delivered"],
      default: "pending",
    },
    designs: [designSchema],
  },
  {
    timestamps: true,
  },
);

// Auto-increment orderNumber before saving
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const lastOrder = await this.constructor
      .findOne({}, { orderNumber: 1 })
      .sort({ orderNumber: -1 })
      .limit(1);

    this.orderNumber =
      lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
  }
});

// Virtual for checking if order is overdue
orderSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== "completed" &&
    this.status !== "delivered" &&
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
