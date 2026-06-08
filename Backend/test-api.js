// Simple test script to check if API is working
const http = require("http");

const options = {
  hostname: "localhost",
  port: 8686,
  path: "/api/v1/shipping/destinations",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

console.log("Testing API: http://localhost:8686/api/v1/shipping/destinations");

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", data);

    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log("\n✅ API Working!");
      console.log("Total destinations:", json.data?.length || 0);
    } else {
      console.log("\n❌ API Error");
    }
  });
});

req.on("error", (error) => {
  console.error("\n❌ Connection Error:", error.message);
  console.log("\nMake sure backend is running on port 8686");
  console.log("Run: cd Backend && npm run dev");
});

req.end();
