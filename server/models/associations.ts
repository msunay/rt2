import { Sequelize, Model, DataTypes } from "sequelize";
import { User } from "./User";
import { Quiz } from "./Quiz";
import { Question } from "./Question";
import { Answer } from "./Answer";

export { User, Quiz, Question, Answer };

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize);
  Quiz.initModel(sequelize);
  Question.initModel(sequelize);
  Answer.initModel(sequelize);

  const participant = sequelize.define("participant", {
    isParticipant: DataTypes.BOOLEAN,
  });
  User.belongsToMany(Quiz, {
    through: participant,
    foreignKey: "users_id",
    otherKey: "quizzes_id",
  });
  Quiz.belongsToMany(User, {
    through: participant,
    foreignKey: "quizzes_id",
    otherKey: "users_id",
  });
  Quiz.hasMany(Question, {
    foreignKey: "quiz_id",
  });
  Question.belongsTo(Quiz, {
    foreignKey: "quiz_id",
  });
  Question.hasMany(Answer, {
    foreignKey: "question_id",
  });
  Answer.belongsTo(Question, {
    foreignKey: "question_id",
  });

  User.belongsToMany(Answer, {
    through: "user_answer",
    foreignKey: "users_id",
    otherKey: "answers_id",
    onDelete: "CASCADE",
  });
  Answer.belongsToMany(User, {
    through: "user_answer",
    foreignKey: "answers_id",
    otherKey: "users_id",
    onDelete: "CASCADE",
  });

  return {
    User,
    Quiz,
    Question,
    Answer,
  };
}
