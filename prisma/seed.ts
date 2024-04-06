import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const subjects_List = require("../src/data/subjectdispline.json");
const skills_list = require("../src/data/skills.json");
const standard_List = require("../src/data/contentStandard.json");
const bcrypt = require("bcryptjs");
const Learners = require("../src/data/learner.json");
async function main() {
  console.log("---------------------------Seed Db-------------------------");


  //   let account_types_List = [
  //     { name: "Instructor" },
  //     { name: "Parent" },
  //     { name: "Learner" },
  //     { name: "Organzation" },
  //   ];

  //   let contentTypeList = [
  //     { title: "Activity" },
  //     { title: "Course" },
  //     { title: "Session" },
  //   ];

  //   let availabilityList = [
  //     { title: "Private to Owner" },
  //     { title: "Private to Organization" },
  //     { title: "Available to Public" }
  //   ];

  //   let module_segment_types = [
  //     { title: "Dependent" },
  //     { title: "Private to Organization" },
  //     { title: "Homework" },
  //     { title: "Reflection" },
  //   ];

  //   let module_segment_deliveries = [
  //     { title: "Blended Learning" },
  //     { title: "Flipped Learning" },
  //     { title: "On-line Learning" },
  //     { title: "Project-based Learning" },
  //     { title: "Small group" },
  //     { title: "Teacher Lead" },
  //   ];
  //   let ContentWorkingType = [
  //     { title: "Dependent" },
  //     { title: "Do it Yourself" },
  //     { title: "Homework" },
  //     { title: "Reflection" },
  //   ];

  //   let session_types = [
  //     { name: "Hybrid" },
  //     { name: "Do it Yourself" },
  //     { name: "Teacher Led" },
  //   ];

  //   let class_Type = [{ name: "Live" }, { name: "In-Classroom" }];

  //   let grade_list = [
  //     { name: "First grade" },
  //     { name: "Second grade" },
  //     { name: "Third grade" },
  //     { name: "Fourth grade" },
  //     { name: "Fifth grade" },
  //     { name: "Sixth grade" },
  //     { name: "Seventh grade" },
  //     { name: "Eighth grade" },
  //     { name: "Ninth grade (Freshman year)" },
  //     { name: "Tenth grade (Sophomore year)" },
  //     { name: "Eleventh grade (Junior year)" },
  //     { name: "Twelfth grade (Senior year)" },
  //   ];

  //   let expierence_list = [
  //     { name: "Entry Level (0-1 years)" },
  //     { name: "Junior Level (1-3 years)" },
  //     { name: "Mid-Level (3-5 years)" },
  //     { name: "Senior Level (5-10 years)" },
  //     { name: "Executive Level (10+ years)" },
  //   ];

  //   let techingStyle = [
  //     { name: "Hands-on Learning" },
  //     { name: "Question and Answer" },
  //     { name: "Game-based Learning" },
  //     { name: "Direct Instruction" },
  //   ];

  //   let attachment_types = [
  //     { name: "Text" },
  //     { name: "Image" },
  //     { name: "Audio" },
  //     { name: "Video" },
  //     { name: "File" },
  //   ];

  //   let question_types = [{ name: "Mcqs" }];

  //   let smartDesk_type = [
  //     { title: "Whiteboard" },
  //     { title: "Text Editor" },
  //     { title: "Coding" },
  //     { title: "Calculator" },
  //     { title: "Polling" },
  //     { title: "Video Challenges" },
  //     { title: "Share" },
  //     { title: "Quiz" },
  //   ];

  //   let interactive_type = [
  //     { name: "Quiz" },
  //     { name: "Quest" },
  //     { name: "Assignment" },
  //   ];

  //   await prisma.smartdesk_types.createMany({
  //     data: smartDesk_type,
  //   });

  //   await prisma.account_types.createMany({
  //     data: account_types_List,
  //   });

  //   await prisma.interactive_types.createMany({
  //     data: interactive_type,
  //   });

  //   await prisma.question_types.createMany({
  //     data: question_types,
  //   });

  //  // adding subject and subject discipline
  //   for (let i = 0; i < subjects_List.length; i++) {
  //     let subjectsCreted = await prisma.subjects.create({
  //       data: {
  //         name: subjects_List[i].subject_name,
  //       },
  //     });
  //     for (let j = 0; j < subjects_List[i].disciplines.length; j++) {
  //       await prisma.subject_disciplines.create({
  //         data: {
  //           subject_id: subjectsCreted.id,
  //           name: subjects_List[i].disciplines[j].discipline_name,
  //         },
  //       });
  //     }
  //   }

  //  // adding skill and sub skills
  //   for (let i = 0; i < skills_list.length; i++) {
  //     let skill = await prisma.skills.create({
  //       data: {
  //         title: skills_list[i].skills,
  //       },
  //     });
  //     for (let j = 0; j < skills_list[i].subSkills.length; j++) {
  //       await prisma.sub_skills.create({
  //         data: {
  //           skill_id: skill.id,
  //           title: skills_list[i].subSkills[j],
  //         },
  //       });
  //     }
  //   }

  //  // content standard

  //   for (let i = 0; i < standard_List.length; i++) {
  //     let element1 = standard_List[i];
  //     let standardType = await prisma.standard_types.create({
  //       data: {
  //         title: element1.standardType,
  //       },
  //     });

  //     for (let j = 0; j < element1.standardLevel.length; j++) {
  //       let element2 = element1.standardLevel[j];
  //       let standard_levels = await prisma.standard_levels.create({
  //         data: {
  //           standard_type_id: standardType.id,
  //           title: element2.levelName,
  //         },
  //       });

  //       for (let k = 0; k < element2.LevelSubject.length; k++) {
  //         let element3 = element2.LevelSubject[k];
  //         let standard_subjects = await prisma.standard_subjects.create({
  //           data: {
  //             standard_level_id: standard_levels.id,
  //             title: element3.subjectName,
  //           },
  //         });

  //         for (let l = 0; l < element3.standard.length; l++) {
  //           let element4 = element3.standard[l];
  //           await prisma.standards.create({
  //             data: {
  //               standard_type_id: standardType.id,
  //               standard_level_id: standard_levels.id,
  //               standard_subject_id: standard_subjects.id,
  //               title: element4,
  //             },
  //           });
  //         }
  //       }
  //     }
  //   }



  //   await prisma.grades.createMany({
  //     data: grade_list,
  //   });
  //   await prisma.experty_levels.createMany({
  //     data: expierence_list,
  //   });

  //   await prisma.teaching_styles.createMany({
  //     data: techingStyle,
  //   });

  //   await prisma.attachment_types.createMany({
  //     data: attachment_types,
  //   });

  //   await prisma.content_types.createMany({
  //     data: contentTypeList,
  //   });

  //   await prisma.working_types.createMany({
  //     data: ContentWorkingType,
  //   });

  //   await prisma.availabilities.createMany({
  //     data: availabilityList,
  //   });

  //   await prisma.module_segment_types.createMany({
  //     data: module_segment_types,
  //   });

  //   await prisma.module_segment_deliveries.createMany({
  //     data: module_segment_deliveries,
  //   });

  //   await prisma.session_types.createMany({
  //     data: session_types,
  //   });

  //   await prisma.class_types.createMany({
  //     data: class_Type,
  //   });


  // try {

  //   for (const learner of Learners) {
  //     console.log(learner.User_Name)
  //     const hash = bcrypt.hashSync(learner.Password, 5);
  //     let UserLearnerCreated = await prisma.users.create({
  //       data: {
  //         first_name: learner.First_Name,
  //         last_name: learner.Last_Name,
  //         email: '',
  //         password: hash,
  //         user_name: learner.User_Name.toString(),
  //         account_type_id: 3,
  //         bio: "",
  //         per_hour_rate: 0,
  //         organization_id: 12,
  //         is_independent: false,
  //         is_private_policies: true,
  //         is_term_condition: true,
  //         created_at: new Date().toISOString(),
  //         email_verified_at: new Date().toISOString(),
  //         role_id: 6,
  //         learner_details: {
  //           create: {
  //             to_grade_id: 8,
  //             from_grade_id: 6,
  //             date_of_birth: '2012-12-12T08:00:00.000Z',
  //           },
  //         },
  //       },
  //     });

  //     await prisma.attachments.create({
  //       data: {
  //         attachment_type_id: 2,
  //         Image_key: '430/1695750935770-46016297.jpg',
  //         path: 'https://upbrainery-2023-stage.s3.us-east-2.amazonaws.com/430/1695750935770-46016297.jpg',
  //         field_name: '1695750935770-46016297.jpg',
  //         attachmentable_id: UserLearnerCreated.id,
  //         attachmentable_type: 'User',
  //         user_id: UserLearnerCreated.id
  //       },
  //     });

  //     console.log(`Learner Created : ${learner.User_Name} ${learner.First_Name}_${learner.Last_Name}`)
  //   }
  // } catch (error) {
  //   console.log(error)
  // }

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
