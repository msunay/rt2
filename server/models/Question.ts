import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Quiz } from './Quiz'

type QuestionAssociations = 'quiz'

export class Question extends Model<
  InferAttributes<Question, {omit: QuestionAssociations}>,
  InferCreationAttributes<Question, {omit: QuestionAssociations}>
> {
  declare questionId: string
  declare question: string
  declare answerA: string
  declare answerB: string
  declare answerC: string
  declare answerD: string
  declare correctAnswer: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Question belongsTo Quiz
  declare quiz?: NonAttribute<Quiz>
  declare getQuiz: BelongsToGetAssociationMixin<Quiz>
  declare setQuiz: BelongsToSetAssociationMixin<Quiz, string>
  declare createQuiz: BelongsToCreateAssociationMixin<Quiz>
  
  declare static associations: {
    quiz: Association<Question, Quiz>
  }

  static initModel(sequelize: Sequelize): typeof Question {
    Question.init({
      questionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answerA: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answerB: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answerC: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answerD: {
        type: DataTypes.STRING,
        allowNull: false
      },
      correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      sequelize
    })
    
    return Question
  }
}
