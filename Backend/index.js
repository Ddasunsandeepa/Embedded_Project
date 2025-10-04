const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http"); // <-- for socket.io
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const sensorRoutes = require("./routes/sensorRoutes");
const mqtt = require("mqtt");
const SensorData = require("./models/sensorModels");
const axios = require("axios");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Send SMS function
const sendAlert = async (message, toNumber) => {
  try {
    const resp = await axios.post(
      "https://519pvz.api.infobip.com/sms/2/text/advanced",
      {
        messages: [
          {
            destinations: [{ to: toNumber }],
            from: "ServiceSMS",
            text: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `App ${process.env.INFOBIP_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("✅ SMS sent:", resp.data);
  } catch (err) {
    console.error("❌ Infobip error:", err.response?.data || err.message);
  }
};

app.use(cors());
app.use(bodyParser.json());

// Connect DB
connectDB();

// MQTT setup
const mqttServer = "mqtt://broker.hivemq.com";
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

    // --- Check thresholds ---
    if (data.soilMoisture < 50) {
      const msg = `⚠️ Soil moisture low: ${data.soilMoisture}%`;
      sendAlert(msg, "94778766684"); // SMS
      io.emit("alert", msg); // Web notification
    }
    if (data.temperature > 40) {
      const msg = `⚠️ High temperature: ${data.temperature}°C`;
      sendAlert(msg, "94778766684"); // SMS
      io.emit("alert", msg); // Web notification
    }
  } catch (err) {
    console.error("❌ Error saving data:", err);
  }
});

// API routes
app.use("/api/sensor", sensorRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
