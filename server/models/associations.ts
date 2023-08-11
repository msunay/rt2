import type { Sequelize, Model } from 'sequelize'
import { User } from './User'
import { Quiz } from './Quiz'
import { Question } from './Question'

export {
  User,
  Quiz,
  Question
}

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize)
  Quiz.initModel(sequelize)
  Question.initModel(sequelize)

  User.belongsToMany(Quiz, {
    as: 'quizzes',
    through: 'user_quiz',
    foreignKey: 'users_id',
    otherKey: 'quizzes_id',
    onDelete: 'CASCADE'
  })
  Quiz.belongsToMany(User, {
    as: 'users',
    through: 'user_quiz',
    foreignKey: 'quizzes_id',
    otherKey: 'users_id',
    onDelete: 'CASCADE'
  })
  
  Quiz.hasMany(Question, {
    foreignKey: 'quiz_id'
  })
  Question.belongsTo(Quiz)
  
  return {
    User,
    Quiz,
    Question
  }
}