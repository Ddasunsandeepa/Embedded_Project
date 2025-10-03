const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const sensorRoutes = require("./routes/sensorRoutes"); // your existing routes
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const SensorData = require("./models/sensorModels"); // your model

const twilio = require("twilio");

const accountSid = "ACaa58a6815b0622f720cf63840b8d7329";
const authToken = "a595a94eae1fefb091fe0d7b733067cc";
const clientTwilio = twilio(accountSid, authToken);

const sendAlert = (message, toNumber) => {
  clientTwilio.messages
    .create({
      body: message,
      from: "+12794003120", // Your Twilio number
      to: "+94778766684",
    })
    .then((msg) => console.log("✅ Alert sent:", msg.sid))
    .catch((err) => console.error("❌ Twilio error:", err));
};

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// MQTT setup
const mqttServer = "mqtt://broker.hivemq.com"; // same broker
const mqttTopic = "smartagri/sensor";

const client = mqtt.connect(mqttServer);

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  client.subscribe(mqttTopic, (err) => {
    if (!err) console.log(`Subscribed to topic: ${mqttTopic}`);
  });
});

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const sensor = new SensorData(data);
    await sensor.save();
    console.log("✅ Data saved to MongoDB:", data);

    // --- Add thresholds for alerts ---
    if (data.soilMoisture < 30) {
      sendAlert(`⚠️ Soil moisture low: ${data.soilMoisture}%`, "+94778766684");
    }
    if (data.temperature > 40) {
      sendAlert(`⚠️ High temperature: ${data.temperature}°C`, "+94778766684");
    }
  } catch (err) {
    console.error("❌ Error saving data:", err);
  }
});

// REST API routes
app.use("/api/sensor", sensorRoutes); // <-- your existing controller/routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
