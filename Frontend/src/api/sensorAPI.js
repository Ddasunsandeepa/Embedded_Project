import axios from "axios";

const BASE_URL = "http://localhost:5000/api/sensor";

export const getSensorData = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};
