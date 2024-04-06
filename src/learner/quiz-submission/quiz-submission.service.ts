import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import {
  CreateQuizSubmissionDto,
  SearchQuizes,
  SearchQuizesAnswers,
  SearchQuizResult,
  SearchQuizSubmission,
} from "./dto/create-quiz-submission.dto";
import { Response } from "express";
import { CommonFunctionsService } from "src/services/commonService";
import { isAfter, isBefore, isEqual } from "date-fns";
import { Prisma } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UpdateQuizSubmissionDto } from "./dto/update-quiz-submission.dto";
const date = Prisma;

@Injectable()
export class QuizSubmissionService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  async create(dto: CreateQuizSubmissionDto, response: Response) {
    try {
      let userOragnization = await this.prisma.users.findUnique({
        where: {
          id: dto.learner_id,
        },
        select: {
          organization_id: true,
        },
      });
      let ifAlreadyExist = await this.prisma.interactive_quiz_results.findFirst({
        where: {
          interactive_id: dto.interactive_id,
          learner_id: dto.learner_id,
          course_id: dto.course_id,
          content_session_id: dto.content_session_id,
          organization_id: dto.organization_id ?? undefined,
        }
      })

      if (ifAlreadyExist && dto.is_graded === 1) {
        return response.status(HttpStatus.OK).json({
          message: 'Quiz Submitted Already!!'
        })
      }

      if (!ifAlreadyExist
      ) {
        let createResultData = await this.prisma.interactive_quiz_results.create({
          data: {
            interactive_id: dto.interactive_id,
            learner_id: dto.learner_id,
            course_id: dto.course_id,
            content_session_id: dto.content_session_id,
            organization_id: userOragnization.organization_id,
            submission_date: new Date(Date.now()),
            created_at: new Date(Date.now()),
          },
        });

        for (let item of dto.questionOptions) {
          let QuizSubmission =
            await this.prisma.interactive_quiz_submissions.create({
              data: {
                question_id: item.question_id,
                question_option_id: item.question_option_id,
                is_correct: await this.checkOption(
                  item.question_option_id,
                  item.question_id
                ),
                interactive_quiz_result_id: createResultData.id,
                is_submitted: true,
                organization_id: userOragnization.organization_id,
                submission_date: new Date(Date.now()),
                created_at: new Date(Date.now()),
              },
            });
        }

        let totalQuestions =
          await this.prisma.interactive_quiz_submissions.findMany({
            where: {
              interactive_quiz_result_id: createResultData.id,
            },
          });
        let quizMarks = 0;
        for (let item of dto.questionOptions) {
          let findQuestionMarks = await this.prisma.questions.findUnique({
            where: {
              id: item.question_id,
            },
            select: {
              points: true,
            },
          });
          quizMarks += findQuestionMarks.points;
        }

        let totalMarks = 0;
        for (let element of totalQuestions) {
          totalMarks = totalMarks + element.is_correct;
        }

        let insertMarks = await this.prisma.interactive_quiz_results.update({
          where: {
            id: createResultData.id,
          },
          data: {
            marks: totalMarks,
            total_marks: quizMarks,
          },
        });
        if (insertMarks) {
          response.status(HttpStatus.OK).json(insertMarks);
          this.eventEmitter.emit("event.updatelearnerprogress", dto.course_id, dto.learner_id, dto.content_session_id);
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
                notifiable_type: "User",
                type: "Quiz",
                data: `${userName.user_name} has Submitted a Quiz`,
              };
              this.eventEmitter.emit("event.savenewnofication", eventData);
            }
          }
        }
      } else if (dto.is_graded === 0) {
        let findResult = await this.prisma.interactive_quiz_results.findFirst({
          where: {
            interactive_id: dto.interactive_id,
            learner_id: dto.learner_id,
            course_id: dto.course_id,
            content_session_id: dto.content_session_id,
            organization_id: dto.organization_id ?? undefined,
          },
        });

        let deletequizdetails = await this.prisma.interactive_quiz_submissions.deleteMany({
          where: {
            interactive_quiz_result_id: findResult.id
          }
        })

        for (let item of dto.questionOptions) {
          let QuizSubmission =
            await this.prisma.interactive_quiz_submissions.create({
              data: {
                question_id: item.question_id,
                question_option_id: item.question_option_id,
                is_correct: await this.checkOption(
                  item.question_option_id,
                  item.question_id
                ),
                interactive_quiz_result_id: findResult.id,
                is_submitted: true,
                organization_id: userOragnization.organization_id,
                submission_date: new Date(Date.now()),
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
              },
            });
        }

        let totalQuestions =
          await this.prisma.interactive_quiz_submissions.findMany({
            where: {
              interactive_quiz_result_id: findResult.id,
            },
          });
        let quizMarks = 0;
        for (let item of dto.questionOptions) {
          let findQuestionMarks = await this.prisma.questions.findUnique({
            where: {
              id: item.question_id,
            },
            select: {
              points: true,
            },
          });
          quizMarks += findQuestionMarks.points;
        }

        let totalMarks = 0;
        for (let element of totalQuestions) {
          totalMarks = totalMarks + element.is_correct;
        }

        let insertMarks = await this.prisma.interactive_quiz_results.update({
          where: {
            id: findResult.id,
          },
          data: {
            marks: totalMarks,
            total_marks: quizMarks,
          },
        });

        if (insertMarks) {
          response.status(HttpStatus.OK).json(insertMarks);

          this.eventEmitter.emit("event.updatelearnerprogress", dto.course_id, dto.learner_id, dto.content_session_id);
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
                notifiable_type: "User",
                type: "Quiz",
                data: `${userName.user_name} has ReSubmitted a Quiz`,
              };
              this.eventEmitter.emit("event.savenewnofication", eventData);
            }
          }
        }

      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async ReTakeQuiz(dto: UpdateQuizSubmissionDto, response: Response) {
    try {
      let userOragnization = await this.prisma.users.findUnique({
        where: {
          id: dto.learner_id,
        },
        select: {
          organization_id: true,
        },
      });
      let findResult = await this.prisma.interactive_quiz_results.findFirst({
        where: {
          interactive_id: dto.interactive_id,
          learner_id: dto.learner_id,
          course_id: dto.course_id,
          content_session_id: dto.content_session_id,
          organization_id: userOragnization.organization_id ?? undefined,
        },
      });

      let deletequizdetails = await this.prisma.interactive_quiz_submissions.deleteMany({
        where: {
          interactive_quiz_result_id: findResult.id
        }
      })

      for (let item of dto.questionOptions) {
        let QuizSubmission =
          await this.prisma.interactive_quiz_submissions.create({
            data: {
              question_id: item.question_id,
              question_option_id: item.question_option_id,
              is_correct: await this.checkOption(
                item.question_option_id,
                item.question_id
              ),
              interactive_quiz_result_id: findResult.id,
              is_submitted: true,
              organization_id: userOragnization.organization_id,
              submission_date: new Date(Date.now()),
              created_at: new Date(Date.now()),
              updated_at: new Date(Date.now()),
            },
          });
      }

      let totalQuestions =
        await this.prisma.interactive_quiz_submissions.findMany({
          where: {
            interactive_quiz_result_id: findResult.id,
          },
        });
      let quizMarks = 0;
      for (let item of dto.questionOptions) {
        let findQuestionMarks = await this.prisma.questions.findUnique({
          where: {
            id: item.question_id,
          },
          select: {
            points: true,
          },
        });
        quizMarks += findQuestionMarks.points;
      }

      let totalMarks = 0;
      for (let element of totalQuestions) {
        totalMarks = totalMarks + element.is_correct;
      }

      let insertMarks = await this.prisma.interactive_quiz_results.update({
        where: {
          id: findResult.id,
        },
        data: {
          marks: totalMarks,
          total_marks: quizMarks,
        },
      });

      if (insertMarks) {
        response.status(HttpStatus.OK).json(insertMarks);
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
              notifiable_type: "User",
              type: "Quiz",
              data: `${userName.user_name} has ReSubmitted a Quiz`,
            };
            this.eventEmitter.emit("event.savenewnofication", eventData);
          }
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchQuizSubmission, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let Result = await this.prisma.interactive_quiz_results.findMany({
        where: {
          learner_id: query.learner_id ?? undefined,
          interactive_id: query.interactive_id ?? undefined,
          course_id: query.course_id ?? undefined,
          content_session_id: query.content_session_id ?? undefined,
          organization_id: query.organization_id ?? undefined,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });

      if (!Result) {
        let QuizSubmissionFound = [];
        return response.status(HttpStatus.OK).json({
          total: 0,
          limit: limit,
          offset: pageNo,
          data: QuizSubmissionFound,
        });
      }
      let finalArray = [];

      for (let item of Result) {
        let QuizSubmissionCount =
          await this.prisma.interactive_quiz_submissions.count({
            where: {
              interactive_quiz_result_id: item.id,
              organization_id: query.organization_id ?? undefined,
            },
          });
        let QuizSubmissionFound =
          await this.prisma.interactive_quiz_submissions.findMany({
            where: {
              interactive_quiz_result_id: item.id,
              organization_id: query.organization_id ?? undefined,
            },
            skip: pageNo * limit,
            take: query?.limit,
          });
        finalArray.push(QuizSubmissionFound);
      }
      if (finalArray) {
        return response.status(HttpStatus.OK).json({
          total: finalArray.length,
          limit: limit,
          offset: pageNo,
          data: finalArray,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let QuizSubmissionFound =
        await this.prisma.interactive_quiz_submissions.findUnique({
          where: {
            id: id,
          },
        });
      if (QuizSubmissionFound) {
        return response
          .status(HttpStatus.OK)
          .json({ data: QuizSubmissionFound });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async QuizStats(query: SearchQuizResult, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? null : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? null : query?.limit;
      let QuizSubmissionCount =
        await this.prisma.interactive_quiz_results.count({
          where: {
            interactive_id: query.interactive_id ?? undefined,
            learner_id: query.learner_id ?? undefined,
          },
        });
      let QuizSubmissionFound: any =
        await this.prisma.interactive_quiz_results.findMany({
          where: {
            interactive_id: query.interactive_id ?? undefined,
            learner_id: query.learner_id ?? undefined,
          },
          select: {
            id: true,
            learner_id: true,
            interactive_id: true,
            content_session_id: true,
            course_id: true,
            marks: true,
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
          },
          skip: pageNo * limit ?? undefined,
          take: query?.limit ?? undefined,
          orderBy: {
            marks: "desc",
          },
        });
      for (let item of QuizSubmissionFound) {
        let attachments: any = await this.serviceFunction.getAttachments(
          item.learner_id,
          "User"
        );
        item.attachments = attachments;
      }
      if (QuizSubmissionFound) {
        return response.status(HttpStatus.OK).json({
          total: QuizSubmissionCount,
          limit: limit,
          offset: pageNo,
          data: QuizSubmissionFound,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async SearchQuiz(query: SearchQuizes, response: Response) {
    try {

      const today = new Date(); // Get the current date
      today.setHours(0, 0, 0, 0);
      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Quiz",
        },
      });
      let findAssignedSessions =
        await this.prisma.instructor_sessions.findFirst({
          where: {
            instructor_id: query.instructor_id,
            session_id: query.session_id,
          },
        });

      let quizCount = await this.prisma.learner_courses.count({
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

      let quiz = await this.prisma.learner_courses.findMany({
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


      let quizFromContent = [];
      for (let item of quiz) {
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
            quizFromContent.push(value);
          }
        }
      }


      const destructuredQuiz: any = await Promise.all(
        quizFromContent.map(
          async ({
            id,
            title,
            from_grade_id,
            to_grade_id,
            content_id,
            content_session_id,
            session_id,
            instructor_id,
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
            content_interactive_segment_id: content_interactive_segment_id,
            content_session_id: content_session_id,
            session_id: session_id,
            instructor_id: findAssignedSessions
              ? query.instructor_id
              : instructor_id,
            start_date: await this.findQuizStartDate(content_interactive_segment_id, session_id),
            end_date: await this.findQuizEndDate(content_interactive_segment_id, session_id),
            is_assesment: await this.findQuizAssesmentStatus(content_interactive_segment_id, session_id),
            is_quiz_graded: await this.findQuizGraded(content_interactive_segment_id, session_id),
            is_quiz_offiline: await this.findQuizOfflineStatus(content_interactive_segment_id, session_id),
            segment_points: await this.findQuizSegmentPoints(content_interactive_segment_id, session_id),
            Totalpoints: await this.calculateTotalPoints(interactives.id),
            obtaninedPoints: await this.findPoints(
              interactives.id,
              content_session_id,
              content_id,
              learner_id
            ),
            submissionDate: await this.findSubmissionDate(
              interactives.id,
              content_session_id,
              content_id,
              learner_id
            ),
            interactiveId: interactives.id,
            position: "none",
            interactiveTitle: interactives.title,
            totalQuestions: await this.calculateTotalQuestions(interactives.id),
            learnerId: learner_id,
            learnerName: learner_name,
          })
        )
      );
      for (let item of destructuredQuiz) {
        let attachment = await this.serviceFunction.getAttachments(
          item.learnerId,
          "User"
        );
        item.attachment = attachment;
      }
      let submittedQuiz = [];
      let unsubmittedQuiz = [];
      let upcomingQuiz = [];

      for (let item of destructuredQuiz) {
        const check = await this.checkIsSubmitted(
          item.interactiveId,
          item.content_session_id,
          query.course_id,
          item.learnerId
        );
        if (check) {
          submittedQuiz.push(item);
        } else {
          if (isAfter(item.start_date, today)) {
            upcomingQuiz.push(item);
          } else {
            unsubmittedQuiz.push(item);
          }
        }
      }
      return response.status(HttpStatus.OK).json({
        data: { submittedQuiz, unsubmittedQuiz, upcomingQuiz },
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let QuizSubmissionDelete =
        await this.prisma.interactive_quiz_submissions.delete({
          where: {
            id: id,
          },
        });
      if (QuizSubmissionDelete) {
        return response.status(HttpStatus.OK).json(QuizSubmissionDelete);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async checkOption(optionId: number, questionId: number) {
    if (optionId !== null) {
      let questions = await this.prisma.question_options.findMany({
        where: {
          question_id: questionId,
        },
        select: {
          id: true,
          answer: true,
          is_correct: true,
          questions: true,
        },
      });

      for (let item of questions) {
        if (item.id === optionId) {
          if (item.is_correct === true) {
            let points = await this.prisma.questions.findUnique({
              where: {
                id: item.questions.id,
              },
            });
            return points.points;
          } else {
            return 0;
          }
        }
      }
    } else {
      return 0;
    }
  }

  async SearchAnswers(query: SearchQuizesAnswers, response: Response) {
    try {
      let QuizSubmissionFound =
        await this.prisma.interactive_quiz_submissions.findMany({
          where: {
            interactive_quiz_result_id: query.result_id,
          },
        });

      let finalArray = [];
      let FalseQuestions = [];
      for (const item of QuizSubmissionFound) {
        let options: any = await this.prisma.questions.findUnique({
          where: {
            id: item.question_id,
          },
          include: {
            question_options: true,
          },
        });
        for (let value of options.question_options) {
          if (value.id === item.question_option_id) {
            value.selected = true;
          } else {
            value.selected = false;
          }
        }
        finalArray.push(options);
      }

      if (QuizSubmissionFound) {
        return response.status(HttpStatus.OK).json(finalArray);
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
    let checkSubmission = await this.prisma.interactive_quiz_results.findFirst({
      where: {
        interactive_id: interativeId,
        content_session_id: content_session_id,
        course_id: course_id,
        learner_id: learner_id,
      },
    });
    if (checkSubmission) {
      let findDate = await this.prisma.interactive_quiz_submissions.findFirst({
        where: {
          interactive_quiz_result_id: checkSubmission.id,
        },
      });
      if (findDate) {
        return findDate.submission_date;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async findPoints(
    interativeId: number,
    content_session_id: number,
    course_id: number,
    learner_id: number
  ) {
    let checkSubmission = await this.prisma.interactive_quiz_results.findFirst({
      where: {
        interactive_id: interativeId,
        content_session_id: content_session_id,
        course_id: course_id,
        learner_id: learner_id,
      },
    });
    if (checkSubmission) {
      return checkSubmission.marks;
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
    let checkSubmission = await this.prisma.interactive_quiz_results.findFirst({
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
      return null;
    }
  }
  async findQuizGraded(
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
      return checkSubmission.is_quiz_graded;
    } else {
      return null;
    }
  }
  async findQuizStartDate(
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
  async findQuizEndDate(
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
  async findQuizAssesmentStatus(
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
  async findQuizOfflineStatus(
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
      return checkSubmission.is_quiz_offiline;
    } else {
      return null;
    }
  }
  async findQuizSegmentPoints(
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

  async InstructorQuizes(query: SearchQuizes, response: Response) {
    try {

      const today = new Date(); // Get the current date
      today.setHours(0, 0, 0, 0);

      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Quiz",
        },
      });
      let findAssignedSessions =
        await this.prisma.instructor_sessions.findFirst({
          where: {
            instructor_id: query.instructor_id,
            session_id: query.session_id,
          },
        });

      let quizCount = await this.prisma.contents.count({
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

      let quiz = await this.prisma.contents.findMany({
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

      let quizFromContent = [];
      for (let item of quiz) {
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
            quizFromContent.push(value);
          }
        }
      }
      const destructuredQuiz = await Promise.all(
        quizFromContent.map(
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
        data: destructuredQuiz,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
