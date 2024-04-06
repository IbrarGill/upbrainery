import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  ContentCourseBlocks,
  ContentInteractiveSegment,
  ContentModuleSegment,
  CourseAssociatedSession,
  CourseBagdes,
  CreateCourseDto,
  DuplicationCourseDto,
  EnroleCourseDto,
  SearchContentCourse,
  learnerCourseQuery,
} from "./dto/create-course.dto";
import {
  ContentBlocksCourseUpdateDto,
  ContentModuleSegmentUpdateDto,
  CourseBagdesUpdateDto,
  UpdateCourseDto,
} from "./dto/update-course.dto";
import { Response, Request } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { PrismaService } from "src/prisma/prisma.client";
import { CommonFunctionsService } from "src/services/commonService";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { learnerSessionQuery } from "../session/dto/create-session.dto";
import { title } from "process";
import { badge_courses, content_module_segments, content_standards } from "@prisma/client";
import { ActivityService } from "../activity/activity.service";
import { InteractivesService } from "src/instructor/interactives/interactives.service";
import { duration } from "moment";
@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2,
    private activityService: ActivityService,
    private interactivesService: InteractivesService
  ) { }

  async createContentCourse(
    files: Express.Multer.File,
    dto: CreateCourseDto,
    response: Response
  ) {
    try {
      let images: any = files;
      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Course",
        },
      });

      let user_org = await this.prisma.users.findFirst({
        where: { id: dto.instructor_id },
      });

      let isContentCourseCretaed = await this.prisma.contents.create({
        data: {
          title: dto.courseName,
          content_description: dto.courseDescription,
          availability_id: dto.courseAvailabilityId,
          from_grade_id: dto.startGrade,
          to_grade_id: dto.endGrade,
          from_age: dto.startAge,
          to_age: dto.endAge,
          content_type_id: content_type.id,
          instructor_id: dto.instructor_id,
          organization_id: user_org.organization_id,
          is_active: true,
          isDraft: dto.isDraft ? true : false,
          created_at: new Date().toISOString(),
        },
      });

      if (isContentCourseCretaed) {
        let isContentActivtySave = await Promise.all([
          dto.courseBagdes
            ? this.saveCourseBadges(isContentCourseCretaed.id, dto.courseBagdes)
            : null,
          dto.contentQuestSegment
            ? this.saveContentCourseInteractiveSegment(
              isContentCourseCretaed.id,
              dto.contentQuestSegment
            )
            : null,
          dto.contentQuizSegment
            ? this.saveContentCourseInteractiveSegment(
              isContentCourseCretaed.id,
              dto.contentQuizSegment
            )
            : null,
          dto.contentAssignmenttSegment
            ? this.saveContentCourseInteractiveSegment(
              isContentCourseCretaed.id,
              dto.contentAssignmenttSegment
            )
            : null,
          dto.moduleSegment
            ? this.saveContentCourseModuleSegment(
              isContentCourseCretaed.id,
              dto.moduleSegment
            )
            : null,
        ]);

        if (isContentActivtySave) {
          response.status(HttpStatus.OK).json({
            message: "Course Created Succcusfully!!",
          });
          let eventData = {};
          if (images.coursePhoto) {
            eventData = {
              modelId: isContentCourseCretaed.id,
              path: `${images.coursePhoto[0].destination}/${images.coursePhoto[0].filename}`,
              fileName: images.coursePhoto[0].filename,
              modelName: "CourseImage",
              filetype: "Image",
            };
            this.eventEmitter.emit("event.attachment", eventData);
          } else {
            eventData = {
              modelId: isContentCourseCretaed.id,
              path: process.env.Default_Image_key,
              fileName: "CourseImage",
              modelName: "CourseImage",
              filetype: "Image",
            };
            this.eventEmitter.emit("event.Defaultattachment", eventData);
          }
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async saveCourseBadges(contentId: number, badge_List: CourseBagdes[]) {
    badge_List.map(async (item, index) => {
      await this.prisma.badge_courses.create({
        data: {
          course_id: contentId,
          badge_id: item.badgesId,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      });
    });
  }



  async saveContentCourseInteractiveSegment(
    contentId: number,
    content_interactive_segments: ContentInteractiveSegment[]
  ) {
    for (const item of content_interactive_segments) {
      await this.prisma.content_interactive_segments.create({
        data: {
          content_id: contentId,
          interactive_id: item.interactive_id,
          instructor_id: item.instructor_id,
          created_at: new Date().toISOString(),
        },
      });
    };
  }

  async saveContentCourseModuleSegment(
    contentCourseId: number,
    moduleSegment: ContentModuleSegment[]
  ) {
    for (const item of moduleSegment) {
      let contentModuleSegment =
        await this.prisma.content_module_segments.create({
          data: {
            module: item.module,
            module_segment_type_id: item.module_segment_type_id,
            module_segment_delivery_id: item.module_segment_delivery_id,
            content_id: contentCourseId,
            instructor_id: item.instructor_id,
            created_at: new Date().toISOString(),
          },
        });

      for (const activities of item.activitiesList) {
        await this.prisma.content_module_segment_activities.create({
          data: {
            content_id: contentCourseId,
            content_module_segment_id: contentModuleSegment.id,
            instructor_id: item.instructor_id,
            content_activity_id: activities.content_activity_id,
            created_at: new Date().toISOString(),
          },
        });
      }
    }
  }

  async findAllcourses(query: SearchContentCourse, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let subjectList: number[] = [];
      if (query?.subjects) {
        subjectList = JSON.parse(query.subjects)
      }

      let user_org = await this.prisma.users.findFirst({ where: { id: query.instuctorId } })

      let org_content = await this.prisma.organization_contents.findFirst({
        where: {
          organization_id: user_org.organization_id
        }
      })

      let org_content_grade: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: org_content?.from_grade_id,
            lte: org_content?.to_grade_id,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });

      org_content_grade = org_content_grade.map((grade) => grade.id);

      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: query.startGrade ?? 1,
            lte: query.endGrade ?? 12,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Course",
        },
      });
      let contentCount = await this.prisma.contents.count({
        where: {
          is_active: true,
          AND: [
            {
              OR:
                [
                  {
                    instructor_id: user_org.account_type_id === 1 ? query.instuctorId : undefined,
                    availabilities: {
                      id: { in: [1, 2, 3] }
                    }
                  },
                  user_org.account_type_id === 4 ? {
                    availabilities: {
                      id: { in: [2, 3] }
                    }
                  } : null,
                  {
                    instructor_courses: {
                      some: {
                        instructor_id: query.instuctorId
                      }
                    }
                  },
                ]
            },

            {
              OR: [
                org_content ? {
                  to_grade_id: {
                    in: org_content_grade
                  },
                  from_grade_id: {
                    in: org_content_grade
                  },
                  content_type_id: conentType.id,
                  isDraft: query.status ? query.status == 'Draft' : undefined,
                  availability_id: query.AvailabilityTypeId ?? undefined,
                  organization_id: 6,
                  title: {
                    contains: query?.searchByText
                      ? query.searchByText.trim()
                      : undefined,
                  },
                } : null,
                {
                  organization_id: user_org?.organization_id,
                  content_type_id: conentType.id,
                  isDraft: query.status ? query.status == 'Draft' : undefined,
                  availability_id: query.AvailabilityTypeId ?? undefined,
                  from_grade_id: {
                    in: gradesArr
                  },
                  to_grade_id: {
                    in: gradesArr
                  },
                  title: {
                    contains: query?.searchByText
                      ? query.searchByText.trim()
                      : undefined,
                  },
                }
              ]

            },
            {
              content_module_segments: subjectList.length > 0 ? {
                some: {
                  content_module_segment_activities: {
                    some: {
                      contents_content_module_segment_activities_content_activity_idTocontents: {
                        content_subject_disciplines: {
                          some: {
                            subject_id: { in: subjectList }
                          }
                        }
                      }
                    }
                  }
                }
              } : undefined
            }
          ]
        }
      });

      let isFound: any = await this.prisma.contents.findMany({
        where: {
          is_active: true,
          AND:
            [
              {
                OR:
                  [
                    {
                      instructor_id: user_org.account_type_id === 1 ? query.instuctorId : undefined,
                      availabilities: {
                        id: { in: [1, 2, 3] }
                      }
                    },
                    user_org.account_type_id === 4 ? {
                      availabilities: {
                        id: { in: [2, 3] }
                      }
                    } : null,
                    {
                      instructor_courses: {
                        some: {
                          instructor_id: query.instuctorId
                        }
                      }
                    },

                  ]
              },
              {
                OR: [
                  org_content ? {
                    to_grade_id: {
                      in: org_content_grade
                    },
                    from_grade_id: {
                      in: org_content_grade
                    },
                    content_type_id: conentType.id,
                    isDraft: query.status ? query.status == 'Draft' : undefined,
                    availability_id: query.AvailabilityTypeId ?? undefined,
                    organization_id: 6,
                    title: {
                      contains: query?.searchByText
                        ? query.searchByText.trim()
                        : undefined,
                    },
                  } : null,
                  {
                    organization_id: user_org?.organization_id,
                    content_type_id: conentType.id,
                    isDraft: query.status ? query.status == 'Draft' : undefined,
                    availability_id: query.AvailabilityTypeId ?? undefined,
                    from_grade_id: {
                      in: gradesArr
                    },
                    to_grade_id: {
                      in: gradesArr
                    },
                    title: {
                      contains: query?.searchByText
                        ? query.searchByText.trim()
                        : undefined,
                    },
                  }
                ]

              },
              {
                content_module_segments: subjectList.length > 0 ? {
                  some: {
                    content_module_segment_activities: {
                      some: {
                        contents_content_module_segment_activities_content_activity_idTocontents: {
                          content_subject_disciplines: {
                            some: {
                              subject_id: { in: subjectList }
                            }
                          }
                        }
                      }
                    }
                  }
                } : undefined
              }
            ]
        },
        orderBy: [
          query.orderBy === "Latest Course"
            ? {
              id: "desc",
            }
            : null,
          query.orderBy === "Oldest Course"
            ? {
              id: "asc",
            }
            : null,
          query.orderBy === "Sort By A-Z"
            ? {
              title: "asc",
            }
            : null,
          query.orderBy === "Sort By Z-A"
            ? {
              title: "desc",
            }
            : null,
        ],
        skip: pageNo * limit,
        take: query?.limit ?? undefined,
        select: {
          id: true,
          title: true,
          content_description: true,
          duration: true,
          from_grade_id: true,
          to_grade_id: true,
          from_age: true,
          to_age: true,
          isDraft: true,
          instructor_id: true,
          users: {
            select: {
              id: true,
              user_name: true
            }
          },
          content_module_segments: {
            select: {
              id: true,
              module: true,
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
                      duration: true,
                      from_grade_id: true,
                      to_grade_id: true,
                      to_age: true,
                    },
                  },
                },
              },
            },
          },
          content_sessions_content_sessions_course_idTocontents: {
            select: {
              contents_content_sessions_session_idTocontents: {
                select: {
                  id: true,
                  title: true,
                  is_active: true,

                }
              },
              content_session_details: {
                select: {
                  start_date: true,
                  end_date: true,
                  session_types: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
        },
      });


      if (isFound) {
        for (const item of isFound) {
          let sessionAttached = [];
          let createdbyAttachment = await this.serviceFunction.getAttachments(
            item.users.id,
            "User"
          );
          item.users.image_url = createdbyAttachment?.path;

          let attachments = await this.serviceFunction.getAttachments(
            item.id,
            "CourseImage"
          );
          item.attachments = attachments;
          let courseDuration = 0;
          for (const module of item.content_module_segments) {
            for (const activities of module.content_module_segment_activities) {
              courseDuration =
                courseDuration +
                activities
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .duration;
            }
          }
          item.duration = courseDuration;
          delete item.content_module_segments;

          for (const course of item?.content_sessions_content_sessions_course_idTocontents) {
            if (course?.contents_content_sessions_session_idTocontents.is_active === true) {
              const combinedObject = { ...course?.contents_content_sessions_session_idTocontents, ...course?.content_session_details[0] };
              sessionAttached.push(combinedObject)
            }
          }
          delete item?.content_sessions_content_sessions_course_idTocontents;
          item.sessionAttached = sessionAttached;

        }

        response.status(HttpStatus.OK).json({
          total: contentCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException(
          "Content Course Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getCoursefilters(instuctorId: number, response: Response) {
    try {
      const subjectsKeyMap = new Map();
      const availabilitiesKeyMap = new Map();
      let subjectList = [];
      let availabilitiesList = [];

      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Course",
        },
      });

      let user_org = await this.prisma.users.findFirst({ where: { id: instuctorId } })

      let grades = await this.prisma.grades.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      let org_content = await this.prisma.organization_contents.findFirst({
        where: {
          organization_id: user_org.organization_id
        }
      })

      let org_content_grade: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: org_content?.from_grade_id,
            lte: org_content?.to_grade_id,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });

      org_content_grade = org_content_grade.map((grade) => grade.id);

      let filtersfound = await this.prisma.contents.findMany({
        where: {
          is_active: true,
          AND: [
            {
              OR:
                [
                  {
                    instructor_id: instuctorId,
                    availabilities: {
                      id: { in: [1, 2, 3] }
                    }
                  },
                  user_org.account_type_id === 4 ? {
                    availabilities: {
                      id: { in: [2, 3] }
                    }
                  } : null,
                  {
                    instructor_courses: {
                      some: {
                        instructor_id: instuctorId
                      }
                    }
                  },
                  org_content ? {
                    to_grade_id: {
                      in: org_content_grade
                    },
                    from_grade_id: {
                      in: org_content_grade
                    },
                    content_type_id: conentType.id,
                    organization_id: 6
                  } : {},
                ]
            },
            {
              content_type_id: conentType.id,
            },


          ]
        },
        select: {
          duration: true,
          to_age: true,
          from_age: true,
          content_module_segments: {
            select: {
              content_module_segment_activities: {
                select: {
                  contents_content_module_segment_activities_content_activity_idTocontents:
                  {
                    select: {
                      content_subject_disciplines: {
                        select: {
                          subjects: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                          subject_disciplines: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          availabilities: true,
        }
      });

      if (filtersfound) {
        for (const item of filtersfound) {

          const availabilitieskey = `${item.availabilities.id}-${item.availabilities.title}`;
          if (!availabilitiesKeyMap.has(availabilitieskey)) {
            availabilitiesKeyMap.set(availabilitieskey, true);
            availabilitiesList.push({
              id: item.availabilities.id,
              title: item.availabilities.title
            })
          }

          for (const _activities of item.content_module_segments) {
            for (const item of _activities.content_module_segment_activities) {
              item.contents_content_module_segment_activities_content_activity_idTocontents.content_subject_disciplines.forEach(
                (element) => {
                  const subjectkey = `${element.subjects.id}`;
                  if (!subjectsKeyMap.has(subjectkey)) {
                    subjectsKeyMap.set(subjectkey, true);
                    subjectList.push({
                      id: element.subjects.id,
                      title: element.subjects.name
                    })
                  }
                }
              );
            }
          }
        }

        response.status(HttpStatus.OK).json({
          filters: {
            grades,
            subjectList,
            availabilitiesList,
          }
        })
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async findOneCourse(id: number, response: Response) {
    try {
      let activities = [];
      let quiz = [];
      let quest = [];
      let assignment = [];
      let skills = [];
      let standards = [];
      let subjects = [];
      let vocabularies = [];
      const skillKeyMap = new Map();

      let isFound: any = await this.prisma.contents.findFirst({
        where: {
          id: id,
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
          badge_courses: {
            select: {
              id: true,
              badge_id: true,
              badges: {
                select: {
                  id: true,
                  name: true,
                }
              },
              course_id: true,
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
              interactives: {
                select: {
                  id: true,
                  title: true,
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
              module_segment_types: {
                select: {
                  id: true,
                  title: true,
                },
              },
              module_segment_deliveries: {
                select: {
                  id: true,
                  title: true,
                },
              },
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
                      duration: true,
                      from_grade_id: true,
                      to_grade_id: true,
                      to_age: true,

                      content_skills: {
                        select: {
                          skills: {
                            select: {
                              title: true,
                            },
                          },
                          sub_skills: {
                            select: {
                              title: true,
                            },
                          },
                          skill_points: true,
                        },
                      },
                      content_standards: {
                        select: {
                          standards: {
                            select: {
                              id: true,
                              title: true,
                              standard_types: {
                                select: {
                                  id: true,
                                  title: true,
                                },
                              },
                              standard_levels: {
                                select: {
                                  id: true,
                                  title: true,
                                },
                              },
                              standard_subjects: {
                                select: {
                                  id: true,
                                  title: true,
                                },
                              },
                            },
                          },
                        },
                      },
                      content_subject_disciplines: {
                        select: {
                          subjects: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                          subject_disciplines: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                      content_vocabularies: {
                        select: {
                          id: true,
                          vocabulary: true,
                          vocabulary_definition: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (isFound) {
        let CourseImage: any = await this.serviceFunction.getAttachments(
          isFound.id,
          "CourseImage"
        );
        isFound.attachments = CourseImage;

        for (const item of isFound.content_blocks) {
          const attachments = await this.serviceFunction.getmultipleAttachments(
            item.blocks.id,
            "block"
          );
          item.blocks.attachments = attachments;
        }

        for (const item of isFound.badge_courses) {
          const attachments = await this.serviceFunction.getAttachments(
            item.badge_id,
            "BadgeImage"
          );
          item.attachments = attachments;
        }

        for (const item of isFound.content_interactive_segments) {
          if (
            item.interactives
              .interactive_types_interactives_interactive_type_idTointeractive_types
              .name === "Quiz"
          ) {
            quiz.push({
              content_interactive_segments_id: item.id,
              interactive_Id: item.interactives.id,
              title: item.interactives.title,
            });
          } else if (
            item.interactives
              .interactive_types_interactives_interactive_type_idTointeractive_types
              .name === "Quest"
          ) {
            quest.push({
              content_interactive_segments_id: item.id,
              interactive_Id: item.interactives.id,
              title: item.interactives.title,
            });
          } else {
            assignment.push({
              content_interactive_segments_id: item.id,
              interactive_Id: item.interactives.id,
              title: item.interactives.title,
            });
          }
        }

        for (const _activities of isFound.content_module_segments) {
          for (const item of _activities.content_module_segment_activities) {
            let activity_attachments: any =
              await this.serviceFunction.getAttachments(
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .id,
                "Activity"
              );
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
              duration:
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .duration,
              from_grade_id:
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .from_grade_id,
              to_grade_id:
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .to_grade_id,
              to_age:
                item
                  .contents_content_module_segment_activities_content_activity_idTocontents
                  .to_age,
              attachments: activity_attachments,
            });

            item.contents_content_module_segment_activities_content_activity_idTocontents.content_skills.forEach(
              (element) => {
                // Create a unique key for each skill based on skills, sub_skills, and skill_points
                const key = `${element.skills.title}-${element.sub_skills.title}`;

                // Check if the key is already present in the map
                if (!skillKeyMap.has(key)) {
                  // If not present, add the key to the map and push the skill object to the result array
                  skillKeyMap.set(key, true);
                  skills.push({
                    skills: element.skills.title,
                    sub_skills: element.sub_skills.title,
                    skill_points: element.skill_points,
                  })
                }



              }
            );

            item.contents_content_module_segment_activities_content_activity_idTocontents.content_standards.forEach(
              (element) => standards.push(element)
            );
            item.contents_content_module_segment_activities_content_activity_idTocontents.content_subject_disciplines.forEach(
              (element) => subjects.push(element)
            );
            item.contents_content_module_segment_activities_content_activity_idTocontents.content_vocabularies.forEach(
              (element) => vocabularies.push(element)
            );
          }
        }
        delete isFound.content_interactive_segments;
        isFound.quiz = quiz;
        isFound.quest = quest;
        isFound.assignment = assignment;
        isFound.activities = activities;

        isFound.skills = skills;
        isFound.standards = standards;
        isFound.vocabularies = vocabularies;
        isFound.activities = activities;

        response.status(HttpStatus.OK).json(isFound);
      } else {
        throw new HttpException(
          "Content Activity Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updatecourse(
    files: Express.Multer.File,
    courseId: number,
    dto: UpdateCourseDto,
    response: Response
  ) {
    try {
      let images: any = files;
      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Course",
        },
      });
      let course = await this.prisma.contents.findUnique({
        where: {
          id: courseId,
        },
        include: {
          content_module_segments: {
            select: {
              content_module_segment_activities: {
                select: {
                  id: true,
                  content_activity_id: true,
                  contents_content_module_segment_activities_content_activity_idTocontents:
                  {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let ExitingActivity = [];
      for (const content_module_segment_activities of course.content_module_segments) {
        for (const activities of content_module_segment_activities.content_module_segment_activities) {
          ExitingActivity.push(activities.content_activity_id);
        }
      }

      if (course) {
        let isupdated = await this.prisma.contents.update({
          where: {
            id: courseId,
          },
          data: {
            title: dto.courseName ?? course.title,
            content_description:
              dto.courseDescription ?? course.content_description,
            availability_id: dto.courseAvailabilityId ?? course.availability_id,
            from_grade_id: dto.startGrade ?? course.from_grade_id,
            to_grade_id: dto.endGrade ?? course.to_grade_id,
            from_age: dto.startAge ?? course.from_age,
            to_age: dto.endAge ?? course.to_age,
            isDraft: dto.isDraft ? true : false,
            updated_at: new Date().toISOString(),
          },
        });

        if (isupdated) {
          let isallupdated = await Promise.all([
            dto.coursebadges
              ? this.updateCourseBadges(courseId, dto.coursebadges)
              : null,
            dto.contentQuestSegment
              ? this.updateContentCourseInteractiveSegment(
                courseId,
                dto.contentQuestSegment
              )
              : null,
            dto.contentQuestSegment
              ? this.updateContentCourseInteractiveSegment(
                courseId,
                dto.contentQuizSegment
              )
              : null,
            dto.contentAssignmenttSegment
              ? this.updateContentCourseInteractiveSegment(
                courseId,
                dto.contentAssignmenttSegment
              )
              : null,
            dto.moduleSegment
              ? this.updateContentCourseModuleSegment(
                courseId,
                dto.moduleSegment,
                ExitingActivity
              )
              : null,
          ]);

          if (isallupdated) {
            this.findOneCourse(courseId, response);
            if (images.coursePhoto) {
              let eventData = {
                modelId: courseId,
                path: `${images.coursePhoto[0].destination}/${images.coursePhoto[0].filename}`,
                fileName: images.coursePhoto[0].filename,
                modelName: "CourseImage",
                filetype: "Image",
              };
              this.eventEmitter.emit("event.updateattachment", eventData);
            }
          } else {
            throw new HttpException(
              "Content Course Not Updated!!",
              HttpStatus.NOT_FOUND
            );
          }
        }
      } else {
        throw new HttpException(
          "Content Course Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async removeCourse(id: number, response: Response) {
    try {

      // let isFoundSession = await this.prisma.contents.findFirst({
      //   where: {
      //     content_sessions_content_sessions_session_idTocontents: {
      //       some: {
      //         course_id: id
      //       }
      //     }
      //   },
      // });

      // if (isFoundSession) {
      //   throw new HttpException(
      //     "Content Course Cannot be Deleted !!",
      //     HttpStatus.BAD_REQUEST
      //   );
      // } else {
      let isFound = await this.prisma.contents.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      if (isFound) {
        response.status(HttpStatus.OK).json({ message: 'Course Deleted Succusfully!!' });
      } else {
        throw new HttpException(
          "Content Course Not Found!!",
          HttpStatus.BAD_REQUEST
        );
      }
      //}


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateCourseBadges(
    contentId: number,
    badge_List: CourseBagdesUpdateDto[]
  ) {

    await this.prisma.badge_courses.deleteMany({
      where: {
        course_id: contentId,
      },
    });

    badge_List.map(async (item, index) => {
      await this.prisma.badge_courses.create({
        data: {
          course_id: contentId,
          badge_id: item.badgesId,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      });
    });
  }



  async updateContentCourseInteractiveSegment(
    contentId: number,
    content_interactive_segments: ContentInteractiveSegment[]
  ) {

    await Promise.all([
      await this.prisma.content_interactive_segments.deleteMany({
        where: {
          content_id: contentId,
        },
      }),
      content_interactive_segments.map(async (item, index) => {
        await this.prisma.content_interactive_segments.create({
          data: {
            content_id: contentId,
            interactive_id: item.interactive_id,
            instructor_id: item.instructor_id,
            created_at: new Date().toISOString(),
          },
        });
      }),
    ]);
  }
  async updateContentCourseModuleSegment(
    contentCourseId: number,
    moduleSegment: ContentModuleSegmentUpdateDto[],
    ExitingActivity: number[]
  ) {
    for (const item of moduleSegment) {
      if (item.content_module_segment_id) {
        if (item.isDeleted) {
          await this.prisma.content_module_segments.delete({
            where: {
              id: item.content_module_segment_id,
            },
          });
        } else {
          let contentModuleSegment =
            await this.prisma.content_module_segments.update({
              where: {
                id: item.content_module_segment_id,
              },
              data: {
                module: item.module,
                module_segment_type_id: item.module_segment_type_id,
                module_segment_delivery_id: item.module_segment_delivery_id,
                content_id: contentCourseId,
                instructor_id: item.instructor_id,
                created_at: new Date().toISOString(),
              },
            });

          item.activitiesList.map(async (activities, index) => {
            if (activities.isDeleted) {

              const deletedRecords =
                await this.prisma.content_module_segment_activities.deleteMany({
                  where: {
                    AND: [
                      { content_activity_id: activities.content_activity_id },
                      { content_id: contentCourseId },
                      { instructor_id: item.instructor_id },
                    ],
                  },
                });

            } else {
              if (!ExitingActivity.includes(activities.content_activity_id)) {

                await this.prisma.content_module_segment_activities.create({
                  data: {
                    content_id: contentCourseId,
                    content_module_segment_id: contentModuleSegment.id,
                    instructor_id: item.instructor_id,
                    content_activity_id: activities.content_activity_id,
                    created_at: new Date().toISOString(),
                  },
                });
              }
            }
          });
        }
      } else {
        let contentModuleSegment =
          await this.prisma.content_module_segments.create({
            data: {
              module: item.module,
              module_segment_type_id: item.module_segment_type_id,
              module_segment_delivery_id: item.module_segment_delivery_id,
              content_id: contentCourseId,
              instructor_id: item.instructor_id,
              created_at: new Date().toISOString(),
            },
          });

        for (const activities of item.activitiesList) {
          await this.prisma.content_module_segment_activities.create({
            data: {
              content_id: contentCourseId,
              content_module_segment_id: contentModuleSegment.id,
              instructor_id: item.instructor_id,
              content_activity_id: activities.content_activity_id,
              created_at: new Date().toISOString(),
            },
          });
        }
      }
    }
  }

  async enrolecoursewithindividualleaner(
    dto: EnroleCourseDto,
    response: Response
  ) {
    try {
      let isSessionExit = await this.prisma.contents.findFirst({
        where: {
          content_sessions_content_sessions_course_idTocontents: {
            some: {
              course_id: dto.courseId,
            },
          },
        },
        select: {
          title: true,
          content_sessions_content_sessions_course_idTocontents: {
            select: {
              id: true,
            },
          },
        },
      });
      if (isSessionExit) {
        let isEnroleAlready = await this.prisma.learner_courses.findFirst({
          where: {
            course_id: dto.courseId,
            learner_id: dto.learnerId,
            content_session_id:
              isSessionExit
                .content_sessions_content_sessions_course_idTocontents[0].id,
          },
        });

        if (isEnroleAlready) {
          response.status(HttpStatus.OK).json({
            message: "Already Enrole",
          });
        } else {
          let isCourseEnrole = await this.prisma.learner_courses.create({
            data: {
              course_id: dto.courseId,
              learner_id: dto.learnerId,
              content_session_id:
                isSessionExit
                  .content_sessions_content_sessions_course_idTocontents[0].id,
              created_at: new Date().toISOString(),
            },
          });
          if (isCourseEnrole) {
            response.status(HttpStatus.OK).json({
              message: "Course Enrole Succusfully!!",
            });
            let userAccountType = await this.prisma.users.findUnique({
              where: {
                id: dto.learnerId,
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
              let userOragnization = await this.prisma.users.findUnique({
                where: {
                  id: dto.learnerId,
                },
                select: {
                  organization_id: true,
                },
              });
              let userManager = await this.prisma.user_manager.findMany({
                where: {
                  user_id: dto.learnerId,
                },
                select: {
                  manager_id: true,
                },
              });

              let userName = await this.prisma.users.findUnique({
                where: {
                  id: dto.learnerId,
                },
                select: {
                  user_name: true,
                },
              });

              for (let item of userManager) {
                let eventData = {
                  organization_id: userOragnization.organization_id,
                  receiver_user_id: item.manager_id,
                  sender_user_id: dto.learnerId,
                  notifiable_type: "User",
                  type: "Course",
                  data: `${userName.user_name} has enrolled your ${isSessionExit.title}`,
                };
                this.eventEmitter.emit("event.savenewnofication", eventData);
              }
            }
          } else {
            throw new HttpException(
              "Something went wroung!!",
              HttpStatus.NOT_FOUND
            );
          }
        }
      } else {
        throw new HttpException(
          "Course Dont have any Session!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findallcourserelatedtoIndividualleaner(
    query: learnerCourseQuery,
    response: Response
  ) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let subjectlist = [];
      const subjectlistKeyMap = new Map();
      let learner_session_count = await this.prisma.learner_courses.count({
        where: {
          learner_id: query.learnerId,
          contents: {
            title: {
              contains: query?.searchByText
                ? query.searchByText.trim()
                : undefined,
            },
            content_module_segments: query.subjectId > 0 ? {
              some: {
                content_module_segment_activities: {
                  some: {
                    contents_content_module_segment_activities_content_activity_idTocontents: {
                      content_subject_disciplines: {
                        some: {
                          subject_id: query.subjectId
                        }
                      }
                    }
                  }
                }
              }
            } : undefined

          }
        },
      });

      let learner_session: any = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: query.learnerId,
          contents: {
            title: {
              contains: query?.searchByText
                ? query.searchByText.trim()
                : undefined,
            },
            content_module_segments: query.subjectId > 0 ? {
              some: {
                content_module_segment_activities: {
                  some: {
                    contents_content_module_segment_activities_content_activity_idTocontents: {
                      content_subject_disciplines: {
                        some: {
                          subject_id: query.subjectId
                        }
                      }
                    }
                  }
                }
              }
            } : undefined
          }
        },
        orderBy: query?.orderBy ? [
          query.orderBy === "Latest Course"
            ? {
              id: "desc",
            }
            : null,
          query.orderBy === "Oldest Course"
            ? {
              id: "asc",
            }
            : null,
          query.orderBy === "Sort By A-Z"
            ? {
              content_sessions: {
                contents_content_sessions_session_idTocontents: {
                  title: 'asc'
                }
              },
            }
            : null,
          query.orderBy === "Sort By Z-A"
            ? {
              content_sessions: {
                contents_content_sessions_session_idTocontents: {
                  title: 'desc'
                }
              },
            }
            : null,
        ] : [
          {
            id: "desc",
          }
        ],
        skip: pageNo * limit,
        take: query?.limit ?? undefined,
        select: {
          progress: true,
          contents: {
            select: {
              id: true,
              title: true,
              content_module_segments: {
                select: {
                  content_module_segment_activities: {
                    select: {
                      contents_content_module_segment_activities_content_activity_idTocontents: {
                        select: {
                          duration: true,
                          content_subject_disciplines: {
                            select: {
                              subjects: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          content_sessions: {
            select: {
              contents_content_sessions_course_idTocontents: {
                select: {
                  id: true,
                  title: true,
                }
              },
              contents_content_sessions_session_idTocontents: {
                select: {
                  id: true,
                  title: true,
                  content_description: true,
                  from_grade_id: true,
                  to_grade_id: true,
                  to_age: true,
                  from_age: true,
                  duration: true,
                  instructor_id: true,
                  users: {
                    select: {
                      id: true,
                      user_name: true,
                    }
                  }
                },
              },
              content_session_details: {
                select: {
                  start_date: true,
                  end_date: true,
                },
              },
            },
          },
        },
      });

      let learner_session_subjectList = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: query.learnerId,
        },
        select: {
          contents: {
            select: {
              content_module_segments: {
                select: {
                  content_module_segment_activities: {
                    select: {
                      contents_content_module_segment_activities_content_activity_idTocontents: {
                        select: {
                          duration: true,
                          content_subject_disciplines: {
                            select: {
                              subjects: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },

        },
      });
      // calcuate duration for session

      if (learner_session_subjectList[0]?.contents != null) {
        for (const item of learner_session_subjectList) {
          if (item.contents != null) {
            for (const module of item?.contents?.content_module_segments) {
              for (const activities of module.content_module_segment_activities) {
                for (const subjects of activities?.contents_content_module_segment_activities_content_activity_idTocontents?.content_subject_disciplines) {
                  const key = `${subjects?.subjects?.id}-${subjects?.subjects?.name}`;
                  if (!subjectlistKeyMap.has(key)) {
                    subjectlistKeyMap.set(key, true);
                    subjectlist.push({
                      id: subjects?.subjects?.id,
                      name: subjects?.subjects?.name
                    })
                  }
                }
              }
            }
          }
        }
      }


      if (learner_session[0]?.content_sessions != null) {
        let sessionList = [];

        for (const item of learner_session) {
          let sessionDuration = 0;
          for (const module of item?.contents?.content_module_segments) {
            for (const activities of module.content_module_segment_activities) {
              sessionDuration += activities?.contents_content_module_segment_activities_content_activity_idTocontents?.duration;
            }
          }

          if (item.content_sessions != null) {
            let attachments: any = await this.serviceFunction.getAttachments(
              item.content_sessions
                ?.contents_content_sessions_session_idTocontents?.id,
              "SessionPhoto"
            );

            item.content_sessions.contents_content_sessions_session_idTocontents.attachments =
              attachments;
            const combinedObject = {
              ...item.content_sessions
                .contents_content_sessions_session_idTocontents,
              ...item.content_sessions.content_session_details[0],
            };
            combinedObject.duration = sessionDuration;
            combinedObject.progress = item.progress;
            combinedObject.course = item?.content_sessions?.contents_content_sessions_course_idTocontents;
            sessionList.push(combinedObject);
          }

        }

        response.status(HttpStatus.OK).json({
          total: learner_session_count,
          limit: limit,
          offset: pageNo,
          sessionList,
          filters: {
            subjects: subjectlist
          }
        });
      } else {
        throw new HttpException(
          "Learner Courses Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  //============================================Content Course Duplication=====================================================================================================
  async duplicateCourse(query: DuplicationCourseDto, response: Response) {
    try {
      let userCourseExist = await this.prisma.contents.findFirst({
        where: {
          id: query.courseId,
          content_types: {
            title: "Course",
          },
        },
        include: {
          badge_courses: true,
          content_interactive_segments: {
            select: {
              instructor_id: true,
              interactive_id: true,
              interactives: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          content_module_segments: {
            include: {
              module_segment_types: true,
              module_segment_deliveries: true,
              content_module_segment_activities: {
                include: {
                  contents_content_module_segment_activities_content_activity_idTocontents: true
                }
              },
            },
          },
        },
      });

      let isContentCourseCretaed = await this.prisma.contents.create({
        data: {
          title: query?.courseName ?? userCourseExist.title + 'copy',
          content_description: userCourseExist.content_description,
          availability_id: userCourseExist.availability_id,
          from_grade_id: userCourseExist.from_grade_id,
          to_grade_id: userCourseExist.to_grade_id,
          from_age: userCourseExist.from_age,
          to_age: userCourseExist.to_age,
          content_type_id: userCourseExist.content_type_id,
          instructor_id: query.createrID,
          is_active: true,
          isDraft: false,
          organization_id: userCourseExist.organization_id,
          created_at: new Date().toISOString(),
        },
      });

      await Promise.all([
        this.DuplicationofCourseBadges(isContentCourseCretaed.id, userCourseExist.badge_courses),
        this.duplicateContentCourseInteractiveSegment(
          isContentCourseCretaed.id,
          userCourseExist.content_interactive_segments,
          query.createrID
        ),
        this.duplicateContentCourseModuleSegment(
          isContentCourseCretaed.id,
          userCourseExist.content_module_segments,
          query.courseName,
          query.createrID
        ),
      ]);

      let attachments = await this.serviceFunction.getAttachments(
        userCourseExist.id,
        "CourseImage"
      );

      if (attachments) {
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: attachments.attachment_types.id,
            path: attachments?.path,
            field_name: "CourseImage",
            Image_key: attachments?.Image_key,
            attachmentable_id: isContentCourseCretaed.id,
            attachmentable_type: "CourseImage",
            created_at: new Date().toISOString(),
          },
        });
      }

      if (response) {
        response.status(HttpStatus.OK).json({
          message: "Course Duplicated Succesfully!!",
        });
      } else {
        return isContentCourseCretaed.id
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async DuplicationofCourseBadges(
    contentId: number,
    badge_List: badge_courses[]
  ) {

    badge_List.map(async (item, index) => {
      await this.prisma.badge_courses.create({
        data: {
          course_id: contentId,
          badge_id: item.badge_id,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      });
    });
  }

  duplicateContentCourseInteractiveSegment(
    content_id: number,
    content_interactive_segments: any,
    createrID: number
  ) {
    content_interactive_segments.map(async (item, index) => {
      await this.prisma.content_interactive_segments.create({
        data: {
          content_id: content_id,
          interactive_id: item.interactive_id,
          instructor_id: createrID,
          created_at: new Date().toISOString(),
        },
      });
    });
  }

  duplicateContentCourseModuleSegment(
    content_id: number,
    moduleSegment: any,
    courseName: string,
    createrID: number
  ) {
    moduleSegment.map(async (item, index) => {
      let contentModuleSegment =
        await this.prisma.content_module_segments.create({
          data: {
            module: courseName + ' ' + item.module,
            module_segment_type_id: item.module_segment_type_id,
            module_segment_delivery_id: item.module_segment_delivery_id,
            content_id: content_id,
            instructor_id: createrID,
            created_at: new Date().toISOString(),
          },
        });

      for (const activities of item.content_module_segment_activities) {
        await this.prisma.content_module_segment_activities.create({
          data: {
            content_id: content_id,
            content_module_segment_id: contentModuleSegment.id,
            instructor_id: createrID,
            content_activity_id: activities.content_activity_id,
            created_at: new Date().toISOString(),
          },
        });
      }
    });
  }

  //=================================================================================================================================================================

  async associatedsession(query: CourseAssociatedSession, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let count = await this.prisma.content_sessions.count({
        where: {
          course_id: query.course_id,
          contents_content_sessions_session_idTocontents: {
            is_active: true
          }
        },
      });

      let sessionFound: any = await this.prisma.content_sessions.findMany({
        where: {
          course_id: query.course_id,
          contents_content_sessions_session_idTocontents: {
            is_active: true
          }
        },
        select: {
          contents_content_sessions_session_idTocontents: {
            select: {
              id: true,
              title: true,
              content_description: true,
              leanerslot: true,
              duration: true,
              is_active: true
            }

          },
          contents_content_sessions_course_idTocontents: {
            select: {
              content_module_segments: {
                select: {
                  content_module_segment_activities: {
                    select: {
                      contents_content_module_segment_activities_content_activity_idTocontents: {
                        select: {
                          id: true,
                          duration: true,
                        }
                      }
                    }
                  }
                }
              },
            }
          },
          content_session_details: {
            select: {
              price: true,
              session_types: {
                select: {
                  id: true,
                  name: true
                }
              },
              start_date: true,
              end_date: true
            }
          }
        },
        skip: pageNo * limit ?? undefined,
        take: query?.limit,
      });

      if (sessionFound) {
        let AssociatedsessionList = [];
        for (const item of sessionFound) {
          let sessionDuration = 0;
          let attachments = await this.serviceFunction.getAttachments(
            item?.contents_content_sessions_session_idTocontents?.id,
            "SessionPhoto"
          );

          for (const modulesegment of item?.contents_content_sessions_course_idTocontents?.content_module_segments) {
            for (const activity of modulesegment?.content_module_segment_activities) {
              sessionDuration = sessionDuration + activity?.contents_content_module_segment_activities_content_activity_idTocontents?.duration
            }
          }

          item.contents_content_sessions_session_idTocontents.duration = sessionDuration;
          item.contents_content_sessions_session_idTocontents.SessionPhoto = attachments?.path ?? null;
          const combinedObject = { ...item?.contents_content_sessions_session_idTocontents, ...item?.content_session_details[0] };
          AssociatedsessionList.push(combinedObject)


        }

        response.status(HttpStatus.OK).json({
          total: count,
          limit: limit,
          offset: pageNo,
          data: AssociatedsessionList,
        });
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
