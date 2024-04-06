import { Injectable } from "@nestjs/common";
import { CommonFunctionsService } from "src/services/commonService";
import { S3BucketService } from "src/services/s3_bucket_service";
import {
  ARModel3Ddto,
  AttachmentDto,
  NotificationsEventDto,
  SmartDeskAttachmentDto,
  UserGalleryDto,
} from "./event.dto";
import { PrismaService } from "src/prisma/prisma.client";
import { SocketIoGateway } from "src/socket_io/socket_io.gateway";
import { InstructorList } from "src/instructor/contents/session/dto/create-session.dto";
import { UpdateInstructorList } from "src/instructor/contents/session/dto/update-session.dto";

@Injectable()
export class EventService {
  constructor(
    private bucket: S3BucketService,
    private serviceFunction: CommonFunctionsService,
    private prisma: PrismaService
  ) { }

  private socket: SocketIoGateway;

  async uploadAttachmentTOS3Bucket(event: AttachmentDto) {
    let isfileUploadPathExist = await this.bucket.upload(
      event.path,
      event.fileName,
      event.modelId
    );

    if (isfileUploadPathExist) {
      let results = await Promise.all([
        this.serviceFunction.saveAttachments(
          event.modelId,
          isfileUploadPathExist.key,
          isfileUploadPathExist.url,
          event.modelName,
          event.filetype,
          event.fileName,
          event.userId
        ),
        this.serviceFunction.removeImagefromPath(event.path),
      ]);
      if (results) {
        console.log("Attachment Save Succfully!!");
      }
    }
  }

  async updatefileAttachment(event: AttachmentDto) {
    let isfileUploadPathExist = await this.bucket.upload(
      event.path,
      event.fileName,
      event.modelId
    );

    if (isfileUploadPathExist) {
      let results = await Promise.all([
        this.serviceFunction.updateAttachments(
          event.modelId,
          isfileUploadPathExist.key,
          event.modelName,
          event.filetype,
          event.fileName
        ),
        this.serviceFunction.removeImagefromPath(event.path),
      ]);
      if (results) {
        console.log("Attachment Save Succfully!!");
      }
    }
  }

  async saveDefaultAttachment(event: AttachmentDto) {
    await this.serviceFunction.saveAttachments(
      event.modelId,
      event.path,
      event.path,
      event.modelName,
      event.filetype,
      event.fileName,
      null
    );
  }

  async saveSmartDeskAttachment(event: SmartDeskAttachmentDto) {
    let isfileUploadPathExist = await this.bucket.upload(
      event.path,
      event.fileName,
      event.modelId
    );

    if (isfileUploadPathExist) {
      let results = await Promise.all([
        event.attachmentId
          ? this.serviceFunction.updateAttachments(
            event.modelId,
            isfileUploadPathExist.key,
            event.modelName,
            event.filetype,
            event.fileName
          )
          : this.serviceFunction.saveAttachments(
            event.modelId,
            isfileUploadPathExist.key,
            isfileUploadPathExist.url,
            event.modelName,
            event.filetype,
            event.fileName,
            null
          ),
        this.serviceFunction.removeImagefromPath(event.path),
      ]);
      if (results) {
        console.log("SmarkDesk Attachment Save Succfully!!");
      }
    }
  }

  //========================schedules===============
  async saveCourseDetailToUserSchedules(sessionId: number) {
    try {
      let isFound: any = await this.prisma.contents.findFirst({
        where: {
          id: sessionId,
          content_types: {
            title: "Session",
          },
        },
        select: {
          id: true,
          title: true,
          content_description: true,
          duration: true,
          from_grade_id: true,
          working_type_id: true,
          to_grade_id: true,
          from_age: true,
          to_age: true,
          content_type_id: true,
          instructor_id: true,
          availability_id: true,
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              id: true,
              is_published: true,
              course_id: true,
              content_session_details: {
                select: {
                  id: true,
                  session_type_id: true,
                  start_date: true,
                  end_date: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (isFound) {
        let course_id =
          isFound.content_sessions_content_sessions_session_idTocontents[0]
            .course_id;
        let content_session_id =
          isFound.content_sessions_content_sessions_session_idTocontents[0].id;

        let activities = [];
        let quiz = [];
        let quest = [];
        let assignment = [];

        let course: any = await this.prisma.contents.findFirst({
          where: {
            id: course_id,
            content_types: {
              title: "Course",
            },
          },
          include: {
            working_types: {
              select: {
                id: true,
                title: true,
              },
            },
            content_blocks: {
              select: {
                blocks: {
                  select: {
                    id: true,
                    title: true,
                    is_instructor_only: true,
                    description: true,
                  },
                },
              },
            },
            content_interactive_segments: {
              select: {
                id: true,
                start_date: true,
                end_date: true,
                is_assesment: true,
                segment_points: true,
                is_quiz_graded: true,
                is_quiz_offiline: true,
                interactive_id: true,
                interactives: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    interactive_types_interactives_interactive_type_idTointeractive_types:
                    {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            content_module_segments: {
              select: {
                id: true,
                module: true,
                start_date: true,
                end_date: true,
                content_module_segment_activities: {
                  select: {
                    id: true,
                    content_activity_id: true,
                    contents_content_module_segment_activities_content_activity_idTocontents:
                    {
                      select: {
                        id: true,
                        title: true,
                        content_description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        let session_learner = await this.prisma.learner_courses.findMany({
          where: {
            course_id: course_id,
            content_session_id: content_session_id,
          },
          select: {
            users: {
              select: {
                id: true,
                user_name: true,
              },
            },
          },
        });

        for (const item of course?.content_interactive_segments) {
          if (
            item?.interactives
              .interactive_types_interactives_interactive_type_idTointeractive_types
              .name === "Quiz"
          ) {
            quiz.push({
              id: item.interactives.id,
              title: item.interactives.title,
              description: item.interactives.description,
              start_date: item.start_date,
              end_date: item.end_date,
            });
          } else if (
            item?.interactives
              .interactive_types_interactives_interactive_type_idTointeractive_types
              .name === "Quest"
          ) {
            quest.push({
              id: item.interactives.id,
              title: item.interactives.title,
              description: item.interactives.description,
              start_date: item.start_date,
              end_date: item.end_date,
            });
          } else {
            assignment.push({
              id: item.interactives.id,
              title: item.interactives.title,
              description: item.interactives.description,
              start_date: item.start_date,
              end_date: item.end_date,
            });
          }
        }

        for (const _activities of course.content_module_segments) {
          for (const item of _activities.content_module_segment_activities) {
            activities.push({
              id: item
                .contents_content_module_segment_activities_content_activity_idTocontents
                .id,
              title:
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .title,
              content_description:
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .content_description,
              start_date: _activities.start_date,
              end_date: _activities.end_date,
            });
          }
        }

        for (const learner of session_learner) {
          await Promise.all([
            activities.map(async (_activities, index) => {
              await this.prisma.schedules.create({
                data: {
                  title: _activities.title,
                  description: _activities.description,
                  start_time: _activities.start_date,
                  end_time: _activities.start_date,
                  learner_id: learner.users.id,
                  instructor_id: isFound.instructor_id,
                },
              });
            }),
            quiz.map(async (quiz, index) => {
              await this.prisma.schedules.create({
                data: {
                  title: quiz.title,
                  description: quiz.description,
                  start_time: quiz.start_date,
                  end_time: quiz.start_date,
                  learner_id: learner.users.id,
                  instructor_id: isFound.instructor_id,
                },
              });
            }),
            quest.map(async (quest, index) => {
              await this.prisma.schedules.create({
                data: {
                  title: quest.title,
                  description: quest.description,
                  start_time: quest.start_date,
                  end_time: quest.start_date,
                  learner_id: learner.users.id,
                  instructor_id: isFound.instructor_id,
                },
              });
            }),
            assignment.map(async (assignment, index) => {
              await this.prisma.schedules.create({
                data: {
                  title: assignment.title,
                  description: assignment.description,
                  start_time: assignment.start_date,
                  end_time: assignment.start_date,
                  learner_id: learner.users.id,
                  instructor_id: isFound.instructor_id,
                },
              });
            }),
          ]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  //=====================Save Notification===================
  async saveNotifcationToDB(notification: NotificationsEventDto) {
    try {

      let isCreated = await this.prisma.notifications.create({
        data: {
          user_id: notification.user_id,
          type: notification.type,
          notifiable_type: notification.notifiable_type,
          notifiable_id: notification.notifiable_id,
          data: notification.data,
          is_seen: 0,
          read_at: null,
          organization_id: notification.organization_id,
          created_at: new Date().toISOString(),
        },
      });

      if (isCreated) {
        console.log("notification send!!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  //=====================New Notification===================
  async newNotifcationToDB(notification: NotificationsEventDto) {
    try {

      let isCreated = await this.prisma.notifications.create({
        data: {
          user_id: notification.sender_user_id,
          receiver_user_id: notification.receiver_user_id,
          sender_user_id: notification.sender_user_id,
          type: notification.type,
          notifiable_type: notification.notifiable_type,
          notifiable_id: notification.receiver_user_id,
          data: notification.data,
          is_seen: 0,
          read_at: null,
          organization_id: notification.organization_id,
          created_at: new Date().toISOString(),
        },
      });

      if (isCreated) {
        console.log("notification send!!");
      }
    } catch (error) {
      console.log(error);
    }
  }



  async handleusergalleryattachment(event: UserGalleryDto) {

    let isfileUploadPathExist = await this.bucket.upload(
      event.path,
      event.fileName,
      event.userId
    );

    if (isfileUploadPathExist) {
      let results = await Promise.all([
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: event.filetypeId,
            Image_key: isfileUploadPathExist.key,
            path: isfileUploadPathExist.url,
            field_name: event.fileName,
            user_id: event.userId,
            organization_id: event.organizationId,
            availability_id: event.availabilityId,
            attachmentable_id: event.userId,
            attachmentable_type: 'Gallery'
          },
        }),
        this.serviceFunction.removeImagefromPath(event.path),
      ]);
      if (results) {
        console.log("Attachment Save Succfully!!");
      }
    }
  }


  async ARModel3D(event: ARModel3Ddto) {

    let isfileUploadPathExist = await this.bucket.upload(
      event.path,
      event.fileName,
      event.attachmentable_id
    );

    let attachment_type = await this.prisma.attachment_types.findUnique({
      where: {
        name: '3D',
      },
    });

    if (isfileUploadPathExist) {
      let results = await Promise.all([
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: attachment_type.id,
            Image_key: isfileUploadPathExist.key,
            path: isfileUploadPathExist.url,
            field_name: event.fileName,
            organization_id: event.organizationId,
            attachmentable_id: event.attachmentable_id,
            attachmentable_type: 'ARModel3D'
          },
        }),
        this.serviceFunction.removeImagefromPath(event.path),
      ]);
      if (results) {
        console.log("Attachment Save Succfully!!");
      }
    }
  }

  async updateusersessionprogress(courseId: number, learnerId: number, content_session_id: number) {
    try {

      let totalquiz = 0;
      let quizFound = 0;
      let totalassignment = 0;
      let assignmentFound = 0;
      let totalquest = 0;
      let questFound = 0;
      let totalactivities = 0;
      let totalSessionDurations = 0;
      let course = await this.prisma.contents.findFirst({
        where: {
          id: courseId,
          content_types: {
            title: "Course"
          }
        },
        include: {
          badge_courses: {
            select: {
              badge_id: true
            }
          },
          content_interactive_segments: {
            select: {
              id: true,
              interactives: {
                select: {
                  id: true,
                  title: true,
                  interactive_types_interactives_interactive_type_idTointeractive_types: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          content_module_segments: {
            select: {
              id: true,
              module: true,
              start_date: true,
              end_date: true,
              content_module_segment_activities: {
                select: {
                  id: true,
                  content_activity_id: true,
                  contents_content_module_segment_activities_content_activity_idTocontents: {
                    select: {
                      id: true,
                      title: true,
                      duration: true,
                    }
                  }
                }
              }
            }
          },
        },
      });

      if (course) {

        for (const item of course?.content_interactive_segments) {
          if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {
            totalquiz++;
            let isquizFound = await this.prisma.interactive_quiz_results.findFirst({
              where: {
                learner_id: learnerId,
                interactive_id: item?.interactives.id
              },

            })
            if (isquizFound) {
              quizFound++
            }
          } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {
            totalquest++
            let isQuertFound = await this.prisma.interactive_quest_submissions.findFirst({
              where: {
                learner_id: learnerId,
                interactive_id: item?.interactives.id
              }
            })
            if (isQuertFound) {
              questFound++
            }
          } else {
            totalassignment++
            let isAssignmentFound = await this.prisma.interactive_assignment_submissions.findFirst({
              where: {
                learner_id: learnerId,
                interactive_id: item?.interactives.id
              }
            })
            if (isAssignmentFound) {
              questFound++
            }
          }
        }

        for (const _activities of course?.content_module_segments) {
          for (const item of _activities.content_module_segment_activities) {
            totalactivities++;
            totalSessionDurations = totalSessionDurations + item?.contents_content_module_segment_activities_content_activity_idTocontents.duration;
          }
        }
      }

      let learner_course_found = await this.prisma.learner_courses.findFirst({
        where: {
          course_id: courseId,
          learner_id: learnerId,
          content_session_id: content_session_id
        }
      })

      let interactiveScore;
      let activitiesScore;
      let totalGradePercentage=0;

      let found = quizFound + questFound + assignmentFound;
      let totalinteractiveInSession = totalquiz + totalquest + totalassignment;
      if (found != 0 && totalinteractiveInSession != 0) {
        interactiveScore = (found / totalinteractiveInSession) * 100
      } else {
        interactiveScore = 0
      }

      if (learner_course_found?.spend_time != 0 && totalSessionDurations != 0) {
        activitiesScore = (learner_course_found?.spend_time / totalSessionDurations) * 100
      } else {
        activitiesScore = 0
      }

      if (totalSessionDurations > 0 && totalinteractiveInSession > 0) {
        const interactiveWeight = 85;
        const activitiesWeight = 15;
        const interactive = (interactiveScore.toFixed(2) / 100) * interactiveWeight;
        const activities = (activitiesScore.toFixed(2) / 100) * activitiesWeight;
        totalGradePercentage = interactive + activities;
      } else if (totalinteractiveInSession === 0 && totalSessionDurations > 0) {
        totalGradePercentage = activitiesScore;
      } else if (totalinteractiveInSession > 0 && totalSessionDurations === 0) {
        totalGradePercentage = interactiveScore;
      }




      if (learner_course_found) {
        await this.prisma.learner_courses.update({
          where: {
            id: learner_course_found.id
          },
          data: {
            progress: parseFloat(totalGradePercentage.toFixed(0)),
            session_time: totalSessionDurations
          }
        })
        if (totalGradePercentage >= 100) {
          let session = await this.prisma.content_sessions.findUnique({
            where: {
              id: content_session_id
            },
            select: {
              contents_content_sessions_session_idTocontents: {
                select: {
                  id: true,
                  title: true,
                  organization_id: true
                }
              }
            }
          })

          for (const badge of course.badge_courses)
            await this.prisma.learner_badges.create({
              data: {
                badge_id: badge.badge_id,
                learner_id: learnerId,
                is_active: true,
                session_id: session.contents_content_sessions_session_idTocontents.id,
                organization_id: session.contents_content_sessions_session_idTocontents.organization_id,
              }
            })
        }

        console.log('Learner Progress Updated')
        await this.updateLearnerClusterProgress(learner_course_found.id, learnerId)
      }

    } catch (error) {
      console.log(error)
    }
  }

  calculateGrade() {
    try {

    } catch (error) {

    }
  }

  async sessionassignment(sessionId: number, instructorIds: InstructorList[], content_session_id: number) {
    try {
      let isFound: any = await this.prisma.contents.findFirst({
        where: {
          id: sessionId,
          content_types: {
            title: "Session"
          }
        },
        select: {
          id: true,
          title: true,
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              course_id: true,
            },
          },
        },
      });





      if (isFound) {
        let course_id = isFound.content_sessions_content_sessions_session_idTocontents[0].course_id;

        let activities = [];
        let interactiveList = [];

        let course = await this.prisma.contents.findFirst({
          where: {
            id: course_id,
            content_types: {
              title: "Course"
            }
          },
          include: {
            content_interactive_segments: {
              select: {
                id: true,
                interactive_id: true,
                interactives: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    interactive_type_id: true,
                    interactive_types_interactives_interactive_type_idTointeractive_types: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            content_module_segments: {
              select: {
                id: true,
                content_module_segment_activities: {
                  select: {
                    id: true,
                    content_activity_id: true,
                    contents_content_module_segment_activities_content_activity_idTocontents: {
                      select: {
                        id: true,
                        title: true,
                      }
                    }
                  }
                }
              }
            },
          },
        });


        for (const item of course?.content_interactive_segments) {
          if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {
            interactiveList.push({
              interactive_Id: item.interactives?.id,
              interactive_type_id: item.interactives?.interactive_type_id
            })
          } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {
            interactiveList.push({
              interactive_Id: item.interactives?.id,
              interactive_type_id: item.interactives?.interactive_type_id
            })
          } else {
            interactiveList.push({
              interactive_Id: item.interactives?.id,
              interactive_type_id: item.interactives?.interactive_type_id
            })
          }
        }


        for (const _activities of course.content_module_segments) {
          for (const item of _activities.content_module_segment_activities) {
            activities.push({
              id: item.contents_content_module_segment_activities_content_activity_idTocontents.id,
            })
          }
        }

        // mapping course to all assign instructor
        for (const item of instructorIds) {
          await this.prisma.instructor_courses.create({
            data: {
              course_id: course_id,
              instructor_id: item.instructorId,
              content_session_id: content_session_id
            }
          })

          for (const activity of activities) {
            await this.prisma.instructor_activities.create({
              data: {
                activity_id: activity?.id,
                instructor_id: item.instructorId,
                content_session_id: content_session_id
              }
            })
          }

          for (const interactive of interactiveList) {
            await this.prisma.instructor_interactives.create({
              data: {
                interactive_id: interactive?.interactive_Id,
                interactive_type_id: interactive?.interactive_type_id,
                instructor_id: item.instructorId,
                content_session_id: content_session_id
              }
            })
          }
        }

      }
    } catch (error) {
      console.log(error)
    }
  }

  async updatesessionassignment(sessionId: number, instructorIds: UpdateInstructorList[]) {
    try {
      let isFound: any = await this.prisma.contents.findFirst({
        where: {
          id: sessionId,
          content_types: {
            title: "Session"
          }
        },
        select: {
          id: true,
          title: true,
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              course_id: true,
            },
          },
        },
      });





      if (isFound) {
        let course_id = isFound.content_sessions_content_sessions_session_idTocontents[0].course_id;

        let activities = [];
        let interactiveList = [];

        let course = await this.prisma.contents.findFirst({
          where: {
            id: course_id,
            content_types: {
              title: "Course"
            }
          },
          include: {
            content_interactive_segments: {
              select: {
                id: true,
                interactive_id: true,
                interactives: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    interactive_type_id: true,
                    interactive_types_interactives_interactive_type_idTointeractive_types: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            content_module_segments: {
              select: {
                id: true,
                content_module_segment_activities: {
                  select: {
                    id: true,
                    content_activity_id: true,
                    contents_content_module_segment_activities_content_activity_idTocontents: {
                      select: {
                        id: true,
                        title: true,
                      }
                    }
                  }
                }
              }
            },
          },
        });


        for (const item of course?.content_interactive_segments) {
          if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {
            interactiveList.push({
              interactive_Id: item.interactives?.id,
              interactive_type_id: item.interactives?.interactive_type_id
            })
          } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {
            interactiveList.push({
              interactive_Id: item.interactives?.id,
              interactive_type_id: item.interactives?.interactive_type_id
            })
          } else {
            interactiveList.push({
              interactive_Id: item.interactives?.id,
              interactive_type_id: item.interactives?.interactive_type_id
            })
          }
        }


        for (const _activities of course.content_module_segments) {
          for (const item of _activities.content_module_segment_activities) {
            activities.push({
              id: item.contents_content_module_segment_activities_content_activity_idTocontents.id,
            })
          }
        }

        // mapping course to all assign instructor
        for (const item of instructorIds) {

          if (item.isDeleted) {

            let isCourseExit = await this.prisma.instructor_courses.findFirst({
              where: {
                course_id: course_id,
                instructor_id: item.instructorId
              }
            })

            await this.prisma.instructor_courses.delete({
              where: {
                id: isCourseExit.id
              }
            })

            for (const activity of activities) {
              let isActivityExit = await this.prisma.instructor_activities.findFirst({
                where: {
                  activity_id: activity?.id,
                  instructor_id: item.instructorId
                }
              })
              await this.prisma.instructor_activities.delete({
                where: {
                  id: isActivityExit.id
                }
              })
            }

            for (const interactive of interactiveList) {
              let isInteractiveExit = await this.prisma.instructor_interactives.findFirst({
                where: {
                  interactive_id: interactive?.interactive_Id,
                  interactive_type_id: interactive?.interactive_type_id,
                  instructor_id: item.instructorId
                }
              })
              await this.prisma.instructor_interactives.delete({
                where: {
                  id: isInteractiveExit.id
                }
              })
            }
          } else {

            let isCourseExit = await this.prisma.instructor_courses.findFirst({
              where: {
                course_id: course_id,
                instructor_id: item.instructorId
              }
            })
            if (!isCourseExit) {
              await this.prisma.instructor_courses.create({
                data: {
                  course_id: course_id,
                  instructor_id: item.instructorId
                }
              })
            }



            for (const activity of activities) {
              let isActivityExit = await this.prisma.instructor_activities.findFirst({
                where: {
                  activity_id: activity?.id,
                  instructor_id: item.instructorId
                }
              })
              if (!isActivityExit) {
                await this.prisma.instructor_activities.create({
                  data: {
                    activity_id: activity?.id,
                    instructor_id: item.instructorId
                  }
                })
              }


            }

            for (const interactive of interactiveList) {
              let isInteractiveExit = await this.prisma.instructor_interactives.findFirst({
                where: {
                  interactive_id: interactive?.interactive_Id,
                  interactive_type_id: interactive?.interactive_type_id,
                  instructor_id: item.instructorId
                }
              })
              if (!isInteractiveExit) {
                await this.prisma.instructor_interactives.create({
                  data: {
                    interactive_id: interactive?.interactive_Id,
                    interactive_type_id: interactive?.interactive_type_id,
                    instructor_id: item.instructorId
                  }
                })
              }
            }
          }


        }

      }
    } catch (error) {
      console.log(error)
    }
  }

  async updateLearnerClusterProgress(courseId: number, learnerId: number) {
    let learner_courses = await this.prisma.badge_courses.findMany({
      where: {
        course_id: courseId
      },
      select: {
        badges: {
          select: {
            pathway_badges: {
              select: {
                pathways: {
                  select: {
                    cluster_pathways: {
                      select: {
                        cluster_id: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    let clusterIds = [];

    // Loop through the nested structure to extract cluster_id values
    for (const learnerCourse of learner_courses) {
      for (const badge of learnerCourse.badges.pathway_badges) {
        for (const pathway of badge.pathways.cluster_pathways) {
          clusterIds.push(pathway.cluster_id);
        }
      }
    }
    let findCourseProgress = await this.prisma.learner_courses.findUnique({
      where: {
        id: courseId
      },
      select: {
        progress: true
      }
    })
    for (let item of clusterIds) {
      let update_progress = await this.prisma.clusters.update({
        where: {
          id: item.cluster_id
        },
        data: {
          progress: findCourseProgress.progress
        }
      })
    }
    console.log("Leaner Clusters Progress Updated")
  }
}
