import { app } from "./app";
import { dbconnect } from "./config/db";

app.listen(5000, () => {
  dbconnect;
  console.log("Server is running on port 5000");
});
