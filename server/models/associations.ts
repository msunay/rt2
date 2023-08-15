import type { Sequelize, Model } from "sequelize";
import { User } from "./objects/User";
import { Quiz } from "./objects/Quiz";
import { Question } from "./objects/Question";
import { Answer } from "./objects/Answer";
import { Participation } from "./reference_tables/Participation";
import { ParticipationAnswer } from "./reference_tables/ParticipationAnswer";

export { User, Quiz, Question, Answer, Participation, ParticipationAnswer };

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize);
  Quiz.initModel(sequelize);
  Question.initModel(sequelize);
  Answer.initModel(sequelize);
  Participation.initModel(sequelize);
  ParticipationAnswer.initModel(sequelize);

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

  Answer.belongsToMany(Participation, {
    as: "answers",
    through: ParticipationAnswer,
    onDelete: "CASCADE",
  });
  Participation.belongsToMany(Answer, {
    as: "participations",
    through: ParticipationAnswer,
    onDelete: "CASCADE",
  });

  Quiz.hasMany(Question);
  Question.belongsTo(Quiz);

  Question.hasMany(Answer);
  Answer.belongsTo(Question);

  return {
    User,
    Quiz,
    Question,
    Answer,
    Participation,
    ParticipationAnswer,
  };
}
