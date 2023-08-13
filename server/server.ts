import { PORT } from ".";
import app from "./index";
import sequelize from "./db";

(async () => {
  // await sequelize.sync().then(() => console.log("Connected to the database"));
  app.listen(PORT);
  console.log(`Server running on http://localhost:${PORT}`);
})();
