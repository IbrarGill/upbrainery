import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from "express";
import { CommonFunctionsService } from 'src/services/commonService';
import { PrismaService } from 'src/prisma/prisma.client';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { QueryInteractiveLearnersList, QueryLearnerQuizDetails } from './dto/create-gradebook.dto';
@Injectable()
export class GradebookService {

  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
  ) { }

  async sessiondetails(sessionId: number, response: Response) {
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
                }
              },
            },
          },
        },
      });





      if (isFound) {


        let course_id = isFound.content_sessions_content_sessions_session_idTocontents[0].course_id;
        let interactives = [];
        let sessDuration = 0;


        let course: any = await this.prisma.contents.findFirst({
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
          },
        });


        for (const item of course?.content_interactive_segments) {

          if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {

            let sessionQuizFound = await this.prisma.content_interactive_segment_sessions.findFirst({
              where: {
                session_id: isFound.id,
                content_interactive_segment_id: item.id
              }
            })

            interactives.push({
              interactive_Id: item.interactives?.id,
              title: item.interactives?.title,
              description: item.interactives?.description,
              type: 'Quiz',
              start_date: sessionQuizFound?.start_date,
              end_date: sessionQuizFound?.end_date,
              is_quiz_graded: sessionQuizFound?.is_quiz_graded,
              is_quiz_offiline: sessionQuizFound?.is_quiz_offiline,
              content_interactive_segments_id: sessionQuizFound?.content_interactive_segment_id,
            })

          } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Assignment") {

            let sessionAssignment = await this.prisma.content_interactive_segment_sessions.findFirst({
              where: {
                session_id: isFound.id,
                content_interactive_segment_id: item.id
              }
            })

            interactives.push({
              interactive_Id: item.interactives?.id,
              title: item.interactives?.title,
              description: item.interactives?.description,
              type: 'Assignmnet',
              start_date: sessionAssignment?.start_date,
              end_date: sessionAssignment?.end_date,
              is_assesment: sessionAssignment?.is_assesment,
              segment_points: sessionAssignment?.segment_points,
              content_interactive_segments_id: sessionAssignment?.content_interactive_segment_id,
            })
          }
        }

        for (const _activities of course.content_module_segments) {
          for (const item of _activities.content_module_segment_activities) {
            sessDuration = sessDuration + item.contents_content_module_segment_activities_content_activity_idTocontents.duration
          }
        }

        isFound.course_id = course_id;
        isFound.duration = sessDuration;
        isFound.content_session_id = isFound.content_sessions_content_sessions_session_idTocontents[0].id;
        isFound.is_published = isFound.content_sessions_content_sessions_session_idTocontents[0].is_published
        isFound.content_session_details = isFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0];
        isFound.interactives = interactives;
        delete isFound.content_sessions_content_sessions_session_idTocontents
        response.status(HttpStatus.OK).json(isFound);
      } else {
        throw new HttpException(
          "Content Session Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async interactiveStudentlistandmarks(query: QueryInteractiveLearnersList, response: Response) {
    try {
      let session_learner = await this.prisma.learner_courses.findMany({
        where: {
          course_id: query.course_id,
          content_session_id: query.content_session_id
        },
        select: {
          users: {
            select: {
              id: true,
              user_name: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        }
      })
      let LearnerMarksList = []
      if (session_learner.length > 0) {

        for (const item of session_learner) {
          let isFound: any;
          let attachments = await this.serviceFunction.getAttachments(
            item.users.id,
            "User"
          );

          if (query.interactiveTypeId === 1) {
            isFound = await this.prisma.interactive_quiz_results.findFirst({
              where: {
                learner_id: item.users.id,
                course_id: query.course_id,
                interactive_id: query.interactiveId
              }
            })

            LearnerMarksList.push({
              imageURL: attachments?.path ?? null,
              username: item.users.user_name,
              score: isFound?.marks ?? null,
              submissionDate: isFound?.created_at ?? null,
              quizResultID: isFound?.id ?? null
            })

          } else if (query.interactiveTypeId === 3) {
            isFound = await this.prisma.interactive_assignment_submissions.findFirst({
              where: {
                learner_id: item.users.id,
                course_id: query.course_id,
                interactive_id: query.interactiveId
              }
            })

            LearnerMarksList.push({
              imageURL: attachments?.path ?? null,
              username: item.users.user_name,
              score: isFound?.obtained_marks ?? null,
              submissionDate: isFound?.created_at ?? null,
              assignmentResultID: isFound?.id ?? null
            })
          }



        }
        response.status(HttpStatus.OK).json(LearnerMarksList);
      } else {
        response.status(HttpStatus.OK).json(LearnerMarksList);
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async learnerquizdetails(query: QueryLearnerQuizDetails, response: Response) {
    try {


      let isFound = await Promise.all([
        this.getInteractiveResults(query.interactiveId, query.content_session_id, query.course_id, query.learnerId),
        this.getlearnerEarnedBadges(query.learnerId),
        this.getLearnerAssement(query.learnerId, query.course_id)
      ])

      let data = {
        grades: isFound[2].grade,
        skills: isFound[0],
        earnBadges: isFound[1],
        assesment: isFound[2].assesment,
      };

      response.status(HttpStatus.OK).json(data);
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getInteractiveResults(interactiveId: number, contentSessionId: number, courseId: number, learnerId: number) {
    let interactiveType = await this.prisma.interactives.findUnique({
      where: {
        id: interactiveId
      },
      select: {
        interactive_types_interactives_interactive_type_idTointeractive_types: {
          select: {
            name: true,
          }
        }
      }
    })

    if (interactiveType.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {
      let findQuizresults = await this.prisma.interactive_quiz_results.findFirst({
        where: {
          content_session_id: contentSessionId,
          course_id: courseId,
          learner_id: learnerId,
          interactive_id: interactiveId
        },
      })

      let QuizSubmissionFound =
        await this.prisma.interactive_quiz_submissions.findMany({
          where: {
            interactive_quiz_result_id: findQuizresults.id,
          },
        });

      let finalArray = [];
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
      let quizTitles = [];
      for (let item of finalArray) {
        quizTitles.push(item.question)
      }
      return { data: finalArray, titles: quizTitles, marks: findQuizresults.marks, totalMarks: findQuizresults.total_marks };
    }
    else if (interactiveType.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Assignment") {
      let AssignmentSubmissionFound: any =
        await this.prisma.interactive_assignment_submissions.findMany({
          where: {
            learner_id: learnerId,
            course_id: courseId,
            content_session_id: contentSessionId,
            interactive_id: interactiveId,
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
        });
      let totalmarks = 0;
      let obtainedMarks = 0;
      let titles = []
      for (let item of AssignmentSubmissionFound) {
        totalmarks += item.total_marks;
        obtainedMarks += item.obtained_marks;
        titles.push(item.questions.question)
      }
      return { data: AssignmentSubmissionFound, titles: titles, marks: obtainedMarks, totalMarks: totalmarks }
    }


  }



  async getlearnerEarnedBadges(learnerId: number) {
    let allLearners: any = await this.prisma.users.findFirst({
      where: {
        id: learnerId,
        learner_courses:
        {
          some: {
            learner_id: learnerId
          }
        }
      },
      select: {
        id: true,
        learner_courses: {
          select: {
            contents: {
              select: {
                id: true,
                title: true,
                is_active: true,
              }
            }
          }
        },
      }
    });

    if (allLearners) {

      let EarnedBadges = [];

      for (const courseList of allLearners.learner_courses) {

        let totalquiz = 0;
        let quizFound = 0;
        let totalassignment = 0;
        let assignmentFound = 0;
        let totalquest = 0;
        let questFound = 0;
        let totalactivities = 0;
        let course_id = courseList.contents.id;
        let course: any = await this.prisma.contents.findFirst({
          where: {
            id: course_id,
            content_types: {
              title: "Course"
            }
          },
          include: {
            badge_courses: {
              select: {
                id: true,
                badge_id: true,
                course_id: true,
                badges: {
                  select: {
                    id: true,
                    name: true,
                  }
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
            }
          }
        }
        let grade;
        let found = quizFound + questFound + assignmentFound;
        let total = totalquiz + totalquest + totalassignment;
        if (found != 0 && total != 0) {
          grade = (found / total) * 100
        } else {
          grade = 0
        }

        grade = `${parseFloat(grade.toFixed(2))} %`;

        if (grade > 95) {

          for (const badges of course.badge_courses) {
            const attachments = await this.serviceFunction.getAttachments(
              badges.badges.id,
              "BadgeImage"
            );
            badges.attachments = attachments;
            EarnedBadges.push(badges)
          }


        }

        return EarnedBadges;
      }

    }

  }

  async getLearnerAssement(learnerId: number, course_id: number) {
    let assesment = [];
    let totalquiz = 0;
    let quizFound = 0;
    let totalassignment = 0;
    let assignmentFound = 0;
    let totalquest = 0;
    let questFound = 0;
    let totalactivities = 0;

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
          assesment.push({
            id: item?.interactives.id,
            type: 'Quiz',
            title: item?.interactives.title,
            marks: isquizFound?.marks ?? null,
            submittedDate: isquizFound?.created_at ?? null
          })
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

          assesment.push({
            id: item?.interactives.id,
            type: 'Quest',
            title: item?.interactives.title,
            marks: isQuertFound?.marks ?? null,
            submittedDate: isQuertFound?.submission_date ?? null
          })

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
          assesment.push({
            id: item?.interactives.id,
            type: 'Assignment',
            title: item?.interactives.title,
            marks: isAssignmentFound?.obtained_marks ?? null,
            submittedDate: isAssignmentFound?.submission_date ?? null
          })
        }
      }

      for (const _activities of course?.content_module_segments) {
        for (const item of _activities.content_module_segment_activities) {
          totalactivities++;
        }
      }
    }
    let grade;
    let found = quizFound + questFound + assignmentFound;
    let total = totalquiz + totalquest + totalassignment;
    if (found != 0 && total != 0) {
      grade = (found / total) * 100
    } else {
      grade = 0
    }

    grade = `${parseFloat(grade.toFixed(2))} %`;

    return { assesment, grade }
  }

}


