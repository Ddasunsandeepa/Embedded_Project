const express = require("express");
const router = express.Router();
const {
  addSensorData,
  getSensorData,
} = require("../controllers/sensorController");

router.post("/", addSensorData);
router.get("/", getSensorData);

module.exports = router;
