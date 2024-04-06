import { HttpStatus, Injectable } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { isAfter, isBefore, isEqual } from "date-fns";
import {
  CreateAssignmentSubmissionDto,
  SearchAssignment,
  SearchAssignmentSubmission,
} from "./dto/create-assignment-submission.dto";
import {
  MarkAssignment,
  UpdateAssignmentSubmissionDto,
} from "./dto/update-assignment-submission.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CommonFunctionsService } from "src/services/commonService";

@Injectable()
export class AssignmentSubmissionService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private serviceFunction: CommonFunctionsService
  ) { }
  async create(dto: CreateAssignmentSubmissionDto, response: Response) {
    try {
      let userOragnization = await this.prisma.users.findUnique({
        where: {
          id: dto.learner_id,
        },
        select: {
          organization_id: true,
        },
      });
      let ifAsignmentAlreadyExist = await this.prisma.interactive_assignment_results.findFirst({
        where:
        {
          course_id: dto.course_id,
          learner_id: dto.learner_id,
          content_session_id: dto.content_session_id,
          interactive_id: dto.interactive_id,
          organization_id: dto.organization_id ?? undefined
        }
      })
      if (ifAsignmentAlreadyExist) {
        let AssignmentSubmission =
          await this.prisma.interactive_assignment_submissions.create({
            data: {
              learner_id: dto.learner_id,
              course_id: dto.course_id,
              content_session_id: dto.content_session_id,
              question_id: dto.question_id,
              interactive_id: dto.interactive_id,
              answer: dto.answer,
              is_submitted: true,
              organization_id: userOragnization.organization_id,
              submission_date: new Date(Date.now()),
              total_marks: await this.calculateMarks(dto.question_id),
              assignment_result_id: ifAsignmentAlreadyExist.id,
              created_at: new Date(Date.now()),
            },
          });
        if (AssignmentSubmission) {
          response.status(HttpStatus.OK).json(AssignmentSubmission);
          this.eventEmitter.emit("event.updatelearnerprogress", dto.course_id, dto.learner_id, dto.content_session_id);
        }
      } else {
        let createAssignmentSubmission = await this.prisma.interactive_assignment_results.create({
          data: {
            course_id: dto.course_id,
            learner_id: dto.learner_id,
            content_session_id: dto.content_session_id,
            interactive_id: dto.interactive_id,
            organization_id: dto.organization_id,
            is_active: true,
            created_at: new Date(Date.now()),
          }
        })

        let AssignmentSubmission =
          await this.prisma.interactive_assignment_submissions.create({
            data: {
              learner_id: dto.learner_id,
              course_id: dto.course_id,
              content_session_id: dto.content_session_id,
              question_id: dto.question_id,
              interactive_id: dto.interactive_id,
              answer: dto.answer,
              is_submitted: true,
              organization_id: userOragnization.organization_id,
              submission_date: new Date(Date.now()),
              total_marks: await this.calculateMarks(dto.question_id),
              assignment_result_id: createAssignmentSubmission.id,
              created_at: new Date(Date.now()),
            },
          });
        if (AssignmentSubmission) {
          response.status(HttpStatus.OK).json(AssignmentSubmission);
          this.eventEmitter.emit("event.updatelearnerprogress", dto.course_id, dto.learner_id, dto.content_session_id);
        }

        let userAccountType = await this.prisma.users.findUnique({
          where: {
            id: dto.learner_id,
          },
          select: {
            account_types: {
              select: {
                name: true,
              },
            },
          },
        });
        if (userAccountType.account_types.name === "Learner") {
          let userManager = await this.prisma.user_manager.findMany({
            where: {
              user_id: dto.learner_id,
            },
            select: {
              manager_id: true,
            },
          });

          let userName = await this.prisma.users.findUnique({
            where: {
              id: dto.learner_id,
            },
            select: {
              user_name: true,
            },
          });

          for (let item of userManager) {
            let eventData = {
              organization_id: userOragnization.organization_id,
              receiver_user_id: item.manager_id,
              sender_user_id: dto.learner_id,
              user_id: item.manager_id,
              notifiable_type: "User",
              type: "Assignment",
              data: `${userName.user_name} has Submitted an Assignment`,
            };
            this.eventEmitter.emit("event.savenewnofication", eventData);


          }

        }
      }




    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchAssignmentSubmission, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let AssignmentSubmissionCount =
        await this.prisma.interactive_assignment_submissions.count({
          where: {
            learner_id: query.learner_id ?? undefined,
            course_id: query.course_id ?? undefined,
            content_session_id: query.content_session_id ?? undefined,
            interactive_id: query.interactive_id ?? undefined,
            organization_id: query.organization_id ?? undefined,
          },
        });
      let AssignmentSubmissionFound =
        await this.prisma.interactive_assignment_submissions.findMany({
          where: {
            learner_id: query.learner_id ?? undefined,
            course_id: query.course_id ?? undefined,
            content_session_id: query.content_session_id ?? undefined,
            interactive_id: query.interactive_id ?? undefined,
          },
          select: {
            id: true,
            content_session_id: true,
            course_id: true,
            question_id: true,
            answer: true,
            is_submitted: true,
            learner_id: true,
            submission_date: true,
            obtained_marks: true,
            total_marks: true,
            users: {
              select: {
                user_name: true,
              },
            },
            interactives: {
              select: {
                title: true,
              },
            },
            questions: {
              select: {
                question: true,
                points: true,
              },
            },
          },
          skip: pageNo * limit,
          take: query?.limit,
        });
      if (AssignmentSubmissionFound) {
        return response.status(HttpStatus.OK).json({
          total: AssignmentSubmissionCount,
          limit: limit,
          offset: pageNo,
          data: AssignmentSubmissionFound,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let AssignmentSubmissionFound =
        await this.prisma.interactive_assignment_submissions.findUnique({
          where: {
            id: id,
          },
        });
      if (AssignmentSubmissionFound) {
        return response.status(HttpStatus.OK).json({
          data: AssignmentSubmissionFound,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async SearchAssignment(query: SearchAssignment, response: Response) {
    try {

      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Assignment",
        },
      });

      const today = new Date(); // Get the current date
      today.setHours(0, 0, 0, 0);

      let findAssignedSessions =
        await this.prisma.instructor_sessions.findFirst({
          where: {
            instructor_id: query.instructor_id,
            session_id: query.session_id,
          },
        });
      let assignmentCount = await this.prisma.learner_courses.count({
        where: {
          learner_id: query.learner_id ?? undefined,
          content_sessions: {
            session_id: query.session_id ?? undefined,
          },
          contents: {
            id: query.course_id ?? undefined,
            content_interactive_segments: {
              some: {
                instructor_id: findAssignedSessions
                  ? undefined
                  : query.instructor_id,
              },
            },
          },
        },
      });

      let assignment = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: query.learner_id ?? undefined,
          content_sessions: {
            session_id: query.session_id ?? undefined,
          },
          contents: {
            id: query.course_id ?? undefined,
            content_interactive_segments: {
              some: {
                instructor_id: findAssignedSessions
                  ? undefined
                  : query.instructor_id,
              },
            },
          },
        },

        include: {
          users: {
            select: {
              user_name: true,
            },
          },
          content_sessions: true,
          contents: {
            include: {
              content_interactive_segments: {
                where: {
                  instructor_id: findAssignedSessions
                    ? undefined
                    : query.instructor_id,
                  interactives: {
                    id: query.interactive_id ?? undefined,
                  },
                },
                include: {
                  interactives: {
                    select: {
                      id: true,
                      interactive_type_id: true,
                      title: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let assignmentFromContent = [];
      for (let item of assignment) {
        for (let value of item.contents.content_interactive_segments) {
          if (value.interactives.interactive_type_id === interactiveTypeId.id) {
            value["learner_id"] = item.learner_id;
            value["instructor_id"] = value.instructor_id;
            value["learner_name"] = item.users.user_name;
            value["title"] = item.contents.title;
            value["from_grade_id"] = item.contents.from_grade_id;
            value["to_grade_id"] = item.contents.to_grade_id;
            value["from_grade_id"] = item.contents.from_grade_id;
            value["content_session_id"] = item.content_session_id;
            value["content_interactive_segment_id"] = value.id
            if (item.content_sessions) {
              value["session_id"] = item.content_sessions.session_id;
            }
            assignmentFromContent.push(value);
          }
        }
      }

      const destructuredAssignments: any = await Promise.all(
        assignmentFromContent.map(
          async ({
            id,
            title,
            from_grade_id,
            instructor_id,
            to_grade_id,
            content_id,
            content_session_id,
            session_id,
            content_interactive_segment_id,
            interactives,
            learner_id,
            learner_name,
          }) => ({
            id: id,
            courseTitle: title,
            fromGradeId: from_grade_id,
            toGradeId: to_grade_id,
            content_id: content_id,
            content_session_id: content_session_id,
            content_interactive_segment_id: content_interactive_segment_id,
            session_id: session_id,
            instructor_id: findAssignedSessions
              ? query.instructor_id
              : instructor_id,
            start_date: await this.findAssignmentStartDate(content_interactive_segment_id, session_id),
            end_date: await this.findAssignmentEndDate(content_interactive_segment_id, session_id),
            is_assesment: await this.findAssignmentAssesmentStatus(content_interactive_segment_id, session_id),
            segment_points: await this.findAssignmentSegmentPoints(content_interactive_segment_id, session_id),
            Totalpoints: await this.calculateTotalPoints(interactives.id),
            obtaninedPoints: await this.findObtainedPoints(
              interactives.id,
              content_session_id,
              content_id,
              learner_id
            ),
            submissionDate: await this.findSubmissionDate(
              interactives.id,
              content_session_id,
              content_id,
              query.learner_id
            ),
            interactiveId: interactives.id,
            interactiveTitle: interactives.title,
            totalQuestions: await this.calculateTotalQuestions(interactives.id),
            learnerId: learner_id,
            learnerName: learner_name,
          })
        )
      );
      for (let item of destructuredAssignments) {
        let attachment = await this.serviceFunction.getAttachments(
          item.learnerId,
          "User"
        );
        item.attachment = attachment;
      }
      let submittedAssignments = [];
      let unsubmittedAssignemnts = [];
      let upcomingAssignments = [];
      for (let item of destructuredAssignments) {
        const check = await this.checkIsSubmitted(
          item.interactiveId,
          item.content_session_id,
          query.course_id,
          item.learnerId
        );
        if (check) {
          submittedAssignments.push(item);
        } else {
          if (isAfter(item.start_date, today)) {
            upcomingAssignments.push(item);
          } else {
            unsubmittedAssignemnts.push(item);
          }
        }
      }
      return response.status(HttpStatus.OK).json({
        data: {
          submittedAssignments,
          unsubmittedAssignemnts,
          upcomingAssignments,
        },
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async learnerAssignments(query: SearchAssignment, response: Response) {
    try {

      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Assignment",
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let findAssignedSessions =
        await this.prisma.instructor_sessions.findFirst({
          where: {
            instructor_id: query.instructor_id,
            session_id: query.session_id,
          },
        });

      let assignment = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: query.learner_id ?? undefined,
          content_sessions: {
            session_id: query.session_id ?? undefined,
          },
          contents: {
            id: query.course_id ?? undefined,
            from_grade_id: {
              gte: query.from_grade_id ?? 1
            },
            to_grade_id: {
              lte: query.to_grade_id ?? 13
            },
            content_interactive_segments: {
              some: {
                instructor_id: findAssignedSessions
                  ? undefined
                  : query.instructor_id,
              },
            },

          },
        },
        orderBy: query?.orderBy ? [
          query.orderBy === "Latest Assignments" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Assignments" ? {
            id: "asc"
          } : null,
        ] : { id: 'desc' },
        include: {
          users: {
            select: {
              user_name: true,
            },
          },
          content_sessions: true,
          contents: {
            include: {
              content_interactive_segments: {
                where: {
                  instructor_id: findAssignedSessions
                    ? undefined
                    : query.instructor_id,
                  interactives: {
                    id: query.interactive_id ?? undefined,
                  },
                },
                include: {
                  interactives: {
                    select: {
                      id: true,
                      interactive_type_id: true,
                      title: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let assignmentFromContent = [];
      for (let item of assignment) {
        for (let value of item.contents.content_interactive_segments) {
          if (value.interactives.interactive_type_id === interactiveTypeId.id) {
            value["learner_id"] = item.learner_id;
            value["instructor_id"] = value.instructor_id;
            value["learner_name"] = item.users.user_name;
            value["title"] = item.contents.title;
            value["from_grade_id"] = item.contents.from_grade_id;
            value["to_grade_id"] = item.contents.to_grade_id;
            value["from_grade_id"] = item.contents.from_grade_id;
            value["content_session_id"] = item.content_session_id;
            value["content_interactive_segment_id"] = value.id
            if (item.content_sessions) {
              value["session_id"] = item.content_sessions.session_id;
            }
            assignmentFromContent.push(value);
          }
        }
      }

      const destructuredAssignments: any = await Promise.all(
        assignmentFromContent.map(
          async ({
            id,
            title,
            from_grade_id,
            instructor_id,
            to_grade_id,
            content_id,
            content_interactive_segment_id,
            content_session_id,
            session_id,
            interactives,
            learner_id,
            learner_name,
          }) => ({
            id: id,
            courseTitle: title,
            fromGradeId: from_grade_id,
            toGradeId: to_grade_id,
            content_id: content_id,
            content_interactive_segment_id: content_interactive_segment_id,
            content_session_id: content_session_id,
            session_id: session_id,
            instructor_id: findAssignedSessions
              ? query.instructor_id
              : instructor_id,
            start_date: await this.findAssignmentStartDate(content_interactive_segment_id, session_id),
            end_date: await this.findAssignmentEndDate(content_interactive_segment_id, session_id),
            is_assesment: await this.findAssignmentAssesmentStatus(content_interactive_segment_id, session_id),
            segment_points: await this.findAssignmentSegmentPoints(content_interactive_segment_id, session_id),
            Totalpoints: await this.calculateTotalPoints(interactives.id),
            obtaninedPoints: await this.findObtainedPoints(
              interactives.id,
              content_session_id,
              content_id,
              learner_id
            ),
            submissionDate: await this.findSubmissionDate(
              interactives.id,
              content_session_id,
              content_id,
              query.learner_id
            ),
            interactiveId: interactives.id,
            interactiveTitle: interactives.title,
            totalQuestions: await this.calculateTotalQuestions(interactives.id),
            learnerId: learner_id,
            learnerName: learner_name,
          })
        )
      );
      for (let item of destructuredAssignments) {
        let attachment = await this.serviceFunction.getAttachments(
          item.learnerId,
          "User"
        );
        item.learnerAttachment = attachment;
      }
      for (let item of destructuredAssignments) {
        const check = await this.checkIsSubmitted(
          item.interactiveId,
          item.content_session_id,
          item.content_id,
          item.learnerId
        );
        if (check) {
          item.Submitted = true;
        } else {
          item.Submitted = false;
        }
      }
      return response.status(HttpStatus.OK).json({
        data: destructuredAssignments
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: MarkAssignment, response: Response) {
    try {
      let AssignmentSubmissionUpdate =
        await this.prisma.interactive_assignment_submissions.update({
          where: {
            id: id,
          },
          data: {
            obtained_marks: dto.marks,
          },
        });
      if (AssignmentSubmissionUpdate) {
        return response.status(HttpStatus.OK).json(AssignmentSubmissionUpdate);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let AssignmentSubmissionDelete =
        await this.prisma.interactive_assignment_submissions.delete({
          where: {
            id: id,
          },
        });
      if (AssignmentSubmissionDelete) {
        return response.status(HttpStatus.OK).json(AssignmentSubmissionDelete);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findSubmissionDate(
    interativeId: number,
    content_session_id: number,
    course_id: number,
    learner_id: number
  ) {
    let checkSubmission =
      await this.prisma.interactive_assignment_submissions.findFirst({
        where: {
          interactive_id: interativeId,
          content_session_id: content_session_id,
          course_id: course_id,
          learner_id: learner_id,
        },
      });
    if (checkSubmission) {
      return checkSubmission.submission_date;
    } else {
      return null;
    }
  }
  async findObtainedPoints(
    interativeId: number,
    content_session_id: number,
    course_id: number,
    learner_id: number
  ) {
    let findMarks =
      await this.prisma.interactive_assignment_submissions.findMany({
        where: {
          interactive_id: interativeId,
          content_session_id: content_session_id,
          course_id: course_id,
          learner_id: learner_id,
        },
      });
    let total_marks = 0.0;
    if (findMarks) {
      for (let item of findMarks) {
        let marks = item.obtained_marks;
        total_marks += +marks;
      }
      return total_marks;
    }
  }
  async calculateMarks(question_id: number) {
    let findMarks = await this.prisma.questions.findUnique({
      where: {
        id: question_id,
      },
    });
    if (findMarks) {
      return findMarks.points;
    } else {
      return 0;
    }
  }
  async checkIsSubmitted(
    interativeId: number,
    content_session_id: number,
    course_id: number,
    learner_id: number
  ) {
    let checkSubmission =
      await this.prisma.interactive_assignment_submissions.findFirst({
        where: {
          interactive_id: interativeId,
          content_session_id: content_session_id,
          course_id: course_id,
          learner_id: learner_id,
        },
      });
    if (checkSubmission) {
      return true;
    } else {
      return false;
    }
  }
  async calculateTotalQuestions(interactiveId: number) {
    let interactiveSubjects: any =
      await this.prisma.interactive_subjects.findMany({
        where: {
          interactive_id: interactiveId,
        },
      });
    let totalQuestion = [];
    let questionIds = [];

    for (const item of interactiveSubjects) {
      let questions = await this.prisma.question_interactive_subjects.findMany({
        where: {
          interactive_subject_id: item.id,
        },
      });
      for (let item of questions) {
        questionIds.push(item.question_id);
      }
      totalQuestion = Array.from(new Set(questionIds));
    }
    return totalQuestion.length;
  }
  async calculateTotalPoints(interactiveId: number) {
    let findMarks = await this.prisma.questions.findMany({
      where: {
        question_interactive_subjects: {
          some: {
            interactive_subjects: {
              interactive_id: interactiveId,
            },
          },
        },
      },
    });
    let total_marks = 0;
    if (findMarks) {
      for (let item of findMarks) {
        let marks = item.points;
        total_marks += +marks;
      }
      return total_marks;
    }
  }
  async findAssignmentStartDate(
    content_interactive_segments_id: number,
    session_id: number,
  ) {
    let checkSubmission = await this.prisma.content_interactive_segment_sessions.findFirst({
      where: {
        session_id: session_id,
        content_interactive_segment_id: content_interactive_segments_id
      }
    })
    if (checkSubmission) {
      return checkSubmission.start_date;
    } else {
      return null;
    }
  }
  async findAssignmentEndDate(
    content_interactive_segments_id: number,
    session_id: number,
  ) {
    let checkSubmission = await this.prisma.content_interactive_segment_sessions.findFirst({
      where: {
        session_id: session_id,
        content_interactive_segment_id: content_interactive_segments_id
      }
    })
    if (checkSubmission) {
      return checkSubmission.end_date;
    } else {
      return null;
    }
  }
  async findAssignmentAssesmentStatus(
    content_interactive_segments_id: number,
    session_id: number,
  ) {
    let checkSubmission = await this.prisma.content_interactive_segment_sessions.findFirst({
      where: {
        session_id: session_id,
        content_interactive_segment_id: content_interactive_segments_id
      }
    })
    if (checkSubmission) {
      return checkSubmission.is_assesment;
    } else {
      return null;
    }
  }
  async findAssignmentSegmentPoints(
    content_interactive_segments_id: number,
    session_id: number,
  ) {
    let checkSubmission = await this.prisma.content_interactive_segment_sessions.findFirst({
      where: {
        session_id: session_id,
        content_interactive_segment_id: content_interactive_segments_id
      }
    })
    if (checkSubmission) {
      return checkSubmission.segment_points;
    } else {
      return null;
    }
  }
  async InstructorAssignments(query: SearchAssignment, response: Response) {
    try {

      const today = new Date(); // Get the current date
      today.setHours(0, 0, 0, 0);

      let findAssignedSessions =
        await this.prisma.instructor_sessions.findFirst({
          where: {
            instructor_id: query.instructor_id,
            session_id: query.session_id,
          },
        });

      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Assignment",
        },
      });
      let assignmentCount = await this.prisma.contents.count({
        where: {
          id: query.course_id ?? undefined,
          instructor_id: findAssignedSessions ? undefined : query.instructor_id,
          content_sessions_content_sessions_course_idTocontents: {
            some: {
              session_id: query.session_id ?? undefined,
            },
          },
        },
      });

      let assignment = await this.prisma.contents.findMany({
        where: {
          id: query.course_id ?? undefined,
          instructor_id: findAssignedSessions ? undefined : query.instructor_id,
          content_sessions_content_sessions_course_idTocontents: {
            some: {
              session_id: query.session_id ?? undefined,
            },
          },
        },
        include: {
          content_sessions_content_sessions_course_idTocontents: {
            where: {
              session_id: query.session_id ?? undefined,
            },
          },
          content_interactive_segments: {
            where: {
              instructor_id: findAssignedSessions
                ? undefined
                : query.instructor_id,
            },
            include: {
              interactives: {
                select: {
                  id: true,
                  interactive_type_id: true,
                  title: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      let assignmentFromContent = [];
      for (let item of assignment) {
        for (let value of item.content_interactive_segments) {
          if (value.interactives.interactive_type_id === interactiveTypeId.id) {
            value["title"] = item.title;
            value["from_grade_id"] = item.from_grade_id;
            value["to_grade_id"] = item.to_grade_id;
            value["from_grade_id"] = item.from_grade_id;
            value["content_session_id"] =
              item.content_sessions_content_sessions_course_idTocontents[0].id;
            value["session_id"] =
              item.content_sessions_content_sessions_course_idTocontents[0].session_id;
            assignmentFromContent.push(value);
          }
        }
      }
      const destructuredAssignments: any = await Promise.all(
        assignmentFromContent.map(
          async ({
            id,
            content_id,
            session_id,
            instructor_id,
            start_date,
            end_date,
            is_assesment,
            segment_points,
            is_quiz_graded,
            is_quiz_offiline,
            interactives,
            title,
            from_grade_id,
            to_grade_id,
            content_session_id,
          }) => ({
            id: id,
            instructorId: findAssignedSessions
              ? query.instructor_id
              : instructor_id,
            courseTitle: title,
            fromGradeId: from_grade_id,
            toGradeId: to_grade_id,
            content_id: content_id,
            content_session_id: content_session_id,
            session_id: session_id,
            start_date: start_date,
            end_date: end_date,
            is_assesment: is_assesment,
            Totalpoints: segment_points,
            is_quiz_graded: is_quiz_graded,
            is_quiz_offiline: is_quiz_offiline,
            interactiveId: interactives.id,
            interactiveTitle: interactives.title,
          })
        )
      );

      return response.status(HttpStatus.OK).json({
        data: destructuredAssignments,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
