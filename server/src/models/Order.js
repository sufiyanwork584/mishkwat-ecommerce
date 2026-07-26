import mongoose from "mongoose";

/* ==========================================================
   ORDER ITEM
========================================================== */

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   STATUS HISTORY
========================================================== */

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   ORDER SCHEMA
========================================================== */

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderNumber: {
      type: String,
      unique: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      zipCode: {
        type: String,
        required: true,
      },

      area: {
        type: String,
        default: "",
      },

      region: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "stripe"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    paymentResult: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    tax: {
      type: Number,
      default: 0,
    },

    shippingCost: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "pickupScheduled",
        "shipped",
        "outForDelivery",
        "delivered",
        "returnRequested",
        "returnApproved",
        "returned",
        "refundProcessing",
        "refundCompleted",
        "cancelled",
      ],

      default: "pending",
    },

    statusHistory: [statusHistorySchema],

    couponCode: {
      type: String,
      default: "",
    },

    deliveredAt: Date,

    cancelledAt: Date,

    cancelReason: String,

    /* ==========================================================
       SHIPROCKET
    ========================================================== */

    shipmentId: {
      type: String,
      default: '',
    },

    shiprocketOrderId: {
      type: String,
      default: '',
    },

    awbCode: {
      type: String,
      default: '',
    },

    trackingStatus: {
      type: String,
      default: 'Order Created',
    },

    shippingStatus: {
      type: String,
      default: '',
    },

    trackingUrl: {
      type: String,
      default: '',
    },

    courierCompanyId: {
      type: Number,
      default: null,
    },

    courierName: {
      type: String,
      default: '',
    },

    shippingLabelUrl: {
      type: String,
      default: '',
    },

    labelUrl: {
      type: String,
      default: '',
    },

    invoiceUrl: {
      type: String,
      default: '',
    },

    manifestUrl: {
      type: String,
      default: '',
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    pickupScheduledAt: {
      type: Date,
      default: null,
    },

    shipmentCreated: {
      type: Boolean,
      default: false,
    },

    lastTrackingUpdate: {
      type: Date,
      default: null,
    },

    deliveryDate: {
      type: Date,
      default: null,
    },

    rtoStatus: {
      type: String,
      default: '',
    },

    trackingTimeline: [
      {
        status:   { type: String, default: '' },
        activity: { type: String, default: '' },
        date:     { type: Date,   default: null },
        location: { type: String, default: '' },
        _id:      false,
      },
    ],

    /* ==========================================================
       RETURN DETAILS
    ========================================================== */

    returnDetails: {
      reason: {
        type: String,
        default: "",
      },

      images: [
        {
          type: String,
        },
      ],

      requestedAt: Date,

      approvedAt: Date,

      returnedAt: Date,

      adminNote: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================
   DATABASE INDEXES
========================================================== */

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  paymentStatus: 1,
});

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  shipmentId: 1,
});

orderSchema.index({
  awbCode: 1,
});

/* ==========================================================
   GENERATE ORDER NUMBER
========================================================== */

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now()
      .toString(36)
      .toUpperCase();

    const random = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    this.orderNumber = `MKW-${timestamp}-${random}`;
  }

  if (this.isNew) {
    this.statusHistory.push({
      status: "pending",
      note: "Order placed successfully",
    });
  }

  next();
});

/* ==========================================================
   MODEL
========================================================== */

const Order = mongoose.model(
  "Order",
  orderSchema
);

export default Order;