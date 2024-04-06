export const TutorBio =
  "As a tutor, I am dedicated to helping students develop their skills and achieve their academic goals. I am patient, empathetic, and able to create a supportive and positive learning environment. I have a deep understanding of the subject matter I teach, and I am able to explain complex concepts in a way that is accessible and easy to understand. I believe that every student is unique, and I tailor my approach to meet the individual needs of each learner. I work closely with my students to identify their strengths and areas for improvement, and I develop personalized lesson plans to help them achieve their goals. I am a skilled communicator, and I am able to provide clear and constructive feedback to my students. I am also able to collaborate effectively with parents and teachers to ensure that each student is receiving the support they need to succeed. In addition to my teaching skills, I am highly organized and reliable. I am able to manage my time effectively and ensure that all materials and resources are prepared in advance of each session. Overall, I am passionate about education and committed to helping students unlock their full potential. I am confident that my skills and experience make me an excellent candidate for a tutoring position.";

export const TutorExpierence = [
  {
    subjectId: 3,
    grades: "2-5",
    expeirenceLevelId: 4,
  },
  {
    subjectId: 8,
    grades: "3-6",
    expeirenceLevelId: 3,
  },
  {
    subjectId: 2,
    grades: "6-8",
    expeirenceLevelId: 1,
  },
];
export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}
export const TutorCredentails = [
  { credentails: "Ardmore Airport" },
  { credentails: "Adam Airport" },
  { credentails: "Rockhampton Downs Airport" },
  { credentails: "Alligandi Airport" },
  { credentails: "Lewis University Airport" },
];

export const TutorTeachingStyle = [
  { teaching_style_id: 1 },
  { teaching_style_id: 2 },
  { teaching_style_id: 3 },
  { teaching_style_id: 4 },
];

export const ContentSubjectDiscipline = [
  {
    subject_id: 1,
    subject_discipline_id: 1,
  },
  {
    subject_id: 2,
    subject_discipline_id: 4,
  },
];

export const contentVocabularies = [
  {
    vocabulary: "abate",
    vocabulary_definition: "to become less intense or widespread",
  },
  {
    vocabulary: "benevolent",
    vocabulary_definition: "kindly and well-meaning",
  },
  {
    vocabulary: "conundrum",
    vocabulary_definition: "a confusing and difficult problem or question",
  },
  {
    vocabulary: "diligent",
    vocabulary_definition: "showing care and conscientiousness in one's work",
  },
];

export const courseBagdes = [
  {
    badgesId: 1
  },
  {
    badgesId: 2
  },
];

export const contentSkills = [
  {
    skill_id: 1,
    sub_skill_id: 1,
    skill_points: 10,
  },
  {
    skill_id: 2,
    sub_skill_id: 3,
    skill_points: 10,
  },
];

export const contentBlocks = [
  {
    title: "title 1",
    is_instructor_only: true,
    description: "description",
    content_type_id: 1,
    instructor_id: 1,
    sequence_no: 1,
    blockattachment: ["1.jpg", "video1.mp4", "AIGC_JiKun_Chan.usdz"],
  },
  {
    title: "title 1",
    is_instructor_only: true,
    description: "description",
    content_type_id: 1,
    instructor_id: 1,
    sequence_no: 2,
    blockattachment: [],
  },
];

export const questionSkills = [
  {
    skillId: 1,
    subskillId: 1,
    skillPoint:10
  },
  {
    skillId: 2,
    subskillId: 1,
    skillPoint:10
  },
];

export const CreateOption = [
  {
    answer: "string",
    is_correct: true,
    image_Name: "download.png",
  },
  {
    answer: "string2",
    is_correct: false,
    image_Name: "",
  },
];

export const UpdateOption = [
  {
    id: 1,
    answer: "string",
    is_correct: true,
    image_Name: "download.png",
  },
  {
    id: 1,
    answer: "string2",
    is_correct: false,
    image_Name: "",
  },
];

export const CreateNewOption = [
  {
    answer: "string",
    is_correct: true,
    attachment: {
      attachment_type_id: 1,
      Image_key: "",
      path: "",
      field_name: "",
    }
  },
  {
    answer: "string2",
    is_correct: false,
    attachment: {
      attachment_type_id: 1,
      Image_key: "",
      path: "",
      field_name: "",
    }
  },
];

export const Resource = [
  {
    filename: "1.jpg",
    is_viewable: true,
    is_downloadable: true,
  },
  {
    filename: "2.jpg",
    is_viewable: true,
    is_downloadable: true,
  },
];

export const ActivityStandard = [
  {
    title: "title 1",
    standard_type_id: 1,
    standard_level_id: 1,
    standard_subject_id: 1,
  },
  {
    title: "title 2",
    standard_type_id: 1,
    standard_level_id: 1,
    standard_subject_id: 1,
  },
];

export const contentQuestSegment = [
  {
    interactive_id: 66,
    instructor_id: 6,
  },
  {
    interactive_id: 63,
    instructor_id: 6,
  },
];

export const contentQuizSegment = [
  {
    interactive_id: 74,
    instructor_id: 6,
  },
  {
    interactive_id: 58,
    instructor_id: 6,
  },
];

export const contentAssignmentSegment = [
  {
    interactive_id: 78,
    instructor_id: 6,
  },
  {
    interactive_id: 77,
    instructor_id: 6,
  },
];

export const contentQuestionOptions = [
  {
    question_id: 1,
    question_option_id: 2,
  },
  {
    question_id: 2,
    question_option_id: 1,
  },
];

export const updateQuestionOptions = [
  {
    question_id: 1,
    question_option_id: 2,
  },
  {
    question_id: 2,
    question_option_id: 1,
  },
];

export const QuestAttachment =
{
  attachment_type_id: 1,
  Image_key: "",
  path: "",
  field_name: "",
};

export const contentBadgeColor = [
  {
    badge_id: 1,
    color_id: 2,
  },
  {
    badge_id: 2,
    color_id: 1,
  },
];

export const contentLevel = [
  {
    certification_id: 1,
    badges: [1, 2, 3],
  },
];

export const contentmodulesegmentactivities = [
  {
    module: "modules 1",
    instructor_id: 1,
    module_segment_type_id: 1,
    module_segment_delivery_id: 1,
    sequence_no: 1,
    activitiesList: [
      {
        content_activity_id: 11,
      },
    ],
  },
  {
    module: "modules 2",
    instructor_id: 1,
    module_segment_type_id: 1,
    module_segment_delivery_id: 1,
    sequence_no: 2,
    activitiesList: [
      {
        content_activity_id: 11,
      },
    ],
  },
];
