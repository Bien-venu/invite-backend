const { Event } = require("../models/event");
const Admin = require("../models/admin");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const nodemailer = require("nodemailer");

function sendCheckInMail(data) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: process.env.NODE_MAILER_USER,
    to: data.email,
    subject: `${data.name} You've Checked In - InVITe`,
    html: `Dear ${data.name},<br><br>
           <strong>Congratulations, you've successfully checked in!</strong><br><br>
           Name: ${data.name}<br>
           Registration Number: ${data.regNo}<br>
           Contact Number: ${data.number}<br><br>
           If you have any questions or concerns, please don't hesitate to contact us:<br>
           Anurag Singh: 2002anuragksingh@gmail.com<br>
           Devanshu Yadav: devanshu.yadav2020@vitbhopal.ac.in<br>
           Saksham Gupta: saksham.gupta2020@vitbhopal.ac.in<br><br>
           Lavanya Doohan: lavanya.doohan2020@vitbhopal.ac.in<br><br>
           Thank you for choosing InVITe!<br><br>
           Best regards,<br>
           The InVITe Team`,
  };

  transporter.sendMail(mailOptions, function (err, success) {
    if (err) {
      console.log(err);
    } else {
      console.log("Checked In Email sent successfully");
    }
  });
}

const postEvent = async (req, res) => {
  const Name = req.body.name;
  const Venue = req.body.venue;
  const Date = req.body.date;
  const Time = req.body.time;
  const Desc = req.body.description;
  const Price = req.body.price;
  const Profile = req.body.profile;
  const Organizer = req.body.organizer;

  const adminId = req.body.admin_id;
  console.log("Admin: ", adminId);

  const secret = JWT_SECRET;
  const payload = {
    email: Name,
  };

  const token = await jwt.sign(payload, secret);

  const new_event = new Event({
    event_id: token,
    name: Name,
    venue: Venue,
    date: Date,
    time: Time,
    description: Desc,
    price: Price,
    profile: Profile,
    organizer: Organizer,
  });

  try {
    new_event.save((error, success) => {
      if (error) console.log(error);
      else console.log("Saved::New Event::created.");
    });
  } catch (err) {
    console.log(err);
  }

  Admin.updateOne(
    { admin_id: adminId },
    {
      $push: {
        eventCreated: {
          event_id: token,
          name: Name,
          venue: Venue,
          date: Date,
          time: Time,
          description: Desc,
          price: Price,
          profile: Profile,
          organizer: Organizer,
        },
      },
    },
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );

  res.status(200).send({ msg: "event created", event_id: token });
};

const allEvents = async (req, res) => {
  Event.find({})
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send({ msg: "Error fetching data", error: err });
    });
};

const particularEvent = async (req, res) => {
  const eventId = req.body.event_id;
  Event.find({ _id: eventId })
    .then((data) => {
      res.status(200).send(data[0]);
      console.log(data);
    })
    .catch((err) => {
      res.status(400).send({ msg: "Error fetching event", error: err });
    });
};

const deleteEvent = async (req, res) => {
  const eventId = req.body.event_id;
  console.log(eventId);

  try {
    const result = await Event.deleteOne({ _id: eventId });
    if (result.deletedCount === 1) {
      console.log("Event deleted successfully.");
      res.status(200).send({ msg: "success" });
    } else {
      console.log("Event not found or not deleted.");
      res.status(404).send({ msg: "Event not found or not deleted." });
    }
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).send({ msg: "Error deleting event", error: err });
  }
};

const updateEvent = async (req, res) => {
  const eventId = req.body.event_id;
  const updatedEventData = {
    name: req.body.name,
    venue: req.body.venue,
    date: req.body.date,
    time: req.body.time,
    description: req.body.description,
    price: req.body.price,
    profile: req.body.profile,
    organizer: req.body.organizer,
  };

  try {
    const result = await Event.updateOne({ _id: eventId }, updatedEventData);
    if (result.nModified === 1) {
      console.log("Event updated successfully.");
      res.status(200).send({ msg: "success" });
    } else {
      console.log("Event not found or not updated.");
      res.status(404).send({ msg: "Event not found or not updated." });
    }
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).send({ msg: "Error updating event", error: err });
  }
};

const checkin = async (req, res) => {
  const eventId = req.body.event_id;
  const userList = req.body.checkInList;

  let eventName = "";

  Event.find({ event_id: eventId })
    .then((data) => {
      eventName = data[0].name;
      console.log(eventName);
    })
    .catch((err) => {
      res.status(400).send({ msg: "Error fetching event", error: err });
    });

  for (let i = 0; i < userList.length; i++) {
    Event.updateOne(
      { event_id: eventId, "participants.id": userList[i] },
      { $set: { "participants.$.entry": true } },
      function (err) {
        if (err) return handleError(err);
        else {
          console.log(`user :: checked-in`);
        }
      }
    );
  }

  for (let i = 0; i < userList.length; i++) {
    User.find({ user_token: userList[i] })
      .then((data) => {
        const data_obj = {
          name: data[0].username,
          regNo: data[0].reg_number,
          email: data[0].email,
          number: data[0].contactNumber,
          event: eventName,
        };

        sendCheckInMail(data_obj);
      })
      .catch((err) => {
        // console.log({ msg: "Error fetching event", error: err });
      });
  }

  res.status(200).send({ msg: "success" });
};

module.exports = {
  postEvent,
  allEvents,
  particularEvent,
  deleteEvent,
  checkin,
  updateEvent,
};