import type { Sequelize, Model } from "sequelize";
import { User } from "./User";
import { Quiz } from "./Quiz";
import { Question } from "./Question";
import { Answer } from "./Answer";
import { Participation } from "./Participation";

export { User, Quiz, Question, Answer, Participation };

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize);
  Quiz.initModel(sequelize);
  Question.initModel(sequelize);
  Answer.initModel(sequelize);
  Participation.initModel(sequelize);

  User.belongsToMany(Quiz, {
    as: "quizzes",
    through: Participation,
    onDelete: "CASCADE",
  });

  Quiz.belongsToMany(User, {
    as: "users",
    through: Participation,
    onDelete: "CASCADE",
  });

  Quiz.hasMany(Question);
  Question.belongsTo(Quiz);

  Question.hasMany(Answer);
  Answer.belongsTo(Question);

  Answer.belongsToMany(Participation, {
    as: "answers",
    through: "participation_answer",
    onDelete: "CASCADE",
  });
  Participation.belongsToMany(Answer, {
    as: "participations",
    through: "participation_answer",
    onDelete: "CASCADE",
  });

  return {
    User,
    Quiz,
    Question,
    Answer,
    Participation,
  };
}
