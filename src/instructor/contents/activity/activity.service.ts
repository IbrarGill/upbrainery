import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  ActivityDuplicationDto,
  ContentActivityStandard,
  ContentBlocks,
  ContentResource,
  ContentSkills,
  ContentSubject,
  ContentVocabularies,
  CreateActivityDto,
  FindActivityByArrayofIds,
  SearchContentActivity,
} from "./dto/create-activity.dto";
import { ContentBlocksUpdateDto, ContentResourceUpdateDto, UpdateActivityDto } from "./dto/update-activity.dto";
import { Request, Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { PrismaService } from "src/prisma/prisma.client";
import { CommonFunctionsService } from "src/services/commonService";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AttachmentDto, ContentBlocksJson, ContentResourceJson, CreateActivityJsonDto } from "./dto/create-activity-json";
import { ContentBlocksUpdateJsonDto, ContentResourceUpdateJsonDto, UpdateActivityJsonDto } from "./dto/update-activity-json";
@Injectable()
export class ActivityService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }

  //============================================Content Activity FormData Creation=====================================================================================================

  async createContentActivity(
    files: Express.Multer.File,
    dto: CreateActivityDto,
    response: Response
  ) {
    try {

      let images: any = files;
      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
        },
      });

      let user_org = await this.prisma.users.findFirst({ where: { id: dto.instructor_id } })

      let isContentActivityCretaed = await this.prisma.contents.create({
        data: {
          title: dto.activityName,
          content_description: dto.activityDescription,
          availability_id: dto.activityAvailabilityId,
          working_type_id: dto.activityWorkTypeId,
          duration: dto.durations,
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
          updated_at: new Date().toISOString(),
        },
      });

      if (isContentActivityCretaed) {

        let isContentActivtySave = await Promise.all([
          dto.activitySubject ? this.saveContentActivtySubjects(
            isContentActivityCretaed.id,
            dto.activitySubject
          ) : null,
          dto.activitySkill ? this.saveContentActivSkills(
            isContentActivityCretaed.id,
            dto.activitySkill
          ) : null,
          dto.activityVocabulary ? this.saveContentActivtyVocabularys(
            isContentActivityCretaed.id,
            dto.activityVocabulary
          ) : null,
          dto.activityStandard ? this.saveContentActivtyStandards(
            isContentActivityCretaed.id,
            dto.activityStandard
          ) : null,
          dto.activityBlock ? this.saveContentActivtyBlocks(
            isContentActivityCretaed.id,
            dto.activityBlock,
            content_type.id,
            dto.instructor_id,
            images
          ) : null,
          dto.resource ? this.saveContentActivtyResources(
            isContentActivityCretaed.id,
            dto.resource,
            images
          ) : null
        ]);
        if (isContentActivtySave) {
          response.status(HttpStatus.OK).json({
            message: "Activity Created Succcusfully!!",
          });
          let eventData = {};

          if (images.activityPhoto) {
            eventData = {
              modelId: isContentActivityCretaed.id,
              path: `${images.activityPhoto[0].destination}/${images.activityPhoto[0].filename}`,
              fileName: images.activityPhoto[0].filename,
              modelName: "Activity",
            };
            this.eventEmitter.emit("event.attachment", eventData);
          } else {
            eventData = {
              modelId: isContentActivityCretaed.id,
              path: process.env.Default_Image_key,
              fileName: "Activity",
              modelName: "Activity",
            };
            this.eventEmitter.emit("event.Defaultattachment", eventData);
          }
        }

      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async saveContentActivtySubjects(
    contentActivityId: number,
    subjects: ContentSubject[]
  ) {
    subjects.map(async (item, index) => {
      await this.prisma.content_subject_disciplines.create({
        data: {
          content_id: contentActivityId,
          subject_id: item.subject_id,
          subject_discipline_id: item.subject_discipline_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  async saveContentActivSkills(
    contentActivityId: number,
    skills: ContentSkills[]
  ) {
    skills.map(async (item, index) => {
      await this.prisma.content_skills.create({
        data: {
          content_id: contentActivityId,
          skill_id: item.skill_id,
          sub_skill_id: item.sub_skill_id,
          skill_points: item.skill_points,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  async saveContentActivtyVocabularys(
    contentActivityId: number,
    vocabularys: ContentVocabularies[]
  ) {
    vocabularys.map(async (item, index) => {
      await this.prisma.content_vocabularies.create({
        data: {
          content_id: contentActivityId,
          vocabulary: item.vocabulary,
          vocabulary_definition: item.vocabulary_definition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }

  async saveContentActivtyResources(
    contentActivityId: number,
    resource: ContentResource[],
    images: any
  ) {
    resource.map(async (item, index) => {
      let resource = await this.prisma.content_resources.create({
        data: {
          content_id: contentActivityId,
          name: item.filename,
          is_viewable: item.is_viewable,
          is_downloadable: item.is_downloadable,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      });

      let eventData = {};
      if (images.ActivityResource)
        for (let index = 0; index < images.ActivityResource.length; index++) {
          const element = images.ActivityResource[index];
          if (element.originalname === item.filename) {
            eventData = {
              modelId: resource.id,
              path: `${element.destination}/${element.filename}`,
              fileName: element.originalname,
              modelName: "ActivityResource",
            };
            this.eventEmitter.emit("event.attachment", eventData);
          }
        }
    });
  }

  async saveContentActivtyStandards(
    contentActivityId: number,
    standard: ContentActivityStandard[]
  ) {
    standard.map(async (item, index) => {
      let standard = await this.prisma.standards.findFirst({
        where: {
          title: item.title,
          standard_type_id: item.standard_type_id,
          standard_level_id: item.standard_level_id,
          standard_subject_id: item.standard_subject_id,
        },
      });

      await this.prisma.content_standards.create({
        data: {
          content_id: contentActivityId,
          standard_id: standard.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  async saveContentActivtyBlocks(
    contentActivityId: number,
    blocks: ContentBlocks[],
    contentTypeId: number,
    instructorId: number,
    images: any
  ) {
    for (const item of blocks) {

      let block = await this.prisma.blocks.create({
        data: {
          title: item.title,
          is_instructor_only: item.is_instructor_only,
          description: item.description,
          content_type_id: contentTypeId,
          instructor_id: instructorId,
          sequence_no: item.sequence_no,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      await this.prisma.content_blocks.create({
        data: {
          content_id: contentActivityId,
          block_id: block.id,
          instructor_id: instructorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
      let eventData = {};
      item.blockattachment.map((blockItem, index) => {
        if (images.blockImage) {
          for (let i = 0; i < images.blockImage.length; i++) {
            const element = images.blockImage[i];
            if (element.originalname === blockItem) {
              eventData = {
                modelId: block.id,
                path: `${element.destination}/${element.filename}`,
                fileName: element.filename,
                modelName: "block",
                filetype: 'Image'
              };
              this.eventEmitter.emit("event.attachment", eventData);
              break;
            }
          }
        }

        if (images.blockVideo) {
          for (let i = 0; i < images.blockVideo.length; i++) {
            const element = images.blockVideo[i];
            if (element.originalname === blockItem) {
              eventData = {
                modelId: block.id,
                path: `${element.destination}/${element.filename}`,
                fileName: element.filename,
                modelName: "block",
                filetype: 'Video'
              };
              this.eventEmitter.emit("event.attachment", eventData);
              break;
            }
          }
        }

        if (images.Model3D) {
          for (let i = 0; i < images.Model3D.length; i++) {
            const element = images.Model3D[i];
            if (element.originalname === blockItem) {
              eventData = {
                modelId: block.id,
                path: `${element.destination}/${element.filename}`,
                fileName: element.filename,
                modelName: "block",
                filetype: '3D'
              };
              this.eventEmitter.emit("event.attachment", eventData);
              break;
            }
          }
        }
      });
    }
  }

  //============================================Content Activity Json Creation=====================================================================================================

  async createContentActivityWithJson(
    dto: CreateActivityJsonDto,
    response: Response
  ) {
    try {

      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
        },
      });

      let user_org = await this.prisma.users.findFirst({ where: { id: dto.instructor_id } })

      let isContentActivityCretaed = await this.prisma.contents.create({
        data: {
          title: dto.activityName,
          content_description: dto.activityDescription,
          availability_id: dto.activityAvailabilityId,
          working_type_id: dto.activityWorkTypeId,
          duration: dto.durations,
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
          updated_at: new Date().toISOString(),
        },
      });

      if (isContentActivityCretaed) {
        let isContentActivtySave = await Promise.all([
          dto.activitySubject ? this.saveContentActivtySubjectsJson(
            isContentActivityCretaed.id,
            dto.activitySubject
          ) : null,
          dto.activitySkill ? this.saveContentActivSkillsJson(
            isContentActivityCretaed.id,
            dto.activitySkill
          ) : null,
          dto.activityVocabulary ? this.saveContentActivtyVocabularysJson(
            isContentActivityCretaed.id,
            dto.activityVocabulary
          ) : null,
          dto.activityStandard ? this.saveContentActivtyStandardsJson(
            isContentActivityCretaed.id,
            dto.activityStandard
          ) : null,
          dto.activityBlock ? this.saveContentActivtyBlocksJson(
            isContentActivityCretaed.id,
            dto.activityBlock,
            content_type.id,
            dto.instructor_id,
          ) : null,
          dto.resource ? this.saveContentActivtyResourcesJson(
            isContentActivityCretaed.id,
            dto.resource,
          ) : null
        ]);
        if (isContentActivtySave) {
          response.status(HttpStatus.OK).json({
            message: "Activity Created Succcusfully!!",
          });

          if (dto?.activityPhoto) {
            await this.prisma.attachments.create({
              data: {
                attachment_type_id: dto?.activityPhoto.attachment_types_id,
                Image_key: dto?.activityPhoto.imageKey,
                path: dto?.activityPhoto.path,
                field_name: dto?.activityPhoto.filename,
                attachmentable_id: isContentActivityCretaed.id,
                attachmentable_type: 'Activity',
              }
            })
          } else {
            let eventData = {
              modelId: isContentActivityCretaed.id,
              path: process.env.Default_Image_key,
              fileName: "Activity",
              modelName: "Activity",
            };
            this.eventEmitter.emit("event.Defaultattachment", eventData);
          }
        }

      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async saveContentActivtySubjectsJson(
    contentActivityId: number,
    subjects: ContentSubject[]
  ) {
    subjects.map(async (item, index) => {
      await this.prisma.content_subject_disciplines.create({
        data: {
          content_id: contentActivityId,
          subject_id: item.subject_id,
          subject_discipline_id: item.subject_discipline_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  async saveContentActivSkillsJson(
    contentActivityId: number,
    skills: ContentSkills[]
  ) {
    skills.map(async (item, index) => {
      await this.prisma.content_skills.create({
        data: {
          content_id: contentActivityId,
          skill_id: item.skill_id,
          sub_skill_id: item.sub_skill_id,
          skill_points: item.skill_points,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  async saveContentActivtyVocabularysJson(
    contentActivityId: number,
    vocabularys: ContentVocabularies[]
  ) {
    vocabularys.map(async (item, index) => {
      await this.prisma.content_vocabularies.create({
        data: {
          content_id: contentActivityId,
          vocabulary: item.vocabulary,
          vocabulary_definition: item.vocabulary_definition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }

  async saveContentActivtyResourcesJson(
    contentActivityId: number,
    resource: ContentResourceJson[],
  ) {
    resource.map(async (item, index) => {
      let resource = await this.prisma.content_resources.create({
        data: {
          content_id: contentActivityId,
          name: item.attachment.filename,
          is_viewable: item.is_viewable,
          is_downloadable: item.is_downloadable,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      });

      await this.prisma.attachments.create({
        data: {
          attachment_type_id: item.attachment.attachment_types_id,
          Image_key: item.attachment.imageKey,
          path: item.attachment.path,
          field_name: item.attachment.filename,
          attachmentable_id: resource.id,
          attachmentable_type: 'ActivityResource',
        }
      })

    });
  }

  async saveContentActivtyStandardsJson(
    contentActivityId: number,
    standard: ContentActivityStandard[]
  ) {
    standard.map(async (item, index) => {
      let standard = await this.prisma.standards.findFirst({
        where: {
          title: item.title,
          standard_type_id: item.standard_type_id,
          standard_level_id: item.standard_level_id,
          standard_subject_id: item.standard_subject_id,
        },
      });

      await this.prisma.content_standards.create({
        data: {
          content_id: contentActivityId,
          standard_id: standard.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  async saveContentActivtyBlocksJson(
    contentActivityId: number,
    blocks: ContentBlocksJson[],
    contentTypeId: number,
    instructorId: number,
  ) {
    for (const item of blocks) {

      let block = await this.prisma.blocks.create({
        data: {
          title: item.title,
          is_instructor_only: item.is_instructor_only,
          description: item.description,
          content_type_id: contentTypeId,
          instructor_id: instructorId,
          sequence_no: item.sequence_no,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      await this.prisma.content_blocks.create({
        data: {
          content_id: contentActivityId,
          block_id: block.id,
          instructor_id: instructorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      item.blockattachment.map(async (item, index) => {
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: item.attachment_types_id,
            Image_key: item.imageKey,
            path: item.path,
            field_name: item.filename,
            attachmentable_id: block.id,
            attachmentable_type: 'block',
          }
        })
      });
    };
  }
  //============================================Content Activity Query=====================================================================================================

  async findAll(query: SearchContentActivity, response: Response) {
    try {


      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let subjectList: number[] = [];
      if (query?.subjects) {
        subjectList = JSON.parse(query.subjects)
      }

      let skilltList: number[] = [];
      if (query?.skills) {
        subjectList = JSON.parse(query.skills)
      }

      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
        },
      });

      let user_org = await this.prisma.users.findFirst({ where: { id: query.instuctorId } })
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: query.startGrade ?? 1,
            lte: query.endGrade ?? 13,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);
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

      const ageRange = this.getAgeRange(query.startAge ?? 1, query.endAge ?? 99);



      let contentCount = await this.prisma.contents.count({
        where: {
          is_active: true,
          AND: [
            {
              OR:
                [
                  {
                    instructor_id: user_org.organization_id === 1 ? query.instuctorId : undefined,
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
                    instructor_activities: {
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
                  organization_id: 6,
                  isDraft: query.status ? query.status == 'Draft' : undefined,
                  duration: {
                    lt: query.duration ? query.duration + 1 : undefined
                  },
                  content_subject_disciplines: subjectList.length > 0 ? {
                    some:
                    {
                      subject_id: { in: subjectList }
                    }
                  } : undefined,
                  content_skills: skilltList.length > 0 ? {
                    some: {
                      skill_id: { in: skilltList }
                    }
                  } : undefined,
                  availability_id: query.AvailabilityTypeId ?? undefined,
                  from_age: {
                    in: ageRange
                  },
                  to_age: {
                    in: ageRange
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  }
                } : null,
                {
                  organization_id: user_org.organization_id,
                  content_type_id: conentType.id,
                  isDraft: query.status ? query.status == 'Draft' : undefined,
                  duration: {
                    lt: query.duration ? query.duration + 1 : undefined
                  },
                  content_subject_disciplines: subjectList.length > 0 ? {
                    some:
                    {
                      subject_id: { in: subjectList }
                    }
                  } : undefined,
                  content_skills: skilltList.length > 0 ? {
                    some: {
                      skill_id: { in: skilltList }
                    }
                  } : undefined,
                  availability_id: query.AvailabilityTypeId ?? undefined,
                  from_age: {
                    in: ageRange
                  },
                  to_age: {
                    in: ageRange
                  },
                  from_grade_id: {
                    in: gradesArr
                  },
                  to_grade_id: {
                    in: gradesArr
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  }
                }
              ]


            }

          ]
        }
      });

      let isFound: any = await this.prisma.contents.findMany({
        where: {
          is_active: true,
          AND: [
            {
              OR:
                [
                  {
                    instructor_id: user_org.organization_id === 1 ? query.instuctorId : undefined,
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
                    instructor_activities: {
                      some: {
                        instructor_id: query.instuctorId
                      }
                    },
                  },
                  org_content ? {
                    to_grade_id: {
                      in: org_content_grade
                    },
                    from_grade_id: {
                      in: org_content_grade
                    },
                    content_type_id: conentType.id,
                    organization_id: {
                      in: [user_org.organization_id, 6]
                    },
                  } : null,

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
                  organization_id: 6,
                  isDraft: query.status ? query.status == 'Draft' : undefined,
                  duration: {
                    lt: query.duration ? query.duration + 1 : undefined
                  },
                  content_subject_disciplines: subjectList.length > 0 ? {
                    some:
                    {
                      subject_id: { in: subjectList }
                    }
                  } : undefined,
                  content_skills: skilltList.length > 0 ? {
                    some: {
                      skill_id: { in: skilltList }
                    }
                  } : undefined,
                  availability_id: query.AvailabilityTypeId ?? undefined,
                  from_age: {
                    in: ageRange
                  },
                  to_age: {
                    in: ageRange
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  }
                } : null,
                {
                  organization_id: user_org.organization_id,
                  content_type_id: conentType.id,
                  isDraft: query.status ? query.status == 'Draft' : undefined,
                  duration: {
                    lt: query.duration ? query.duration + 1 : undefined
                  },
                  content_subject_disciplines: subjectList.length > 0 ? {
                    some:
                    {
                      subject_id: { in: subjectList }
                    }
                  } : undefined,
                  content_skills: skilltList.length > 0 ? {
                    some: {
                      skill_id: { in: skilltList }
                    }
                  } : undefined,
                  availability_id: query.AvailabilityTypeId ?? undefined,
                  from_age: {
                    in: ageRange
                  },
                  to_age: {
                    in: ageRange
                  },
                  from_grade_id: {
                    in: gradesArr
                  },
                  to_grade_id: {
                    in: gradesArr
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  }
                }
              ]


            }

          ]
        },
        orderBy: [
          query.orderBy === "Latest Activities" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Activities" ? {
            id: "asc"
          } : null,
          query.orderBy === "Sort By A-Z" ? {
            title: "asc"
          } : null,
          query.orderBy === "Sort By Z-A" ? {
            title: "desc"
          } : null,
        ],
        skip: pageNo * limit,
        take: query?.limit,

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

          content_module_segment_activities_content_module_segment_activities_content_activity_idTocontents: {
            select: {
              contents_content_module_segment_activities_content_idTocontents: {
                select: {
                  id: true,
                  title: true,
                  is_active: true,
                },
              },

            }
          },
        },
      });


      if (isFound) {
        for (const item of isFound) {
          let courseAttached = []

          let attachments = await this.serviceFunction.getAttachments(
            item.id,
            "Activity"
          );
          item.attachments = attachments;

          let createdbyAttachment = await this.serviceFunction.getAttachments(
            item.users.id,
            "User"
          );
          item.users.image_url = createdbyAttachment?.path;

          for (const activities of item?.content_module_segment_activities_content_module_segment_activities_content_activity_idTocontents) {

            let sessionFound = await this.prisma.content_sessions.findMany({
              where: {
                course_id: activities?.contents_content_module_segment_activities_content_idTocontents.id
              },
              select: {
                contents_content_sessions_session_idTocontents: {
                  select: {
                    id: true,
                    title: true,
                    is_active: true
                  }
                },
              },

            });

            if (sessionFound) {
              let AssociatedsessionList = [];
              for (const item of sessionFound) {
                if (item?.contents_content_sessions_session_idTocontents.is_active) {
                  AssociatedsessionList.push(item?.contents_content_sessions_session_idTocontents)
                }
              }
              courseAttached.push({
                id: activities?.contents_content_module_segment_activities_content_idTocontents.id,
                title: activities?.contents_content_module_segment_activities_content_idTocontents.title,
                AssociatedsessionList: AssociatedsessionList
              });
            }

          }
          delete item?.content_module_segment_activities_content_module_segment_activities_content_activity_idTocontents
          item.courseAttached = courseAttached;
        }

        response.status(HttpStatus.OK).json({
          total: contentCount,
          limit: limit,
          offset: pageNo,
          data: isFound
        });
      } else {
        throw new HttpException(
          "Content Activities Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getactivityfilters(instuctorId: number, response: Response) {
    try {
      const subjectsKeyMap = new Map();
      const skillsKeyMap = new Map();
      const availabilitiesKeyMap = new Map();
      let maxduration = 0;
      let minduration = 0;
      let maxAge = 0;
      let minAge = 0;
      let subjectList = [];
      let skillsList = [];
      let availabilitiesList = [];

      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
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
                    instructor_activities: {
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
            }
          ]
        },
        select: {
          duration: true,
          to_age: true,
          from_age: true,
          content_subject_disciplines: {
            select: {
              subject_id: true,
              subjects: true,
            }
          },
          content_skills: {
            select: {
              skill_id: true,
              skills: true
            }
          },
          availabilities: true,
        }
      });

      if (filtersfound) {
        for (const item of filtersfound) {

          if (item.duration > maxduration) {
            maxduration = item.duration;
          }

          if (item.to_age > maxAge) {
            maxAge = item.to_age;
          }

          const availabilitieskey = `${item.availabilities.id}-${item.availabilities.title}`;
          if (!availabilitiesKeyMap.has(availabilitieskey)) {
            availabilitiesKeyMap.set(availabilitieskey, true);
            availabilitiesList.push({
              id: item.availabilities.id,
              title: item.availabilities.title
            })
          }


          for (const skills of item.content_skills) {
            const skillkey = `${skills.skill_id}`;
            if (!skillsKeyMap.has(skillkey)) {
              skillsKeyMap.set(skillkey, true);
              skillsList.push({
                id: skills.skills.id,
                title: skills.skills.title
              })
            }
          }

          for (const subject of item.content_subject_disciplines) {
            const subjectkey = `${subject.subject_id}`;
            if (!subjectsKeyMap.has(subjectkey)) {
              subjectsKeyMap.set(subjectkey, true);
              subjectList.push({
                id: subject.subjects.id,
                title: subject.subjects.name
              })
            }
          }

        }

        response.status(HttpStatus.OK).json({
          filters: {
            minduration,
            maxduration,
            minAge,
            maxAge,
            grades,
            subjectList,
            skillsList,
            availabilitiesList,
          }
        })
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  getAgeRange(startAge: number, endAge: number) {
    const ageArray = [];

    for (let age = startAge; age <= endAge; age++) {
      ageArray.push(age);
    }

    return ageArray;
  }

  async findOne(id: number, response: Response) {
    try {
      let Session3Dmodel = [];
      let isFound: any = await this.prisma.contents.findFirst({
        where: {
          id: id,
          content_types: {
            title: "Activity"
          }
        },
        include: {
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
          working_types: {
            select: {
              id: true,
              title: true,
            },
          },
          content_skills: {
            select: {
              skills: {
                select: {
                  id: true,
                  title: true,
                },

              },
              sub_skills: {
                select: {
                  id: true,
                  title: true,
                },
              },
              skill_points: true,
            },
          },

          content_types: {
            select: {
              id: true,
              title: true,
            },
          },
          content_vocabularies: {
            select: {
              id: true,
              vocabulary: true,
              vocabulary_definition: true,
            },
          },
          content_standards: {
            select: {
              standards: {
                select: {
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
          content_blocks: {
            select: {
              blocks: {
                select: {
                  id: true,
                  title: true,
                  is_instructor_only: true,
                  description: true,
                  sequence_no: true,
                },
              },
            },
          },
          content_resources: {
            select: {
              id: true,
              name: true,
              is_downloadable: true,
              is_viewable: true
            }
          }
        },
      });
      if (isFound) {


        // isFound.content_blocks.sort((blockA, blockB) => blockA.blocks.sequence_no - blockB.blocks.sequence_no);

        let attachments: any = await this.serviceFunction.getAttachments(
          isFound.id,
          "Activity"
        );
        isFound.attachments = attachments;

        for (const item of isFound.content_blocks) {
          const attachments = await this.serviceFunction.getmultipleAttachments(
            item.blocks.id,
            "block"
          );

          if (attachments) {
            for (const model of attachments) {
              if (model.attachment_types.name === '3D') {
                Session3Dmodel.push(model.path)
              }

              if (model?.augmented_3d_model_attachments?.length > 0) {
                let ar3dmodel = await this.serviceFunction.getAttachments(
                  model?.augmented_3d_model_attachments[0]?.augmented_3d_models?.id,
                  'ARModel3D'
                );
                model.armodelUrl = ar3dmodel?.path;
              }
              delete model.augmented_3d_model_attachments
            }
          }
          item.blocks.attachments = attachments;
        }

        for (const item of isFound.content_resources) {
          const attachments = await this.serviceFunction.getAttachments(
            item.id,
            "ActivityResource"
          );
          item.attachments = attachments;
        }
        isFound.Session3Dmodel = Session3Dmodel;
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
  //============================================Content Activity Update=====================================================================================================

  async update(activityId: number, dto: UpdateActivityDto, response: Response, files: Express.Multer.File) {
    try {
      let images: any = files;

      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
        },
      });
      let activity = await this.prisma.contents.findUnique({
        where: {
          id: activityId
        },
        include: {
          content_resources: true,
          content_blocks: true
        }
      })

      if (activity) {
        let isupdated = await this.prisma.contents.update({
          where: {
            id: activityId
          },
          data: {
            title: dto.activityName ?? activity.title,
            content_description: dto.activityDescription ?? activity.content_description,
            availability_id: dto.activityAvailabilityId ?? activity.availability_id,
            working_type_id: dto.activityWorkTypeId ?? activity.working_type_id,
            duration: dto.durations ?? activity.duration,
            from_grade_id: dto.startGrade ?? activity.from_grade_id,
            to_grade_id: dto.endGrade ?? activity.to_grade_id,
            from_age: dto.startAge ?? activity.from_age,
            to_age: dto.endAge ?? activity.to_age,
            isDraft: dto.isDraft ? true : false,
            updated_at: new Date().toISOString()
          }
        })

        if (isupdated) {

          let isallupdated = await Promise.all([
            dto.activitySubject ? this.updateContentActivtySubjects(
              activityId,
              dto.activitySubject
            ) : null,


            dto.activitySkill ? this.updateContentActivSkills(
              activityId,
              dto.activitySkill
            ) : null,

            dto.activityVocabulary ?
              this.updateContentActivtyVocabularys(
                activityId,
                dto.activityVocabulary
              ) : null,

            dto.activityStandard ?
              this.updateContentActivtyStandards(
                activityId,
                dto.activityStandard
              ) : null,

            dto.activityBlock ?
              this.updateContentActivtyBlocks(
                activityId,
                dto.activityBlock,
                content_type.id,
                activity.instructor_id,
                images
              ) : null,


            dto.resource ? this.updateContentActivtyResources(
              activityId,
              dto.resource,
              images
            ) : null
          ])

          if (isallupdated) {
            if (images.activityPhoto) {
              let eventData = {
                modelId: activityId,
                path: `${images.activityPhoto[0].destination}/${images.activityPhoto[0].filename}`,
                fileName: images.activityPhoto[0].filename,
                modelName: "Activity",
              };
              this.eventEmitter.emit("event.updateattachment", eventData);
            }
            this.findOne(activityId, response);

          } else {
            throw new HttpException(
              "Content Activities Not Updated!!",
              HttpStatus.NOT_FOUND
            )
          }

        }
      } else {
        throw new HttpException(
          "Content Activities Not Found!!",
          HttpStatus.NOT_FOUND
        )
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async updateActivityV2(activityId: number, dto: UpdateActivityJsonDto, response: Response) {
    try {

      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
        },
      });
      let activity = await this.prisma.contents.findUnique({
        where: {
          id: activityId
        },
        include: {
          content_resources: true,
          content_blocks: true
        }
      })

      if (activity) {
        let isupdated = await this.prisma.contents.update({
          where: {
            id: activityId
          },
          data: {
            title: dto.activityName ?? activity.title,
            content_description: dto.activityDescription ?? activity.content_description,
            availability_id: dto.activityAvailabilityId ?? activity.availability_id,
            working_type_id: dto.activityWorkTypeId ?? activity.working_type_id,
            duration: dto.durations ?? activity.duration,
            from_grade_id: dto.startGrade ?? activity.from_grade_id,
            to_grade_id: dto.endGrade ?? activity.to_grade_id,
            from_age: dto.startAge ?? activity.from_age,
            to_age: dto.endAge ?? activity.to_age,
            isDraft: dto.isDraft ? true : false,
            updated_at: new Date().toISOString()
          }
        })

        if (isupdated) {

          let isallupdated = await Promise.all([
            dto.activitySubject ? await this.updateContentActivtySubjects(activityId, dto.activitySubject) : null,
            dto.activitySkill ? await this.updateContentActivSkills(activityId, dto.activitySkill) : null,
            dto.activityVocabulary ? await this.updateContentActivtyVocabularys(activityId, dto.activityVocabulary) : null,
            dto.activityStandard ? await this.updateContentActivtyStandards(activityId, dto.activityStandard) : null,
            dto.activityBlock ? await this.updateContentActivtyBlocksWithJson(activityId, dto.activityBlock, content_type.id, activity.instructor_id) : null,
            dto.resource ? await this.updateContentActivtyResourcesWithJson(activityId, dto.resource,) : null
          ])

          if (isallupdated) {
            if (dto?.activityPhoto) {
              let attachment = await this.prisma.attachments.findFirst({
                where: {
                  attachmentable_id: activityId,
                  attachmentable_type: 'Activity',
                }
              })

              await this.prisma.attachments.update({
                where: {
                  id: attachment.id
                },
                data: {
                  attachment_type_id: dto?.activityPhoto.attachment_types_id,
                  Image_key: dto?.activityPhoto.imageKey,
                  path: dto?.activityPhoto.path,
                  field_name: dto?.activityPhoto.filename,
                  attachmentable_id: activityId,
                  attachmentable_type: 'Activity',
                }
              })
            }
            this.findOne(activityId, response);

          } else {
            throw new HttpException(
              "Content Activities Not Updated!!",
              HttpStatus.NOT_FOUND
            )
          }

        }
      } else {
        throw new HttpException(
          "Content Activities Not Found!!",
          HttpStatus.NOT_FOUND
        )
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //=====================================================================================================================================

  async updateContentActivtySubjects(
    contentActivityId: number,
    subjects: ContentSubject[]
  ) {
    await Promise.all([
      await this.prisma.content_subject_disciplines.deleteMany({
        where: {
          content_id: contentActivityId,
        },
      }),
      subjects.map(async (item, index) => {
        await this.prisma.content_subject_disciplines.create({
          data: {
            content_id: contentActivityId,
            subject_id: item.subject_id,
            subject_discipline_id: item.subject_discipline_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      })
    ])
  }
  async updateContentActivSkills(
    contentActivityId: number,
    skills: ContentSkills[]
  ) {

    await Promise.all([
      await this.prisma.content_skills.deleteMany({
        where: {
          content_id: contentActivityId,
        },
      }),
      skills.map(async (item, index) => {
        await this.prisma.content_skills.create({
          data: {
            content_id: contentActivityId,
            skill_id: item.skill_id,
            sub_skill_id: item.sub_skill_id,
            skill_points: item.skill_points,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      })
    ])


  }
  async updateContentActivtyVocabularys(
    contentActivityId: number,
    vocabularys: ContentVocabularies[]
  ) {
    await Promise.all([
      await this.prisma.content_vocabularies.deleteMany({
        where: {
          content_id: contentActivityId,
        },
      }),
      vocabularys.map(async (item, index) => {
        await this.prisma.content_vocabularies.create({
          data: {
            content_id: contentActivityId,
            vocabulary: item.vocabulary,
            vocabulary_definition: item.vocabulary_definition,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      })
    ])


  }
  async updateContentActivtyStandards(
    contentActivityId: number,
    standard: ContentActivityStandard[]
  ) {
    await Promise.all([
      await this.prisma.content_standards.deleteMany({
        where: {
          content_id: contentActivityId,
        },
      }),
      standard.map(async (item, index) => {
        let standard = await this.prisma.standards.findFirst({
          where: {
            title: item.title,
            standard_type_id: item.standard_type_id,
            standard_level_id: item.standard_level_id,
            standard_subject_id: item.standard_subject_id,
          },
        });

        await this.prisma.content_standards.create({
          data: {
            content_id: contentActivityId,
            standard_id: standard.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      })
    ])


  }
  async updateContentActivtyBlocks(
    contentActivityId: number,
    blocks: ContentBlocksUpdateDto[],
    contentTypeId: number,
    instructorId: number,
    images: any
  ) {

    for (const item of blocks) {

      if (item.id) {
        if (item.isblockdeleted) {
          await this.prisma.content_blocks.deleteMany({
            where: {
              block_id: item.id
            },
          })
          await this.prisma.attachments.deleteMany({
            where: {
              attachmentable_id: item.id,
              field_name: "block"
            },
          })
          return;
        }

        let block = await this.prisma.blocks.update({
          where: {
            id: item.id
          },
          data: {
            title: item.title,
            is_instructor_only: item.is_instructor_only,
            description: item.description,
            content_type_id: contentTypeId,
            instructor_id: instructorId,
            sequence_no: item.sequence_no,
            updated_at: new Date().toISOString()
          },
        });

        for (const attachment of item.deleteAttachments) {
          await this.prisma.attachments.delete({
            where: {
              id: +attachment,
            }
          })
        }

        let eventData = {};
        item.blockattachment.map((blockItem, index) => {
          if (images.blockImage) {
            for (let i = 0; i < images.blockImage.length; i++) {
              const element = images.blockImage[i];
              if (element.originalname === blockItem) {
                eventData = {
                  modelId: block.id,
                  path: `${element.destination}/${element.filename}`,
                  fileName: element.filename,
                  modelName: "block",
                };
                this.eventEmitter.emit("event.attachment", eventData);
                break;
              }
            }
          }

          if (images.blockVideo) {
            for (let i = 0; i < images.blockVideo.length; i++) {
              const element = images.blockVideo[i];
              if (element.originalname === blockItem) {
                eventData = {
                  modelId: block.id,
                  path: `${element.destination}/${element.filename}`,
                  fileName: element.filename,
                  modelName: "block",
                  filetype: 'Video'
                };
                this.eventEmitter.emit("event.attachment", eventData);
                break;
              }
            }
          }

          if (images.Model3D) {
            for (let i = 0; i < images.Model3D.length; i++) {
              const element = images.Model3D[i];
              if (element.originalname === blockItem) {
                eventData = {
                  modelId: block.id,
                  path: `${element.destination}/${element.filename}`,
                  fileName: element.filename,
                  modelName: "block",
                  filetype: '3D'
                };
                this.eventEmitter.emit("event.attachment", eventData);
                break;
              }
            }
          }



        });
      } else {
        let block = await this.prisma.blocks.create({
          data: {
            title: item.title,
            is_instructor_only: item.is_instructor_only,
            description: item.description,
            content_type_id: contentTypeId,
            instructor_id: instructorId,
            sequence_no: item.sequence_no,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });

        await this.prisma.content_blocks.create({
          data: {
            content_id: contentActivityId,
            block_id: block.id,
            instructor_id: instructorId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });

        let eventData = {};
        item.blockattachment.map((blockItem, index) => {
          if (images.blockImage) {
            for (let i = 0; i < images.blockImage.length; i++) {
              const element = images.blockImage[i];
              if (element.originalname === blockItem) {
                eventData = {
                  modelId: block.id,
                  path: `${element.destination}/${element.filename}`,
                  fileName: element.filename,
                  modelName: "block",
                };
                this.eventEmitter.emit("event.attachment", eventData);
                break;
              }
            }
          }
          if (images.blockVideo) {
            for (let i = 0; i < images.blockVideo.length; i++) {
              const element = images.blockVideo[i];
              if (element.originalname === blockItem) {
                eventData = {
                  modelId: block.id,
                  path: `${element.destination}/${element.filename}`,
                  fileName: element.filename,
                  modelName: "block",
                  filetype: 'Video'
                };
                this.eventEmitter.emit("event.attachment", eventData);
                break;
              }
            }
          }

          if (images.Model3D) {
            for (let i = 0; i < images.Model3D.length; i++) {
              const element = images.Model3D[i];
              if (element.originalname === blockItem) {
                eventData = {
                  modelId: block.id,
                  path: `${element.destination}/${element.filename}`,
                  fileName: element.filename,
                  modelName: "block",
                  filetype: '3D'
                };
                this.eventEmitter.emit("event.attachment", eventData);
                break;
              }
            }
          }

        });
      }
    }


  }
  async updateContentActivtyResources(
    contentActivityId: number,
    resource: ContentResourceUpdateDto[],
    images: any
  ) {
    resource.map(async (item, index) => {
      if (item.id) {
        if (item.isdeleted) {
          await this.prisma.content_resources.delete({
            where: {
              id: item.id,
            }
          })
          await this.prisma.attachments.deleteMany({
            where: {
              attachmentable_id: item.id,
              field_name: "ActivityResource"
            },
          })
          return;
        }

        let resource = await this.prisma.content_resources.update({
          where: {
            id: item.id
          },
          data: {
            content_id: contentActivityId,
            name: item.filename,
            is_viewable: item.is_viewable,
            is_downloadable: item.is_downloadable,
            updated_at: new Date().toISOString()
          }
        });

        let eventData = {};
        if (images.ActivityResource)
          for (let index = 0; index < images.ActivityResource.length; index++) {
            const element = images.ActivityResource[index];
            if (element.originalname === item.filename) {
              eventData = {
                modelId: resource.id,
                path: `${element.destination}/${element.filename}`,
                fileName: element.originalname,
                modelName: "ActivityResource",
              };
              this.eventEmitter.emit("event.attachment", eventData);
            }
          }
      } else {
        let resource = await this.prisma.content_resources.create({
          data: {
            content_id: contentActivityId,
            name: item.filename,
            is_viewable: item.is_viewable,
            is_downloadable: item.is_downloadable,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        });

        let eventData = {};
        if (images.ActivityResource)
          for (let index = 0; index < images.ActivityResource.length; index++) {
            const element = images.ActivityResource[index];
            if (element.originalname === item.filename) {
              eventData = {
                modelId: resource.id,
                path: `${element.destination}/${element.filename}`,
                fileName: element.filename,
                modelName: "ActivityResource",
              };
              this.eventEmitter.emit("event.attachment", eventData);
            }
          }
      }

    });
  }

  async updateContentActivtyBlocksWithJson(
    contentActivityId: number,
    blocks: ContentBlocksUpdateJsonDto[],
    contentTypeId: number,
    instructorId: number,
  ) {

    blocks.map(async (item, index) => {

      if (item.id) {
        if (item.isblockdeleted) {
          await this.prisma.content_blocks.deleteMany({
            where: {
              block_id: item.id
            },
          })
          await this.prisma.attachments.deleteMany({
            where: {
              attachmentable_id: item.id,
              field_name: "block"
            },
          })
          return;
        } else {
          let block = await this.prisma.blocks.update({
            where: {
              id: item.id
            },
            data: {
              title: item.title,
              is_instructor_only: item.is_instructor_only,
              description: item.description,
              content_type_id: contentTypeId,
              instructor_id: instructorId,
              sequence_no: item.sequence_no,
              updated_at: new Date().toISOString()
            },
          });


          for (const blockattachment of item.blockattachment)
            await this.prisma.attachments.upsert({
              where: {
                id: blockattachment.id
              },
              create: {
                attachment_type_id: blockattachment?.attachment_types_id,
                Image_key: blockattachment?.imageKey,
                path: blockattachment?.path,
                field_name: blockattachment?.filename,
                attachmentable_id: block.id,
                attachmentable_type: 'block',
              },
              update: {
                attachment_type_id: blockattachment?.attachment_types_id,
                Image_key: blockattachment?.imageKey,
                path: blockattachment?.path,
                field_name: blockattachment?.filename,
                attachmentable_id: block.id,
                attachmentable_type: 'block',
              }
            })
        }
      } else {
        let block = await this.prisma.blocks.create({
          data: {
            title: item.title,
            is_instructor_only: item.is_instructor_only,
            description: item.description,
            content_type_id: contentTypeId,
            instructor_id: instructorId,
            sequence_no: item.sequence_no,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });

        await this.prisma.content_blocks.create({
          data: {
            content_id: contentActivityId,
            block_id: block.id,
            instructor_id: instructorId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });

        for (const blockattachment of item.blockattachment) {
          await this.prisma.attachments.create({
            data: {
              attachment_type_id: blockattachment?.attachment_types_id,
              Image_key: blockattachment?.imageKey,
              path: blockattachment?.path,
              field_name: blockattachment?.filename,
              attachmentable_id: block.id,
              attachmentable_type: 'block',
            },
          })
        }
      }
    })


  }
  async updateContentActivtyResourcesWithJson(
    contentActivityId: number,
    resource: ContentResourceUpdateJsonDto[],
  ) {
    resource.map(async (item, index) => {
      if (item.id) {
        if (item.isdeleted) {
          await this.prisma.content_resources.delete({
            where: {
              id: item.id,
            }
          })
          await this.prisma.attachments.delete({
            where: {
              id: item.attachment.id
            },
          })
          return;
        } else {
          let resource = await this.prisma.content_resources.update({
            where: {
              id: item.id
            },
            data: {
              content_id: contentActivityId,
              name: item.filename,
              is_viewable: item.is_viewable,
              is_downloadable: item.is_downloadable,
              updated_at: new Date().toISOString()
            }
          });

          await this.prisma.attachments.update({
            where: {
              id: item.attachment.id
            },
            data: {
              attachment_type_id: item?.attachment.attachment_types_id,
              Image_key: item?.attachment.imageKey,
              path: item?.attachment.path,
              field_name: item?.attachment.filename,
              attachmentable_id: resource.id,
              attachmentable_type: 'ActivityResource',
            }
          })
        }
      } else {
        let resource = await this.prisma.content_resources.create({
          data: {
            content_id: contentActivityId,
            name: item.filename,
            is_viewable: item.is_viewable,
            is_downloadable: item.is_downloadable,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        });

        await this.prisma.attachments.create({
          data: {
            attachment_type_id: item?.attachment.attachment_types_id,
            Image_key: item?.attachment.imageKey,
            path: item?.attachment.path,
            field_name: item?.attachment.filename,
            attachmentable_id: resource.id,
            attachmentable_type: 'ActivityResource',
          }
        })
      }

    });
  }
  //============================================Content Activity Delete=====================================================================================================


  async removeContentActivity(id: number, response: Response) {
    try {
      let isFoundSession = await this.prisma.contents.findFirst({
        where: {
          content_sessions_content_sessions_session_idTocontents: {
            some: {
              contents_content_sessions_course_idTocontents: {
                content_module_segments: {
                  some: {
                    content_module_segment_activities: {
                      some: {
                        content_activity_id: {
                          in: [id]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
      });

      if (isFoundSession) {
        throw new HttpException(
          "Content Activity Cannot be Deleted !!",
          HttpStatus.BAD_REQUEST
        );
      } else {
        let isFound = await this.prisma.contents.update({
          where: {
            id,
          },
          data: {
            is_active: false
          }
        });
        if (isFound) {
          response.status(HttpStatus.OK).json(isFound);
        } else {
          throw new HttpException(
            "Content Activity Not Found!!",
            HttpStatus.NOT_FOUND
          );
        }
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  //============================================Content Activity Ids=====================================================================================================


  async getActivitesbyActivitesIds(dto: FindActivityByArrayofIds, response: Response) {
    try {


      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Activity",
        },
      });
      let Activities = await this.prisma.contents.findMany({
        where: {
          id: {
            in: dto.Activity_ids
          },
          content_type_id: conentType.id
        },
        include: {
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
          working_types: {
            select: {
              id: true,
              title: true,
            },
          },
          content_skills: {
            select: {
              skills: {
                select: {
                  id: true,
                  title: true,
                },
              },
              sub_skills: {
                select: {
                  id: true,
                  title: true,
                },
              },
              skill_points: true,
            },
          },
          content_types: {
            select: {
              id: true,
              title: true,
            },
          },
          content_vocabularies: {
            select: {
              id: true,
              vocabulary: true,
              vocabulary_definition: true,
            },
          },
          content_standards: {
            select: {
              standards: {
                select: {
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
          content_resources: {
            select: {
              id: true,
              is_downloadable: true,
              is_viewable: true
            }
          }
        },
      })

      if (Activities) {
        response.status(HttpStatus.OK).json(Activities);
      } else {
        throw new HttpException(
          "Content Activites Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //============================================Content Activity Duplication=====================================================================================================
  async duplicateActivity(query: ActivityDuplicationDto, response: Response | null) {
    try {

      let userActivityExist = await this.prisma.contents.findFirst({
        where: {
          id: query.ActivityId,
          content_types: {
            title: 'Activity'
          }
        },
        include: {
          content_subject_disciplines: true,
          content_skills: true,
          content_vocabularies: true,
          content_standards: true,
          content_blocks: {
            include: {
              blocks: true
            }
          },
          content_resources: true
        }
      })

      if (userActivityExist) {
        let isduplicatedCreated = await this.prisma.contents.create(({
          data: {
            title: query?.activityName ?? userActivityExist.title + 'copy',
            content_description: userActivityExist.content_description,
            availability_id: userActivityExist.availability_id,
            working_type_id: userActivityExist.working_type_id,
            duration: userActivityExist.duration,
            from_grade_id: userActivityExist.from_grade_id,
            to_grade_id: userActivityExist.to_grade_id,
            from_age: userActivityExist.from_age,
            to_age: userActivityExist.to_age,
            content_type_id: userActivityExist.content_type_id,
            instructor_id: query.createrID,
            organization_id: userActivityExist.organization_id,
            isDraft: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }))


        await Promise.all([
          this.duplicationContentActivtySubjects(
            isduplicatedCreated.id,
            userActivityExist.content_subject_disciplines
          ),
          this.duplicationContentActivSkills(
            isduplicatedCreated.id,
            userActivityExist.content_skills
          ),
          this.duplicationContentActivtyVocabularys(
            isduplicatedCreated.id,
            userActivityExist.content_vocabularies
          ),
          this.duplicationContentActivtyStandards(
            isduplicatedCreated.id,
            userActivityExist.content_standards
          ),
          this.duplicationContentActivtyBlocks(
            isduplicatedCreated.id,
            query.createrID,
            userActivityExist.content_blocks,
            userActivityExist.content_type_id,
          ),
          this.duplicationContentActivtyResources(
            isduplicatedCreated.id,
            userActivityExist.content_resources,
          )
        ])

        let attachments = await this.serviceFunction.getAttachments(
          userActivityExist.id,
          "Activity"
        );
        if (attachments) {
          await this.prisma.attachments.create({
            data: {
              attachment_type_id: attachments.attachment_types.id,
              path: attachments.path,
              field_name: 'Activity',
              Image_key: attachments.Image_key,
              attachmentable_id: isduplicatedCreated.id,
              attachmentable_type: 'Activity',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          });
        }

        if (response) {
          response.status(HttpStatus.OK).json({
            message: 'Activity Duplicated Succesfully!!'
          });
        } else {
          return isduplicatedCreated.id
        }


      } else {
        throw new HttpException('Activity Not Found!!!!', HttpStatus.NOT_FOUND)
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async duplicationContentActivtySubjects(
    activityId: number,
    content_subject_disciplines: any[]
  ) {
    content_subject_disciplines.map(async (item, index) => {
      await this.prisma.content_subject_disciplines.create({
        data: {
          content_id: activityId,
          subject_id: item.subject_id,
          subject_discipline_id: item.subject_discipline_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  duplicationContentActivSkills(
    activityId: number,
    content_skills: any[]
  ) {
    content_skills.map(async (item, index) => {
      await this.prisma.content_skills.create({
        data: {
          content_id: activityId,
          skill_id: item.skill_id,
          sub_skill_id: item.sub_skill_id,
          skill_points: item.skill_points,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  duplicationContentActivtyVocabularys(
    activityId: number,
    content_vocabularies: any[]
  ) {
    content_vocabularies.map(async (item, index) => {
      await this.prisma.content_vocabularies.create({
        data: {
          content_id: activityId,
          vocabulary: item.vocabulary,
          vocabulary_definition: item.vocabulary_definition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }

  duplicationContentActivtyStandards(
    activityId: number,
    content_standards: any[]
  ) {
    content_standards.map(async (item, index) => {
      await this.prisma.content_standards.create({
        data: {
          content_id: activityId,
          standard_id: item.standard_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  }
  duplicationContentActivtyBlocks(
    activityId: number,
    instructor_id: number,
    content_blocks: any,
    conentTypeId: number,
  ) {

    content_blocks.map(async (item, index) => {
      let block = await this.prisma.blocks.create({
        data: {
          title: item.blocks.title,
          is_instructor_only: item.blocks.is_instructor_only,
          description: item.blocks.description,
          content_type_id: conentTypeId,
          instructor_id: instructor_id,
          sequence_no: item.blocks.sequence_no,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      await this.prisma.content_blocks.create({
        data: {
          content_id: activityId,
          block_id: block.id,
          instructor_id: instructor_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });


      const attachments = await this.serviceFunction.getmultipleAttachments(
        item.block_id,
        "block"
      );

      for (const attachment of attachments) {
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: attachment.attachment_types.id,
            path: attachment.path ? attachment.path : null,
            field_name: 'block',
            attachmentable_id: block.id,
            attachmentable_type: 'block',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      }



    });
  }
  async duplicationContentActivtyResources(
    activityId: number,
    content_resources: any,
  ) {
    content_resources.map(async (item, index) => {
      let resource = await this.prisma.content_resources.create({
        data: {
          content_id: activityId,
          name: item.name,
          is_viewable: item.is_viewable,
          is_downloadable: item.is_downloadable,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      });

      const attachments = await this.serviceFunction.getAttachments(
        item.id,
        "ActivityResource"
      );
      if (attachments) {
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: attachments?.attachment_types.id,
            path: attachments?.path,
            field_name: 'ActivityResource',
            Image_key: attachments.Image_key,
            attachmentable_id: resource.id,
            attachmentable_type: 'ActivityResource',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      }

    });

  }
  //=================================================================================================================================================================
}

