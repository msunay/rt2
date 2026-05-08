import type { Sequelize, Model } from 'sequelize';
import { User } from '@/models/objects/User';
import { Quiz } from '@/models/objects/Quiz';
import { Question } from '@/models/objects/Question';
import { Answer } from '@/models/objects/Answer';
import { Participation } from '@/models/reference_tables/Participation';
import { ParticipationAnswer } from '@/models/reference_tables/ParticipationAnswer';

export type { User, Quiz, Question, Answer, Participation, ParticipationAnswer };

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize);
  Quiz.initModel(sequelize);
  Question.initModel(sequelize);
  Answer.initModel(sequelize);
  Participation.initModel(sequelize);
  ParticipationAnswer.initModel(sequelize);

  User.belongsToMany(Quiz, {
    as: 'quizzes',
    through: Participation,
    onDelete: 'CASCADE',
  });
  Quiz.belongsToMany(User, {
    as: 'users',
    through: Participation,
    onDelete: 'CASCADE',
  });

  Answer.belongsToMany(Participation, {
    as: 'participiations',
    through: ParticipationAnswer,
    onDelete: 'CASCADE',
  });
  Participation.belongsToMany(Answer, {
    as: 'answers',
    through: ParticipationAnswer,
    onDelete: 'CASCADE',
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
