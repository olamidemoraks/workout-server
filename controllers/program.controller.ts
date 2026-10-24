import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import programModel, { IProgram } from "../models/program.model";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The client sends its own local date (YYYY-MM-DD) so "today" follows the
// user's timezone rather than the server's.
const parseDate = (value: unknown) =>
  typeof value === "string" && DATE_PATTERN.test(value) ? value : null;

// Ticks belong to progressDate; for any other day the program reads as
// untouched. This only shapes the response, nothing is written.
const programForDate = (program: IProgram, date: string | null) => {
  const json: any = program.toObject();
  if (date && json.progressDate !== date) {
    json.exercises = json.exercises.map((exercise: any) => ({
      ...exercise,
      completedSets: [],
    }));
    json.progressDate = date;
  }
  return json;
};

// Mongoose validation messages look like "Program validation failed: name:
// ..."; return just the first readable reason.
const errorMessage = (error: any) => {
  if (error?.name === "ValidationError") {
    const first = Object.values(error.errors ?? {})[0] as any;
    if (first?.message) return first.message;
  }
  return error?.message ?? "Something went wrong";
};

// Only accept the fields a user can edit.
const pickExercises = (exercises: unknown) =>
  Array.isArray(exercises)
    ? exercises.map((exercise: any) => ({
        ...(mongoose.isValidObjectId(exercise?._id) && { _id: exercise._id }),
        name: exercise?.name,
        sets: Number(exercise?.sets),
        reps: exercise?.reps == null ? exercise?.reps : String(exercise.reps),
      }))
    : undefined;

const findOwnedProgram = (id: string, userId: string) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return programModel.findOne({ _id: id, userId });
};

export const getPrograms = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = parseDate(req.query.date);
      const programs = await programModel
        .find({ userId: String(req.user?._id) })
        .sort("-updatedAt");

      res.status(200).json({
        success: true,
        programs: programs.map((program) => programForDate(program, date)),
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);

export const getProgram = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const program = await findOwnedProgram(
        req.params.id,
        String(req.user?._id)
      );
      if (!program) {
        return next(new ErrorHandler("Program not found", 404));
      }

      res.status(200).json({
        success: true,
        program: programForDate(program, parseDate(req.query.date)),
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);

export const createProgram = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const program = await programModel.create({
        userId: String(req.user?._id),
        name: req.body?.name,
        exercises: pickExercises(req.body?.exercises) ?? [],
      });

      res.status(201).json({
        success: true,
        message: "Program created",
        program: programForDate(program, parseDate(req.body?.date)),
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);

export const updateProgram = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const program = await findOwnedProgram(
        req.params.id,
        String(req.user?._id)
      );
      if (!program) {
        return next(new ErrorHandler("Program not found", 404));
      }

      if (req.body?.name !== undefined) {
        program.name = req.body.name;
      }

      const exercises = pickExercises(req.body?.exercises);
      if (exercises) {
        // Keep today's ticks for exercises that are still there, dropping any
        // set that no longer exists after the edit.
        const ticked = new Map(
          program.exercises.map((exercise) => [
            String(exercise._id),
            exercise.completedSets,
          ])
        );
        program.set(
          "exercises",
          exercises.map((exercise) => ({
            ...exercise,
            completedSets: (
              ("_id" in exercise && ticked.get(String(exercise._id))) ||
              []
            ).filter((index) => index < exercise.sets),
          }))
        );
      }

      await program.save();

      res.status(200).json({
        success: true,
        message: "Program updated",
        program: programForDate(program, parseDate(req.body?.date)),
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);

export const deleteProgram = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const program = await findOwnedProgram(
        req.params.id,
        String(req.user?._id)
      );
      if (!program) {
        return next(new ErrorHandler("Program not found", 404));
      }
      await program.deleteOne();

      res.status(200).json({
        success: true,
        message: "Program deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);

// Body: { exerciseId, done, date, setIndex? }. Without setIndex every set of
// the exercise is marked. `done` is the desired state rather than a toggle,
// and the writes are atomic, so quick repeated taps can't undo each other.
export const updateSetProgress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = String(req.user?._id);
      const { exerciseId, setIndex } = req.body ?? {};
      const done = req.body?.done === true;
      const date = parseDate(req.body?.date);

      if (!date) {
        return next(new ErrorHandler("A valid date is required", 400));
      }
      if (!mongoose.isValidObjectId(exerciseId)) {
        return next(new ErrorHandler("Exercise not found", 404));
      }

      const program = await findOwnedProgram(req.params.id, userId);
      const exercise = program?.exercises.id(exerciseId);
      if (!program || !exercise) {
        return next(new ErrorHandler("Exercise not found", 404));
      }

      const index = setIndex === undefined ? null : Number(setIndex);
      if (index !== null && !(Number.isInteger(index) && index >= 0 && index < exercise.sets)) {
        return next(new ErrorHandler("That set doesn't exist", 400));
      }

      // First tick of a new day: clear yesterday's ticks.
      await programModel.updateOne(
        { _id: program._id, userId, progressDate: { $ne: date } },
        { $set: { progressDate: date, "exercises.$[].completedSets": [] } }
      );

      const target = { _id: program._id, userId, "exercises._id": exerciseId };
      const allSets = Array.from({ length: exercise.sets }, (_, i) => i);
      const update =
        index === null
          ? { $set: { "exercises.$.completedSets": done ? allSets : [] } }
          : done
          ? { $addToSet: { "exercises.$.completedSets": index } }
          : { $pull: { "exercises.$.completedSets": index } };

      const updated = await programModel.findOneAndUpdate(target, update, {
        new: true,
      });
      if (!updated) {
        return next(new ErrorHandler("Exercise not found", 404));
      }

      res.status(200).json({
        success: true,
        program: programForDate(updated, date),
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);

export const resetProgramProgress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = parseDate(req.body?.date);
      if (!date) {
        return next(new ErrorHandler("A valid date is required", 400));
      }
      if (!mongoose.isValidObjectId(req.params.id)) {
        return next(new ErrorHandler("Program not found", 404));
      }

      const updated = await programModel.findOneAndUpdate(
        { _id: req.params.id, userId: String(req.user?._id) },
        { $set: { progressDate: date, "exercises.$[].completedSets": [] } },
        { new: true }
      );
      if (!updated) {
        return next(new ErrorHandler("Program not found", 404));
      }

      res.status(200).json({
        success: true,
        program: programForDate(updated, date),
      });
    } catch (error: any) {
      return next(new ErrorHandler(errorMessage(error), 400));
    }
  }
);
