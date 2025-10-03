const mongoose = require("mongoose");
const mqtt = require("mqtt");
const SensorData = require("./models/sensorModels"); // your model
const connectDB = require("./config/db");

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

// No REST API needed for sensor data anymore
