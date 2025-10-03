const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const sensorRoutes = require("./routes/sensorRoutes"); // your existing routes
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const SensorData = require("./models/sensorModels"); // your model

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
