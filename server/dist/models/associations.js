"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = exports.ParticipationAnswer = exports.Participation = exports.Answer = exports.Question = exports.Quiz = exports.User = void 0;
const User_1 = require("./objects/User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Quiz_1 = require("./objects/Quiz");
Object.defineProperty(exports, "Quiz", { enumerable: true, get: function () { return Quiz_1.Quiz; } });
const Question_1 = require("./objects/Question");
Object.defineProperty(exports, "Question", { enumerable: true, get: function () { return Question_1.Question; } });
const Answer_1 = require("./objects/Answer");
Object.defineProperty(exports, "Answer", { enumerable: true, get: function () { return Answer_1.Answer; } });
const Participation_1 = require("./reference_tables/Participation");
Object.defineProperty(exports, "Participation", { enumerable: true, get: function () { return Participation_1.Participation; } });
const ParticipationAnswer_1 = require("./reference_tables/ParticipationAnswer");
Object.defineProperty(exports, "ParticipationAnswer", { enumerable: true, get: function () { return ParticipationAnswer_1.ParticipationAnswer; } });
function initModels(sequelize) {
    User_1.User.initModel(sequelize);
    Quiz_1.Quiz.initModel(sequelize);
    Question_1.Question.initModel(sequelize);
    Answer_1.Answer.initModel(sequelize);
    Participation_1.Participation.initModel(sequelize);
    ParticipationAnswer_1.ParticipationAnswer.initModel(sequelize);
    User_1.User.belongsToMany(Quiz_1.Quiz, {
        as: "quizzes",
        through: Participation_1.Participation,
        onDelete: "CASCADE",
    });
    Quiz_1.Quiz.belongsToMany(User_1.User, {
        as: "users",
        through: Participation_1.Participation,
        onDelete: "CASCADE",
    });
    Answer_1.Answer.belongsToMany(Participation_1.Participation, {
        as: "answers",
        through: ParticipationAnswer_1.ParticipationAnswer,
        onDelete: "CASCADE",
    });
    Participation_1.Participation.belongsToMany(Answer_1.Answer, {
        as: "participations",
        through: ParticipationAnswer_1.ParticipationAnswer,
        onDelete: "CASCADE",
    });
    Quiz_1.Quiz.hasMany(Question_1.Question);
    Question_1.Question.belongsTo(Quiz_1.Quiz);
    Question_1.Question.hasMany(Answer_1.Answer);
    Answer_1.Answer.belongsTo(Question_1.Question);
    return {
        User: User_1.User,
        Quiz: Quiz_1.Quiz,
        Question: Question_1.Question,
        Answer: Answer_1.Answer,
        Participation: Participation_1.Participation,
        ParticipationAnswer: ParticipationAnswer_1.ParticipationAnswer,
    };
}
exports.initModels = initModels;
