import app from "./index";
import sequelize from "./db";

(async () => {
  await sequelize.sync().then(() => console.log("Connected to the database"));
  app.listen(3001);
  console.log("Server running on port 3001");
})();
