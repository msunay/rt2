import { initModels } from "@/models/associations";
import sequelize from "@/db";

const models = initModels(sequelize);

export default models;
