import { useEffect, useState } from 'react';

export default function TestApi() {
  const [message, setMessage] = useState("...Loading...");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await fetch('http://localhost:3000/api/hello');
        const data = await result.json();
        console.log("result: ", result);
        console.log("data:", data);
        setMessage(data.message);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage("Error loading message");
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Test API Route</h2>
      <p>Message: <strong>{message}</strong></p>
    </div>
  );
}