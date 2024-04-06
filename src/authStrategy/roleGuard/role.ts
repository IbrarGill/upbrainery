import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export enum role {
    ADMIN = 'admin',
    ORGANIZATION = 'Organization',
    LEARNER = 'Learner',
    INSTRUCTOR = 'Instructor',
    PARENT = 'Parent',
    INSTITUE = 'Institute'
}
export const Roles = (...roles: role[]) => SetMetadata(ROLES_KEY, roles);
