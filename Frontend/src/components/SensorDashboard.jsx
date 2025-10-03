import { useState, useEffect } from "react";
import { getSensorData } from "../api/sensorAPI";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SensorDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSensorData();
      setData(result);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const latest = data[0] || { temperature: 0, humidity: 0, soilMoisture: 0 };

  const chartData = {
    labels: data
      .map((d) => new Date(d.timestamp).toLocaleTimeString())
      .reverse(),
    datasets: [
      {
        label: "Temperature (°C)",
        data: data.map((d) => d.temperature).reverse(),
        borderColor: "red",
        fill: false,
      },
      {
        label: "Humidity (%)",
        data: data.map((d) => d.humidity).reverse(),
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Soil Moisture (%)",
        data: data.map((d) => d.soilMoisture).reverse(),
        borderColor: "green",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sensor Trends (Last 50 readings)" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div>
      <h1>Smart Agriculture Dashboard</h1>
      <div className="dashboard">
        <div className="card">
          <h2>Temperature</h2>
          <p>{latest.temperature} °C</p>
        </div>
        <div className="card">
          <h2>Humidity</h2>
          <p>{latest.humidity} %</p>
        </div>
        <div className="card">
          <h2>Soil Moisture</h2>
          <p>{latest.soilMoisture} %</p>
        </div>
      </div>

      <Line data={chartData} options={chartOptions} />

      <table>
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
