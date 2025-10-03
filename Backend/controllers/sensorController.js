const SensorData = require("../models/sensorModels");

// @desc Save sensor data
// @route POST /api/sensor
const addSensorData = async (req, res) => {
  try {
    const data = new SensorData(req.body);
    await data.save();
    res.status(201).json({ message: "✅ Data saved successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "❌ Error saving data", error: err.message });
  }
};

// @desc Get latest sensor data
// @route GET /api/sensor
const getSensorData = async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "❌ Error fetching data", error: err.message });
  }
};

module.exports = { addSensorData, getSensorData };
