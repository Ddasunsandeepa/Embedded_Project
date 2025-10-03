import { useState, useEffect } from "react";
import { getSensorData } from "../api/sensorAPI";

export default function SensorDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSensorData();
      setData(result);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Smart Agriculture Dashboard</h1>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Time</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Soil Moisture (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d._id}>
              <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
              <td>{d.temperature}</td>
              <td>{d.humidity}</td>
              <td>{d.soilMoisture}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
