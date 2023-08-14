import { PORT } from ".";
import { server } from "./index";
import sequelize from "./db";

(async () => {
  // await sequelize.sync().then(() => console.log("Connected to the database"));
  server.listen(PORT);
  console.log(`Server running on http://localhost:${PORT}`);
})();
