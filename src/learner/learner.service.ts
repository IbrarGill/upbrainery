import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLearnerDto, LearnerQuery } from './dto/create-learner.dto';
import { LearnerCareerInterest, LearnerGoals, LearnerHobbies, LearnerInterest, LearnerSkills, UpdateLearnerDto } from './dto/update-learner.dto';
import { Response, Request } from "express";
import { PrismaService } from 'src/prisma/prisma.client';
import { CommonFunctionsService } from 'src/services/commonService';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { de } from 'date-fns/locale';
@Injectable()
export class LearnerService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }

  async findAll(query: LearnerQuery, response: Response) {

    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;


      let account_type = await this.prisma.account_types.findUnique({
        where: {
          name: 'Learner'
        },
      });

      let contentCount = await this.prisma.users.count({
        where: {
          account_type_id: account_type.id
        },
      });

      let isFound: any = await this.prisma.users.findMany({
        where: {
          account_type_id: account_type.id
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      if (isFound) {
        for (const item of isFound) {
          const attachments = await this.serviceFunction.getAttachments(
            item.id,
            "User"
          );
          item.attachments = attachments;
          delete item.password;
          delete item.refresh_token;
        }

        response.status(HttpStatus.OK).json({
          total: contentCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException(
          "Learner Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let user: any = await this.prisma.users.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          email: true,
          email_verified_at: true,
          account_type_id: true,
          learner_details: true,
          organizations: true,
          learner_hobbies: {
            select: {
              hobbies: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          learner_interests: {
            select: {
              interests: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          learner_goals: {
            select: {
              goals: {
                select: {
                  id: true,
                  goal: true
                }
              }
            }
          },
          learner_skills: {
            select: {
              skills: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }

      });
      if (user) {
        let attachments: any = await this.serviceFunction.getAttachments(
          user.id,
          "User"
        );
        user.attachments = attachments;
        delete user.refresh_token;
        delete user.password;

        return response.status(HttpStatus.OK).json(user);
      } else {
        throw new HttpException(
          "Learner Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async gethobbies(response: Response) {
    try {
      let hobbies: any = await this.prisma.hobbies.findMany({
        select: {
          id: true,
          title: true
        }
      });
      if (hobbies) {
        return response.status(HttpStatus.OK).json(hobbies);
      } else {
        throw new HttpException(
          "Learner Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async getgoals(response: Response) {
    try {
      let goals: any = await this.prisma.goals.findMany({
        select: {
          id: true,
          goal: true
        }
      });
      if (goals) {
        return response.status(HttpStatus.OK).json(goals);
      } else {
        throw new HttpException(
          "Learner Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getinterest(response: Response) {
    try {
      let interests: any = await this.prisma.interests.findMany({
        select: {
          id: true,
          title: true
        }
      });
      if (interests) {
        return response.status(HttpStatus.OK).json(interests);
      } else {
        throw new HttpException(
          "Learner Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async getcareerinterest(response: Response) {
    try {
      let interests: any = await this.prisma.career_interests.findMany({
        select: {
          id: true,
          name: true
        }
      });
      if (interests) {
        return response.status(HttpStatus.OK).json(interests);
      } else {
        throw new HttpException(
          "Career Interest Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(learnerId: number, files: Express.Multer.File, dto: UpdateLearnerDto, response: Response) {
    try {
      let images: any = files;

      let userExit = await this.prisma.users.findFirst({
        where: { id: learnerId },
        include: {
          learner_details: {
            select: {
              id: true,
              date_of_birth: true,
              to_grade_id: true,
              from_grade_id: true,
              learner_interest: true,
            }
          },
        }
      });
      let from_grade_id = Number.parseInt(dto.grades.split('-')[0])
      let to_grade_id = Number.parseInt(dto.grades.split('-')[1])
      let isUpdated = await this.prisma.users.update({
        where: {
          id: learnerId
        },
        data: {
          first_name: dto.firstName ?? userExit.first_name,
          last_name: dto.lastName ?? userExit.last_name,
        },
      });

      await this.prisma.learner_details.upsert({
        where: {
          id: learnerId
        },
        update: {
          date_of_birth: dto.DOB ?? userExit.learner_details[0].date_of_birth,
          to_grade_id: to_grade_id ?? userExit.learner_details[0].to_grade_id,
          from_grade_id: from_grade_id ?? userExit.learner_details[0].from_grade_id,
          learner_interest: dto.carrier_interest ?? userExit.learner_details[0].learner_interest
        },
        create: {
          date_of_birth: dto.DOB ?? userExit.learner_details[0].date_of_birth,
          to_grade_id: to_grade_id ?? userExit.learner_details[0].to_grade_id,
          from_grade_id: from_grade_id ?? userExit.learner_details[0].from_grade_id,
          learner_interest: dto.carrier_interest ?? userExit.learner_details[0].learner_interest
        }
      })

      await Promise.all([
        dto.learner_hobbies ? this.savelearnerhobbies(learnerId, dto.learner_hobbies) : null,
        dto.learner_interest ? this.savelearnerinterest(learnerId, dto.learner_interest) : null,
        dto.learner_goals ? this.savelearnergoals(learnerId, dto.learner_goals) : null,
        dto.learner_skills ? this.savelearnerskill(learnerId, dto.learner_skills) : null,
        dto.Learner_Career_Interest ? this.savelearnerCareerInterest(learnerId, dto.Learner_Career_Interest) : null
      ])

      if (isUpdated) {
        delete isUpdated.password;
        this.findOne(learnerId, response);
        if (images.avator) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.avator[0].destination}/${images.avator[0].filename}`,
            fileName: images.avator[0].filename,
            modelName: "User",
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async savelearnerhobbies(learnerId: number, learnerHobbies: LearnerHobbies[]) {
    try {
      await this.prisma.learner_hobbies.deleteMany({
        where: {
          learner_id: learnerId
        }
      })

      learnerHobbies.map(async (item, index) => {
        await this.prisma.learner_hobbies.create({
          data: {
            learner_id: learnerId,
            hobby_id: item.learner_hobby
          }
        })
      })
    } catch (error) {
      console.log(error)
    }


  }
  async savelearnerinterest(learnerId: number, learnerInterest: LearnerInterest[]) {
    try {
      await this.prisma.learner_interests.deleteMany({
        where: {
          learner_id: learnerId
        }
      })

      learnerInterest.map(async (item, index) => {
        await this.prisma.learner_interests.create({
          data: {
            learner_id: learnerId,
            interest_id: item.learner_interest
          }
        })
      })
    } catch (error) {
      console.log(error)
    }

  }
  async savelearnergoals(learnerId: number, learnerGoals: LearnerGoals[]) {
    try {
      await this.prisma.learner_goals.deleteMany({
        where: {
          learner_id: learnerId
        }
      })
      learnerGoals.map(async (item, index) => {
        await this.prisma.learner_goals.create({
          data: {
            learner_id: learnerId,
            goal_id: item.learner_goal
          }
        })
      })
    } catch (error) {
      console.log(error)
    }


  }
  async savelearnerskill(learnerId: number, learnerSkills: LearnerSkills[]) {
    try {
      await this.prisma.learner_skills.deleteMany({
        where: {
          learner_id: learnerId
        }
      })
      learnerSkills.map(async (item, index) => {
        await this.prisma.learner_skills.create({
          data: {
            learner_id: learnerId,
            skill_id: item.learner_skill
          }
        })
      })
    } catch (error) {
      console.log(error)
    }

  }

  async savelearnerCareerInterest(learnerId: number, learnerCareerInterest: LearnerCareerInterest[]) {
    try {
      await this.prisma.learner_career_interests.deleteMany({
        where: {
          learner_id: learnerId
        }
      })
      learnerCareerInterest.map(async (item, index) => {
        await this.prisma.learner_career_interests.create({
          data: {
            learner_id: learnerId,
            career_interest_id: item.career_interest_id
          }
        })
      })
    } catch (error) {
      console.log(error)
    }

  }

  async disablelearner(id: number, response: Response) {
    try {
      let userExit = await this.prisma.users.findFirst({
        where: {
          id: id,
          account_types: {
            name: "Learner",
          },
        },
      });
      if (userExit) {
        let isUpdated = await this.prisma.users.update({
          where: {
            id: id,
          },
          data: {
            is_block: !userExit.is_block,
          },
        });
        return response.status(HttpStatus.OK).json({
          status: isUpdated.is_block ? "User Disabled Succussfully!!" : "User Enabled Succussfully!!",
        });
      } else {
        throw new HttpException("Learner not found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async learnerstats(learnerId: number, response: Response) {
    try {

      let resullts = await Promise.all([
        this.sessionCompleted(learnerId),
        this.sessionInProgress(learnerId),
        this.sessionUpComing(learnerId)
      ])

      return response.status(HttpStatus.OK).json({
        sessionCompleted: resullts[0],
        sessionInProgress: resullts[1],
        sessionUpComing: resullts[2]
      });

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async sessionCompleted(learnerId: number) {
    try {
      let sessionCompleted = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: learnerId,
          progress: {
            gte: 100
          }
        }
      })
      return sessionCompleted.length
    } catch (error) {
      console.log(error)
    }
  }

  async sessionInProgress(learnerId: number) {
    try {
      let sessionInProgress = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: learnerId,
          progress: {
            gt: 0,
            lt: 100
          }
        }
      })
      return sessionInProgress.length
    } catch (error) {
      console.log(error)
    }
  }

  async sessionUpComing(learnerId: number) {
    try {
      let currentDate = new Date().toISOString()
      let sessionUpComing = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: learnerId,
          content_sessions: {
            content_session_details: {
              some: {
                start_date: {
                  gt: currentDate
                }
              }
            }
          }
        }
      })
      return sessionUpComing.length
    } catch (error) {
      console.log(error)
    }
  }


  async badgesearned(learnerId: number, response: Response) {
    try {

      let badgesearned: any = await this.prisma.learner_badges.findMany({
        where: {
          learner_id: learnerId
        },
        select: {
          badges: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      if (badgesearned) {
        for (const item of badgesearned) {
          const attachments = await this.serviceFunction.getAttachments(
            item.badges.id,
            "BadgeImage"
          );
          item.badges.attachment = attachments.path
        }
        response.status(HttpStatus.OK).json(badgesearned)
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }



  async learnerBaseSkillCourses(learnerId: number, response: Response, request: Request) {
    try {

      let user: any = request.user;
      let courses: any = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: learnerId
        },
        select: {
          course_id: true
        }
      })
      courses = courses.map((course) => course.course_id);

      let skills: any = await this.prisma.content_skills.findMany({
        where: {
          contents: {
            content_module_segment_activities_content_module_segment_activities_content_activity_idTocontents: {
              some: {
                contents_content_module_segment_activities_content_idTocontents: {
                  id: {
                    in: courses,
                  },
                  content_type_id: 2
                }
              }
            }
          }
        },
        select: {
          skills: {
            select: {
              id: true,
              title: true
            }
          },
          sub_skills: {
            select: {
              id: true,
              title: true
            }
          },
          skill_points: true,
          contents: {
            select: {
              content_module_segment_activities_content_module_segment_activities_content_activity_idTocontents: {
                select: {
                  contents_content_module_segment_activities_content_idTocontents: {
                    select: {
                      id: true,
                      title: true,
                      content_description: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      if (skills) {
        for (const skill of skills) {
          let courses = [];
          for (const course of skill.contents.content_module_segment_activities_content_module_segment_activities_content_activity_idTocontents) {
            courses.push(course.contents_content_module_segment_activities_content_idTocontents)
          }
          skill.courses = courses
          delete skill.contents
        }
        return response.status(HttpStatus.OK).json(skills)
      }

    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
