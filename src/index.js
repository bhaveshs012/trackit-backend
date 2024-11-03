import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/database.js";

// dotenv configuration
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR OCCURED WHILE STARTING THE SERVER !!", error);
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port: ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => console.log("Mongo DB Connection Error ::", error));
