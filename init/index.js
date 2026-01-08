require('dotenv').config({ path: '../.env' });
console.log("ATLASDB_URL is:", process.env.ATLASDB_URL); 

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("Connected to DB");
    await initDB();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

const initDB = async () => {
  await Listing.deleteMany({});

  const validUserId = "689df034ddc1d06bc0fe23c5";

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: validUserId,
    geometry: obj.geometry || {
      type: "Point",
      coordinates: [0, 0],
    },
  }));

  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

main();
