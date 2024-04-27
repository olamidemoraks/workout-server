"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const workout_model_1 = require("./workout.model");
// interface IWorkoutChallenge extends Document {
//   exercises: IExercise[];
// }
// const workoutChallenge = new Schema<IWorkoutChallenge>({
//   exercises: [exerciseSchema],
// });
const challengeSchema = new mongoose_1.Schema({
    title: {
        required: true,
        type: String,
    },
    premium: {
        default: false,
        type: Boolean,
    },
    days: Number,
    image: {
        public_id: String,
        url: String,
    },
    location: {
        enum: ["gym", "home", "anywhere"],
        default: "home",
        type: String,
    },
    challenges: [[workout_model_1.exerciseSchema]],
}, { timestamps: true });
const challengeModel = (0, mongoose_1.model)("Challenge", challengeSchema);
exports.default = challengeModel;
//# sourceMappingURL=challenge.model.js.map