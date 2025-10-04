import NotificationBell from "./components/NotificationSystem";
import SensorDashboard from "./components/SensorDashboard";

function App() {
  return (
    <div>
      <div className="flex justify-end p-4">
        <NotificationBell />
      </div>
      <SensorDashboard />
    </div>
  );
}

export default App;
