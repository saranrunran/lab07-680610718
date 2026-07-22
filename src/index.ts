import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students, courses } from '@db/db.js';
import { type Student, type Course } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";
import type { ok } from 'node:assert';

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
// get students (by program)
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId;
    const program = req.query.program;

    if (studentId&&program) {
      let filtered_both = students.filter((student) => student.studentId === studentId&&student.program === program);
      return res.json({
        ok: true,
        data: filtered_both,
      });
    } else if(studentId) {
      let filtered_students = students.filter((student) => student.studentId === studentId);
      return res.json({
        ok: true,
        data: filtered_students,
      });
    } else if(program) {
      let filtered_program = students.filter((student) => student.program === program);
      return res.json({
        ok: true,
        data: filtered_program,
      });
    } else {
      return res.json({
        ok: true,
        count: students.length,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        ok: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      ok: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      ok: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        ok: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      ok: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      ok: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    const result = zStudentDeleteBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: `Student Id must contain 9 characters`
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex((student) => student.studentId === body.studentId);

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student does not exists",
      });
    }

    students.splice(foundIndex,1);

    return res.json({
      ok: true,
      message: `Student Id ${body.studentId} has been deleted`,
    });

  } catch (error) {
    return res.status(404).json({
      ok: false,
      message: `Student Id does not exist`,
    });
  }
});

// GET /api/me
app.get("/api/me", (req: Request, res: Response) => {
  try {
    return res.json({
      ok: true,
      fullName: `Saranporn Putsadee`,
      studentId: `680610718`
    })
  } catch (error) {
    return res.json({
      ok: false,
      message: `something wrong`
    })
  }
})

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;