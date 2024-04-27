// Inside your routes file

const express = require("express");
const router = express.Router();
const { Event } = require("../models/event");

// POST route to handle event likes
// Assuming you already have your express app and Event model configured

// This route will toggle the like status for a specific user on a event
router.post("/event/:eventId/like", async (req, res) => {
  const { eventId } = req.params; // Extract the event ID from the URL params
  const { userId } = req.body; // Assuming you have the user ID available in the request body

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);
    console.log(event);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if the user has already liked the event
    const alreadyLikedIndex = event.likes.indexOf(userId);

    if (alreadyLikedIndex === -1) {
      // User hasn't liked the event, so add the user ID to the likes array
      event.likes.push(userId);
    } else {
      // User has already liked the event, so remove the user ID from the likes array
      event.likes.splice(alreadyLikedIndex, 1);
    }

    // Save the updated event with the modified likes array
    const updatedEvent = await event.save();

    res.status(200).json({
      message: "Like status updated successfully",
      event: updatedEvent,
      pId: eventId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update like status" });
    console.error(error);
  }
});

module.exports = router;
