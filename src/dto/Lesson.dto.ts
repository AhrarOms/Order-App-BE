export enum SubjectEnum {
  PHYSICS = "physics",
  CHEMISTRY = "chemistry",
}
export class CreateLessonInput {
  name: string;
  description: string;
  subject: SubjectEnum;
  thumbnail: string;
}
