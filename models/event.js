const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      requird: true,
    },
    name: {
      type: String,
    },
    venue: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    profile: {
      type: String,
    },
    organizer: {
      type: String,
    },
    participants: [],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = {
  Event,
  eventSchema,
};
