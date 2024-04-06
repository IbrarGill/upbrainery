import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import {
  CreateNewQuestSubmissionDto,
  CreateQuestSubmissionDto,
  MarkQuest,
  SearchQuest,
  SearchQuestSubmission,
} from "./dto/create-quest-submission.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CommonFunctionsService } from "src/services/commonService";
import { isAfter } from "date-fns";

@Injectable()
export class QuestSubmissionService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  async create(
    files: Express.Multer.File,
    dto: CreateQuestSubmissionDto,
    response: Response
  ) {
    try {
      let ifAlreadyExist = await this.prisma.interactive_quiz_results.findFirst({
        where: {
          interactive_id: dto.interactive_id,
          learner_id: dto.learner_id,
          course_id: dto.course_id,
          content_session_id: dto.content_session_id,
          organization_id: dto.organization_id ?? undefined,
        }
      })
      if (ifAlreadyExist) {
        return response.status(HttpStatus.OK).json({ messsage: "Quest Already Exists" });
      }
      let video: any = files;
      let userOragnization = await this.prisma.users.findUnique({
        where: {
          id: dto.learner_id,
        },
        select: {
          organization_id: true,
        },
      });
      let QuestSubmission =
        await this.prisma.interactive_quest_submissions.create({
          data: {
            learner_id: dto.learner_id,
            course_id: dto.course_id,
            content_session_id: dto.content_session_id,
            interactive_id: dto.interactive_id,
            video_description: dto.video_description,
            organization_id: userOragnization.organization_id,
            is_submitted: true,
            submission_date: new Date(Date.now()),
            created_at: new Date(Date.now()),
          },
        });
      if (QuestSubmission) {

        response.status(HttpStatus.OK).json(QuestSubmission);
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
              type: "Quest",
              notifiable_id: dto.learner_id,
              data: `${userName.user_name} has Submitted a Quest`,
            };
            this.eventEmitter.emit("event.savenewnofication", eventData);
          }
        }
      }
      let eventData = {};

      if (video.questAttachment) {
        eventData = {
          modelId: QuestSubmission.id,
          path: video.questAttachment[0].path,
          fileName: video.questAttachment[0].filename,
          modelName: "QuestSubmission",
        };
        this.eventEmitter.emit("event.attachment", eventData);
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async newCreate(
    dto: CreateNewQuestSubmissionDto,
    response: Response
  ) {
    try {
      let ifAlreadyExist = await this.prisma.interactive_quiz_results.findFirst({
        where: {
          interactive_id: dto.interactive_id,
          learner_id: dto.learner_id,
          course_id: dto.course_id,
          content_session_id: dto.content_session_id,
          organization_id: dto.organization_id ?? undefined,
        }
      })
      if (ifAlreadyExist) {
        return response.status(HttpStatus.OK).json({ messsage: "Quest Already Exists" });
      }
      let userOragnization = await this.prisma.users.findUnique({
        where: {
          id: dto.learner_id,
        },
        select: {
          organization_id: true,
        },
      });
      let QuestSubmission =
        await this.prisma.interactive_quest_submissions.create({
          data: {
            learner_id: dto.learner_id,
            course_id: dto.course_id,
            content_session_id: dto.content_session_id,
            interactive_id: dto.interactive_id,
            video_description: dto.video_description,
            organization_id: userOragnization.organization_id,
            is_submitted: true,
            submission_date: new Date(Date.now()),
            created_at: new Date(Date.now()),
          },
        });
      if (QuestSubmission) {

        response.status(HttpStatus.OK).json(QuestSubmission);
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
              type: "Quest",
              data: `${userName.user_name} has Submitted a Quest`,
            };
            this.eventEmitter.emit("event.savenewnofication", eventData);
          }
        }
      }
      let createAttachment = await this.prisma.attachments.create({
        data: {
          attachment_type_id: dto.attachment.attachment_type_id,
          Image_key: dto.attachment.Image_key,
          path: dto.attachment.path,
          field_name: dto.attachment.path,
          attachmentable_id: QuestSubmission.id,
          attachmentable_type: "Interactives",
        }
      })
      this.eventEmitter.emit("event.updatelearnerprogress", dto.course_id, dto.learner_id, dto.content_session_id);
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchQuestSubmission, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let QuestSubmissionCount =
        await this.prisma.interactive_quest_submissions.count({
          where: {
            learner_id: query.learner_id,
            course_id: query.course_id ?? undefined,
            content_session_id: query.content_session_id ?? undefined,
            interactive_id: query.interactive_id ?? undefined,
            organization_id: query.organization_id ?? undefined,
          },
        });
      let QuestSubmissionFound: any =
        await this.prisma.interactive_quest_submissions.findMany({
          where: {
            learner_id: query.learner_id ?? undefined,
            course_id: query.course_id ?? undefined,
            content_session_id: query.content_session_id ?? undefined,
            interactive_id: query.interactive_id ?? undefined,
            organization_id: query.organization_id ?? undefined,
          },
          select: {
            id: true,
            content_session_id: true,
            course_id: true,
            is_submitted: true,
            learner_id: true,
            submission_date: true,
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
          skip: pageNo * limit,
          take: query?.limit,
        });
      if (QuestSubmissionFound) {
        for (const item of QuestSubmissionFound) {
          let attachments: any = await this.serviceFunction.getAttachments(
            item.id,
            "QuestSubmission"
          );
          item.attachments = attachments;
        }
        return response.status(HttpStatus.OK).json({
          total: QuestSubmissionCount,
          limit: limit,
          offset: pageNo,
          data: QuestSubmissionFound,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let QuestSubmissionFound =
        await this.prisma.interactive_quest_submissions.findUnique({
          where: {
            id: id,
          },
        });
      let attachments: any = await this.serviceFunction.getAttachments(
        id,
        "Interactives"
      );
      let QuestSubmissionattachments = attachments;
      if (QuestSubmissionFound) {
        return response
          .status(HttpStatus.OK)
          .json({ data: { QuestSubmissionFound, QuestSubmissionattachments } });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async SearchQuest(query: SearchQuest, response: Response) {
    try {

      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Quest",
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
     

      let quest = await this.prisma.learner_courses.findMany({
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

      let questFromContent = [];
      for (let item of quest) {
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
            questFromContent.push(value);
          }
        }
      }

      const destructuredQuest: any = await Promise.all(
        questFromContent.map(
          async ({
            id,
            content_id,
            instructor_id,
            learner_name,
            title,
            from_grade_id,
            to_grade_id,
            content_session_id,
            content_interactive_segment_id,
            session_id,
            start_date,
            end_date,
            is_assesment,
            segment_points,
            interactives,
            learner_id,
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
            start_date: await this.findQuestStartDate(content_interactive_segment_id, session_id),
            end_date: await this.findQuestEndDate(content_interactive_segment_id, session_id),
            is_assesment: await this.findQuestAssesmentStatus(content_interactive_segment_id, session_id),
            Totalpoints: await this.calculateTotalPoints(interactives.id),
            segment_points: await this.findQuestSegmentPoints(content_interactive_segment_id, session_id),
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
            learnerId: learner_id,
            learnerName: learner_name,
          })
        )
      );

      for (const item of destructuredQuest) {
        let questattachments: any = await this.serviceFunction.getAttachments(
          item.interactiveId,
          "Interactives"
        );
        item.questAttachments = questattachments;

        let attachment = await this.serviceFunction.getAttachments(
          item.learnerId,
          "User"
        );
        item.attachment = attachment;
      }
      let submittedQuest = [];
      let unsubmittedQuest = [];
      let upcomingQuest = [];
      for (let item of destructuredQuest) {
        const check = await this.checkIsSubmitted(
          item.interactiveId,
          item.content_session_id,
          query.course_id,
          item.learnerId
        );
        if (check) {
          submittedQuest.push(item);
        } else {
          if (isAfter(item.start_date, today)) {
            upcomingQuest.push(item);
          } else {
            unsubmittedQuest.push(item);
          }
        }
      }

      return response.status(HttpStatus.OK).json({
        data: { submittedQuest, unsubmittedQuest, upcomingQuest },
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async learnerQuests(query: SearchQuest, response: Response) {
    try {
      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Quest",
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


      let quest = await this.prisma.learner_courses.findMany({
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
          query.orderBy === "Latest Quests" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Quests" ? {
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

      let questFromContent = [];
      for (let item of quest) {
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
            questFromContent.push(value);
          }
        }
      }

      const destructuredQuest: any = await Promise.all(
        questFromContent.map(
          async ({
            id,
            content_id,
            instructor_id,
            learner_name,
            title,
            from_grade_id,
            to_grade_id,
            content_interactive_segment_id,
            content_session_id,
            session_id,
            interactives,
            learner_id,
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
            start_date: await this.findQuestStartDate(content_interactive_segment_id, session_id),
            end_date: await this.findQuestEndDate(content_interactive_segment_id, session_id),
            is_assesment: await this.findQuestAssesmentStatus(content_interactive_segment_id, session_id),
            Totalpoints: await this.calculateTotalPoints(interactives.id),
            segment_points: await this.findQuestSegmentPoints(content_interactive_segment_id, session_id),
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
            learnerId: learner_id,
            learnerName: learner_name,
          })
        )
      );

      for (const item of destructuredQuest) {
        let questattachments: any = await this.serviceFunction.getAttachments(
          item.interactiveId,
          "Interactives"
        );
        item.questAttachments = questattachments;

        let attachment = await this.serviceFunction.getAttachments(
          item.learnerId,
          "User"
        );
        item.learnerAttachment = attachment;
      }
      for (let item of destructuredQuest) {
        const check = await this.checkIsSubmitted(
          item.interactiveId,
          item.content_session_id,
          item.content_id,
          item.learnerId
        );
        if (check) {
          item.Submitted = true;
        } else {
          item.Submitted = false
        }
      }

      return response.status(HttpStatus.OK).json({
        data: destructuredQuest,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: MarkQuest, response: Response) {
    try {
      let QuestSubmissionUpdate =
        await this.prisma.interactive_quest_submissions.update({
          where: {
            id: id,
          },
          data: {
            marks: dto.marks,
          },
        });
      if (QuestSubmissionUpdate) {
        return response.status(HttpStatus.OK).json(QuestSubmissionUpdate);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let QuestSubmissionDelete =
        await this.prisma.interactive_quest_submissions.delete({
          where: {
            id: id,
          },
        });
      if (QuestSubmissionDelete) {
        return response.status(HttpStatus.OK).json(QuestSubmissionDelete);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async checkIsSubmitted(
    interativeId: number,
    content_session_id: number,
    course_id: number,
    learner_id: number
  ) {
    let checkSubmission =
      await this.prisma.interactive_quest_submissions.findFirst({
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

  async findSubmissionDate(
    interativeId: number,
    content_session_id: number,
    course_id: number,
    learner_id: number
  ) {
    let checkSubmission =
      await this.prisma.interactive_quest_submissions.findFirst({
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
  async findQuestStartDate(
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
  async findQuestEndDate(
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
  async findQuestAssesmentStatus(
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
  async findQuestSegmentPoints(
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

  async InstructorQuests(query: SearchQuest, response: Response) {
    try {

      const today = new Date(); // Get the current date
      today.setHours(0, 0, 0, 0);

      let interactiveTypeId = await this.prisma.interactive_types.findFirst({
        where: {
          name: "Quest",
        },
      });
      let findAssignedSessions =
        await this.prisma.instructor_sessions.findFirst({
          where: {
            instructor_id: query.instructor_id,
            session_id: query.session_id,
          },
        });
    

      let quest = await this.prisma.contents.findMany({
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

      let questFromContent = [];
      for (let item of quest) {
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
            questFromContent.push(value);
          }
        }
      }
      const destructuredQuest = await Promise.all(
        questFromContent.map(
          async ({
            id,
            content_id,
            session_id,
            instructor_id,
            start_date,
            end_date,
            is_assesment,
            segment_points,
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
            interactiveId: interactives.id,
            interactiveTitle: interactives.title,
          })
        )
      );

      return response.status(HttpStatus.OK).json({
        data: destructuredQuest,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
