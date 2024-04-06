import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import {
  AuthloginDto,
  AuthRegisterLearnerDto,
  AuthRegisterInstructorDto,
  AuthRegisterParentDto,
  ChangePasswordDto,
  ForgetPasswordDto,
  YearOfExpericesDto,
  ForgetEmailDto,
  TutorExpierencedto,
  GoogleUser,
  TutorteachingStyleDto,
  TutorCredentailsDto,
  VerifyEmailDto,
  ShareableLinkdto,
  VerifyPassworVerificationCode,
  LogoutDto,
} from "./dto/create-auth.dto";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
import { compare } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { SendgridService } from "src/EmailService/emailservice";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CommonFunctionsService } from "src/services/commonService";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailservice: SendgridService,
    private serverFunctions: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  async login(dto: AuthloginDto, response: Response, request: Request) {
    try {
      const origin = request.get('origin');
      let isUserFound: any;
      if (dto.usernameOremail.toString().includes("@")) {
        if (!this.validateEmail(dto.usernameOremail)) {
          throw new HttpException("Email not valid!!", HttpStatus.BAD_REQUEST);
        } else {
          isUserFound = await this.prisma.users.findFirst({
            where: {
              email: dto.usernameOremail,
              is_block: false,
            },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              user_name: true,
              email: true,
              bio: true,
              per_hour_rate: true,
              password: true,
              theme: true,
              account_type_id: true,
              email_verified_at: true,
              is_block: true,
              organization_id: true,
              is_active: true,
              is_independent: true,
              is_term_condition: true,
              is_private_policies: true,
              is_blacklisted: true,
              account_types: {
                select: {
                  id: true,
                  name: true
                }
              },
              organizations: {
                select: {
                  id: true,
                  name: true,
                  site_url: true,
                  pid: true,
                  organization_type_id: true
                }
              }
            }
          });
        }
      } else {
        isUserFound = await this.prisma.users.findFirst({
          where: {
            user_name: dto.usernameOremail,
            is_block: false,
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            user_name: true,
            email: true,
            bio: true,
            per_hour_rate: true,
            password: true,
            theme: true,
            account_type_id: true,
            email_verified_at: true,
            is_block: true,
            organization_id: true,
            is_active: true,
            is_independent: true,
            is_term_condition: true,
            is_private_policies: true,
            is_blacklisted: true,
            account_types: {
              select: {
                id: true,
                name: true
              }
            },
            organizations: {
              select: {
                id: true,
                name: true,
                site_url: true,
                pid: true,
                organization_type_id: true
              }
            }
          }
        });
      }

      if (isUserFound) {
        let isValid = await this.verifyrPassword(
          isUserFound.password,
          dto.password
        );
        if (isValid) {

          if (origin !== isUserFound.organizations.site_url && !(origin === 'http://localhost:4200' || origin === 'http://localhost:3001' || origin === 'https://test-api.upbrainery.com' || origin === 'https://demo-api.upbrainery.com')) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
              message: 'UNAUTHORIZED REQUEST!!'
            })
          }

          let token = await this.signToken(isUserFound.id, dto.usernameOremail);
          delete isUserFound.password;
          delete isUserFound.refresh_token;

          if (isUserFound.email_verified_at != null) {
            let attachments = await this.serverFunctions.getAttachments(
              isUserFound.id,
              "User"
            );
            let organizationName = isUserFound.organizations.name;
            let org_user = await this.prisma.users.findFirst({
              where: {
                organization_id: isUserFound.organization_id,
                account_type_id: 4
              },
              select: {
                id: true,
                first_name: true,
                last_name: true,
                user_name: true
              }
            })
            if (isUserFound.organizations.pid != null) {
              let parentOrganization = await this.prisma.organizations.findUnique({
                where: {
                  id: isUserFound.organizations.pid
                },
              })
              organizationName = parentOrganization.name
            }

            isUserFound.organizations.organizationName = organizationName
            isUserFound.organizations.org_user = org_user;
            isUserFound.ImageUrl = attachments?.path;

            response.status(HttpStatus.OK).json({
              token,
              user: isUserFound,
            });
            let userAccountType = await this.prisma.users.findUnique({
              where: {
                id: isUserFound.id,
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
                  user_id: isUserFound.id,
                },
                select: {
                  manager_id: true,
                },
              });

              let userName = await this.prisma.users.findUnique({
                where: {
                  id: isUserFound.id,
                },
                select: {
                  user_name: true,
                },
              });

              for (let item of userManager) {
                let eventData = {
                  organization_id: isUserFound.organization_id,
                  receiver_user_id: item.manager_id,
                  sender_user_id: isUserFound.id,
                  notifiable_type: "User",
                  type: "Login",
                  data: `${userName.user_name} has logged in`,
                };
                this.eventEmitter.emit("event.savenewnofication", eventData);
              }
            }
          } else {

            const payload = {
              sub: isUserFound.id,
              email: isUserFound.email,
            };

            const access_token = await this.jwt.signAsync(payload, {
              expiresIn: "60m",
              secret: process.env.Email_SECRET,
            });

            let url = `${origin}/verifyEmail?email=${isUserFound.email}&token=${access_token}`;
            await this.emailservice.sendEAccountVerificationEmail(
              isUserFound.email,
              url
            );

            return response.status(HttpStatus.UNAUTHORIZED).json({
              code: 401,
              message: "User Account Not Verifield",
              note: "Email is being send to your provided email account for verification",
            });
          }
        } else {
          throw new HttpException("Password wrong!!", HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException("User Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async findUserByUserName(username: string, response: Response) {
    try {
      let isUserExist = await this.prisma.users.findUnique({
        where: {
          user_name: username.toString(),
        },
      });

      if (isUserExist) {
        throw new HttpException("Usename Not Available", HttpStatus.NOT_FOUND);
      } else {
        return response
          .status(HttpStatus.OK)
          .json({ Message: "Username Available" });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async registerlearner(
    files: Express.Multer.File,
    dto: AuthRegisterLearnerDto,
    response: Response,
    request: Request
  ) {
    try {
      const origin = request.get('origin');
      let images: any = files;

      let isUserExit

      if (dto?.email) {
        isUserExit = await this.prisma.users.findFirst({
          where: {
            email: dto.email,
          },
        });
      } else {
        isUserExit = await this.prisma.users.findUnique({
          where: {
            user_name: dto.userName,
          },
        });
      }

      let isOrganizationExit = await this.prisma.organizations.findFirst({
        where: {
          site_url: origin,
        },
      });


      if (isUserExit) {
        return response
          .status(HttpStatus.CONFLICT)
          .json("User already Registered!!");
      }

      let hash = await this.encryptPassword(dto.password);
      let account = await this.prisma.account_types.findFirst({
        where: { name: "Learner" },
      });
      let role = await this.prisma.roles.findFirst({
        where: { name: "Learner" },
      });

      let from_grade_id = Number.parseInt(dto.grades.split("-")[0]);
      let to_grade_id = Number.parseInt(dto.grades.split("-")[1]);
      let UserLearnerCreated = await this.prisma.users.create({
        data: {
          first_name: dto.firstName,
          last_name: dto.lastName,
          email: dto?.email ?? '',
          password: hash,
          user_name: dto.userName,
          account_type_id: account.id,
          bio: "",
          per_hour_rate: 0,
          organization_id: dto.organizationId ?? isOrganizationExit.id,
          is_independent: dto.organizationId ? false : true,
          is_private_policies: dto.is_private_policies ? true : false,
          is_term_condition: dto.is_term_condition ? true : false,
          created_at: new Date().toISOString(),
          email_verified_at: dto.organizationId ? new Date().toISOString() : null,
          role_id: role.id,
          learner_details: {
            create: {
              to_grade_id: to_grade_id,
              from_grade_id: from_grade_id,
              date_of_birth: dto.DOB,
            },
          },
        },
      });
      if (UserLearnerCreated) {
        if (dto.instrutorId) {
          await this.prisma.user_manager.create({
            data: {
              user_id: UserLearnerCreated.id,
              manager_id: dto.instrutorId,
            },
          });
        }

        delete UserLearnerCreated.password;
        response.status(HttpStatus.OK).json(UserLearnerCreated);

        if (dto?.email) {
          const payload = {
            sub: UserLearnerCreated.id,
            email: dto.email,
          };

          const access_token = await this.jwt.signAsync(payload, {
            expiresIn: "60m",
            secret: process.env.Email_SECRET,
          });

          let url = `${origin}/verifyEmail?email=${dto.email}&token=${access_token}`;
          await this.emailservice.sendEAccountVerificationEmail(dto.email, url);
        }


        let eventData = {};
        if (images.avator) {
          eventData = {
            modelId: UserLearnerCreated.id,
            path: images.avator[0].path,
            fileName: images.avator[0].filename,
            modelName: "User",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        } else {
          eventData = {
            modelId: UserLearnerCreated.id,
            path: process.env.Default_User_Image_key,
            fileName: "userAvator",
            modelName: "User",
          };

          this.eventEmitter.emit("event.Defaultattachment", eventData);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async registerInstructor(
    files: Express.Multer.File,
    dto: AuthRegisterInstructorDto,
    response: Response,
    request: Request
  ) {
    try {

      const origin = request.get('origin');
      let images: any = files;
      let isUserExit = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
        },
      });

      let isOrganizationExit = await this.prisma.organizations.findFirst({
        where: {
          site_url: origin,
        },
      });

      if (isUserExit) {
        return response
          .status(HttpStatus.CONFLICT)
          .json("User already Registered!!");
      }

      let hash = await this.encryptPassword(dto.password);

      let account = await this.prisma.account_types.findUnique({
        where: { name: "Instructor" },
      });
      let role = await this.prisma.roles.findFirst({
        where: { name: "Instructor" },
      });
      if (!account)
        throw new HttpException(
          "Something Went Wroung!!",
          HttpStatus.BAD_REQUEST
        );
      let isInstructorCreated = await this.prisma.users.create({
        data: {
          first_name: dto.firstName,
          last_name: dto.lastName,
          user_name: dto.userName,
          email: dto.email,
          password: hash,
          account_type_id: account.id,
          bio: "",
          per_hour_rate: 0,
          organization_id: dto.organizationId ?? isOrganizationExit.id,
          is_independent: dto.organizationId ? false : true,
          is_private_policies: dto.is_private_policies ? true : false,
          is_term_condition: dto.is_term_condition ? true : false,
          role_id: role.id,
          created_at: new Date().toISOString(),
        },
      });

      if (isInstructorCreated) {
        delete isInstructorCreated.password;

        let results = await Promise.all([
          this.saveTutorExperience(isInstructorCreated.id, dto.userexpirence),
          this.saveTutorTeachingStyle(
            isInstructorCreated.id,
            dto.teachingStyle
          ),
          this.saveTutoCredentials(isInstructorCreated.id, dto.credentails),
        ]);
        if (results) {
          response.status(HttpStatus.OK).json(isInstructorCreated);

          const payload = {
            sub: isInstructorCreated.id,
            email: dto.email,
          };

          const access_token = await this.jwt.signAsync(payload, {
            expiresIn: "60m",
            secret: process.env.Email_SECRET,
          });

          let url = `${origin}/verifyEmail?email=${dto.email}&token=${access_token}`;
          await this.emailservice.sendEAccountVerificationEmail(dto.email, url);
          await this.activatePdProfile(isInstructorCreated.id)
          let eventData = {};
          if (images.avator) {
            eventData = {
              modelId: isInstructorCreated.id,
              path: images.avator[0].path,
              fileName: images.avator[0].filename,
              modelName: "User",
            };
            this.eventEmitter.emit("event.attachment", eventData);
          } else {
            eventData = {
              modelId: isInstructorCreated.id,
              path: process.env.Default_User_Image_key,
              fileName: "User",
              modelName: "User",
            };
            this.eventEmitter.emit("event.Defaultattachment", eventData);
          }
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async saveTutorExperience(tutorId: any, experience: TutorExpierencedto[]) {
    try {
      experience.map(async (item: TutorExpierencedto, index) => {
        let from_grade_id = Number.parseInt(item.grades.split("-")[0]);
        let to_grade_id = Number.parseInt(item.grades.split("-")[1]);
        await this.prisma.tutor_experiances.create({
          data: {
            instructor_id: tutorId,
            to_grade_id: to_grade_id,
            from_grade_id: from_grade_id,
            subject_id: item.subjectId,
            experty_level_id: item.expeirenceLevelId,
            created_at: new Date().toISOString(),
          },
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  async saveTutorTeachingStyle(
    tutorId: number,
    techingStyles: TutorteachingStyleDto[]
  ) {
    try {
      techingStyles.map(async (item: TutorteachingStyleDto, index) => {
        await this.prisma.tutor_teaching_styles.create({
          data: {
            instructor_id: tutorId,
            teaching_style_id: item.teaching_style_id,
            created_at: new Date().toISOString(),
          },
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  async saveTutoCredentials(
    tutorId: number,
    credentials: TutorCredentailsDto[]
  ) {
    try {
      credentials.map(async (item: TutorCredentailsDto, index) => {
        await this.prisma.tutor_credentials.create({
          data: {
            instructor_id: tutorId,
            name: item.credentails,
            created_at: new Date().toISOString(),
          },
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  async registerparents(
    files: Express.Multer.File,
    dto: AuthRegisterParentDto,
    response: Response,
    request: Request
  ) {
    try {
      const origin = request.get('origin');
      let images: any = files;
      let isParentExits = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
        },
      });



      if (isParentExits) {
        return response
          .status(HttpStatus.CONFLICT)
          .json("User already Registered!!");
      }

      let isOrganizationExit = await this.prisma.organizations.findFirst({
        where: {
          site_url: origin,
        },
      });


      let account = await this.prisma.account_types.findFirst({
        where: { name: "Parent" },
      });
      let role = await this.prisma.roles.findFirst({
        where: { name: "Parent" },
      });
      let hash = await this.encryptPassword(dto.password);
      let UserParentCreated = await this.prisma.users.create({
        data: {
          first_name: dto.firstName,
          last_name: dto.lastName,
          email: dto.email,
          password: hash,
          user_name: dto.userName,
          account_type_id: account.id,
          organization_id: dto.organizationId ?? isOrganizationExit.id,
          is_independent: dto.organizationId ? false : true,
          is_private_policies: dto.is_private_policies ? true : false,
          is_term_condition: dto.is_term_condition ? true : false,
          bio: "",
          per_hour_rate: 0,
          role_id: role.id,
          created_at: new Date().toISOString(),
        },
      });
      if (UserParentCreated) {
        delete UserParentCreated.password;
        response.status(HttpStatus.OK).json(UserParentCreated);

        const payload = {
          sub: UserParentCreated.id,
          email: dto.email,
        };

        const access_token = await this.jwt.signAsync(payload, {
          expiresIn: "60m",
          secret: process.env.Email_SECRET,
        });

        let url = `${origin}/verifyEmail?email=${dto.email}&token=${access_token}`;
        await this.emailservice.sendEAccountVerificationEmail(dto.email, url);

        let eventData = {};
        if (images.avator) {
          eventData = {
            modelId: UserParentCreated.id,
            path: images.avator[0].path,
            fileName: images.avator[0].filename,
            modelName: "User",
          };

          this.eventEmitter.emit("event.attachment", eventData);
        } else {
          eventData = {
            modelId: UserParentCreated.id,
            path: process.env.Default_User_Image_key,
            fileName: "userAvator",
            modelName: "User",
          };

          this.eventEmitter.emit("event.Defaultattachment", eventData);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async changepassword(dto: ChangePasswordDto, response: Response) {
    try {
      let isUserExit = await this.prisma.users.findUnique({
        where: {
          id: dto.userId,
        },
      });
      if (isUserExit) {
        let verify_old_password = await this.verifyrPassword(
          isUserExit.password,
          dto.old_password
        );
        if (verify_old_password) {
          if (dto.new_password === dto.confirm_password) {
            let newHash = await this.encryptPassword(dto.new_password);

            let isPasswordUpdated = await this.prisma.users.update({
              where: {
                id: dto.userId,
              },
              data: {
                password: newHash,
                updated_at: new Date().toISOString(),
              },
            });

            if (isPasswordUpdated) {
              return response.status(HttpStatus.OK).json({
                message: "Password Updated Succussfully!!",
              });
            }
          } else {
            return response
              .status(HttpStatus.BAD_REQUEST)
              .json("new password did not matched!");
          }
        } else {
          return response
            .status(HttpStatus.BAD_REQUEST)
            .json("Wroung Password!!");
        }
      } else {
        return response.status(HttpStatus.NOT_FOUND).json("User Not Found!!");
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async forgetpassword(dto: ForgetEmailDto, response: Response, request: Request) {
    try {
      const origin = request.get('origin');

      let isUserExit = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (isUserExit) {
        const payload = {
          sub: isUserExit.id,
          email: isUserExit.email,
        };

        const access_token = await this.jwt.signAsync(payload, {
          expiresIn: "60m",
          secret: process.env.FORGET_PASSWORD_SECRET,
        });

        let url = `${origin}/passwordForget?email=${dto.email}&token=${access_token}`;
        this.emailservice.sendPasswordRecoveryCode(dto.email, url);
        return response
          .status(HttpStatus.OK)
          .json("Password Reset Email Send to your Email!!");
      } else {
        return response.status(HttpStatus.NOT_FOUND).json("User Not Found!!");
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async forgetapppassword(dto: ForgetEmailDto, response: Response) {
    try {
      let isUserExit = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (isUserExit) {
        const randomCode = this.generateRandomCode();
        let saveCodeindb = await this.prisma.users.update({
          where: {
            id: isUserExit.id
          },
          data: {
            password_reset_code: randomCode
          }
        })


        if (saveCodeindb) {
          this.emailservice.sendPasswordRecoveryCodeForUpbraineryApp(dto.email, randomCode);
          return response
            .status(HttpStatus.OK)
            .json("Password Reset Email Send to your Email!!");
        }

      } else {
        return response.status(HttpStatus.NOT_FOUND).json("User Not Found!!");
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async verifypasswordverificationcode(dto: VerifyPassworVerificationCode, response: Response) {
    try {
      let isUserExit = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (isUserExit) {
        let isCodeValid = await this.prisma.users.findFirst({
          where: {
            email: dto.email,
            password_reset_code: dto.code
          },
        })

        if (isCodeValid) {
          let token = await this.signToken(isUserExit.id, isUserExit.email);
          return response
            .status(HttpStatus.OK)
            .json({ token: token.access_token });
        } else {
          return response.status(HttpStatus.BAD_REQUEST).json("Wrong verification code");
        }

      } else {
        return response.status(HttpStatus.NOT_FOUND).json("User Not Found!!");
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }



  generateRandomCode() {
    const min = 10000; // Minimum 5-digit number (inclusive)
    const max = 99999; // Maximum 5-digit number (inclusive)

    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomCode;
  }

  async Saveforgetpassword(dto: ForgetPasswordDto, response: Response) {
    try {
      let isUserExit = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (isUserExit) {
        if (dto.new_password === dto.confirm_password) {
          let newHash = await this.encryptPassword(dto.new_password);

          let isPasswordUpdated = await this.prisma.users.update({
            where: {
              id: isUserExit.id,
            },
            data: {
              password: newHash,
              updated_at: new Date().toISOString(),
            },
          });

          if (isPasswordUpdated) {
            return response.status(HttpStatus.OK).json({
              message: "Password Updated Succfully!!",
            });
          }
        } else {
          return response
            .status(HttpStatus.BAD_REQUEST)
            .json("new password did not matched!");
        }
      } else {
        return response.status(HttpStatus.NOT_FOUND).json("User Not Found!!");
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async verifyuseremail(dto: VerifyEmailDto, response: Response) {
    try {
      const Email_SECRET = this.config.get("Email_SECRET");
      let isvalid = null;
      try {
        isvalid = jwt.verify(dto.acces_token, Email_SECRET);
      } catch (err) {
        throw new HttpException("Invalid Access_Token", HttpStatus.FORBIDDEN);
      }

      if (isvalid) {
        let payload = this.parseJwt(dto.acces_token);

        let userValidUserExit = await this.prisma.users.findFirst({
          where: {
            id: payload.sub,
            email: dto.email
          }
        })

        if (!userValidUserExit) {
          throw new HttpException("Invalid Access_Token", HttpStatus.FORBIDDEN);
        }


        const user = await this.prisma.users.update({
          where: {
            id: payload.sub,
          },
          data: {
            email_verified_at: new Date().toISOString(),
          },
        });
        if (user) {
          response.status(HttpStatus.OK).json({
            code: HttpStatus.OK,
            message: "Email verifield Succussfully!!",
          });
        }
      } else {
        throw new HttpException("Invalid Access_Token", HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //====================================================================
  async encryptPassword(password: string) {
    const hash = bcrypt.hashSync(password, 5);
    return hash;
  }

  //====================================================================
  async signToken(
    userId: number,
    email: string
  ): Promise<{ access_token: string; refresh_token: string }> {

    let session = await this.prisma.user_sessions.create({
      data: {
        user_id: userId,
      }
    })
    const payload = {
      sub: userId,
      email: email,
      sessionId: session.id
    };
    const secret = this.config.get("JWT_SECRET");
    const refreshsecret = this.config.get("REFRESH_SECRET");
    const accesstoken = await this.jwt.signAsync(payload, {
      expiresIn: "3h",
      secret: secret,
    });
    const refreshtoken = await this.jwt.signAsync(payload, {
      expiresIn: "1d",
      secret: refreshsecret,
    });

    const acces_hash = bcrypt.hashSync(accesstoken, 10);
    const refresh_hash = bcrypt.hashSync(refreshtoken, 10);

    await this.updateTokensInUserSessionDb(session.id, accesstoken, refreshtoken, acces_hash, refresh_hash);

    return {
      access_token: acces_hash,
      refresh_token: refresh_hash,
    };
  }

  //====================================================================
  // async encryptrefreshtoken(refreshtoken: string) {
  //   const hash = bcrypt.hashSync(refreshtoken, 5);
  //   return hash;
  // }
  //====================================================================
  // async verifyrefreshhash(dbToken: string, userToken: string) {
  //   const isvalid = bcrypt.compareSync(userToken, dbToken);
  //   return isvalid;
  // }
  //====================================================================
  async getrefreshtoken(request: Request, response: Response) {
    try {
      let BearerToken = request.headers["authorization"];
      let refreshToken = BearerToken.split(" ")[1];

      const refreshsecret = this.config.get("REFRESH_SECRET");

      const isvalid = jwt.verify(refreshToken, refreshsecret);

      if (isvalid) {
        var payload = this.parseJwt(refreshToken);
        const user = await this.prisma.users.findUnique({
          where: {
            id: payload.sub,
          },
        });


        let tokens = await this.signToken(
          user.id,
          user.email,
        )

        await this.prisma.user_sessions.update({
          where: {
            id: payload.sessionId
          },
          data: {
            access_hash: tokens.access_token,
            refresh_hash: tokens.refresh_token
          }
        })


        return response.status(HttpStatus.OK).json(
          tokens
        );

      } else {
        throw new HttpException("invalid refreshtoken", HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  //====================================================================
  parseJwt(token: string) {
    var base64Payload = token.split(".")[1];
    var payload = Buffer.from(base64Payload, "base64");
    return JSON.parse(payload.toString());
  }
  //====================================================================
  async updateTokensInUserSessionDb(sessionId: number, access_token: string, refreshtoken: string, access_hash: string, refresh_hash: string) {
    try {
      await this.prisma.user_sessions.update({
        where: {
          id: sessionId,
        },
        data: {
          access_token: access_token,
          refresh_token: refreshtoken,
          access_hash: access_hash,
          refresh_hash: refresh_hash
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  //====================================================================
  async verifyrPassword(dbPassword: string, password: string) {
    const isvalid = bcrypt.compareSync(password, dbPassword);
    return isvalid;
  }

  async logOut(query: LogoutDto, response: Response) {
    try {
      const JWT_SECRET = this.config.get("JWT_SECRET");
      let isvalid = null;
      let findUserToken = await this.prisma.user_sessions.findFirst({
        where: {
          access_hash: query.access_token
        },
        select: {
          access_token: true,
        }
      })
      try {
        isvalid = jwt.verify(findUserToken.access_token, JWT_SECRET);
      } catch (err) {
        throw new HttpException("Invalid Access_Token", HttpStatus.FORBIDDEN);
      }
      if (isvalid) {
        let payload = this.parseJwt(findUserToken.access_token);
        const user = await this.prisma.user_sessions.update({
          where: {
            id: payload.sessionId,
          },
          data: {
            access_token: null,
            refresh_token: null,
            is_session_blacklist: true,
          },
        });

        await this.prisma.user_sockets.deleteMany({
          where: {
            id: query.userId,
          },
        });

        if (user) {
          response.status(HttpStatus.OK).json({
            succes: true,
            status: HttpStatus.OK,
          })
        } else {
          throw new HttpException(
            "something went wrong!!",
            HttpStatus.BAD_REQUEST
          );
        }
      } else {
        throw new HttpException("invalid token", HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //google auth

  async validateOAuthLogin(
    user: GoogleUser,
    provider: string
  ): Promise<object> {
    const { userName, firstName, lastName, email, photo } = user;

    let isUserExit = await this.prisma.users.findFirst({
      where: {
        email: user.email,
      },
    });

    if (isUserExit) {
      return isUserExit;
    } else {
      let password = this.generateRandomPassword(userName);
      let hash = await this.encryptPassword(password);
      let UserParentCreated = await this.prisma.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: hash,
          user_name:
            userName + Date.now() + "-" + Math.round(Math.random() * 1e9),
          account_type_id: 1,
          bio: "",
          per_hour_rate: 0,
          created_at: new Date().toISOString(),
        },
      });
      if (hash) {
        this.emailservice.sendPasswordRecoveryCode(email, password);
      }

      if (UserParentCreated) {
        if (photo) {
          await this.serverFunctions.saveAttachments(
            UserParentCreated.id,
            photo,
            "",
            "User",
            "Image",
            "UserAvator"
          );
        }
      } else {
        await this.serverFunctions.saveAttachments(
          UserParentCreated.id,
          process.env.Default_User_Image_key,
          "",
          "User",
          "Image",
          "UserAvator"
        );
      }
      return UserParentCreated;
    }
  }

  async googleLogin(user: any, response: Response) {
    try {
      let isUserFound: any;
      if (user.email.toString().includes("@")) {
        if (!this.validateEmail(user.email)) {
          throw new HttpException("Email not valid!!", HttpStatus.BAD_REQUEST);
        } else {
          isUserFound = await this.prisma.users.findFirst({
            where: {
              email: user.email,
              is_block: false,
            },
          });
        }
      } else {
        isUserFound = await this.prisma.users.findFirst({
          where: {
            user_name: user.userName,
            is_block: false,
          },
        });
      }

      if (isUserFound) {
        let isValid = compare(isUserFound.password, user.password);
        if (isValid) {
          let token = await this.signToken(isUserFound.id, user.email);
          delete isUserFound.password;
          return {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
          };
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  generateRandomPassword(username: string): string {
    const randomChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    return password + username.length.toString();
  }

  //=======================================shareable link ================================================

  async createsharelink(dto: ShareableLinkdto, response: Response, request: Request) {
    try {
      const origin = request.get('origin');
      const payload = {
        sessionId: dto.sessionId,
        learners: dto.learners,
        emails: dto.leanerEmails,
      };
      const SHAREABLE_LINK_SECRET = this.config.get("SHAREABLE_LINK_SECRET");
      const shareableLink = await this.jwt.signAsync(payload, {
        expiresIn: dto.time,
        secret: SHAREABLE_LINK_SECRET,
      });
      let link = `${origin}/learner/session-detail/${dto.sessionId}?token=${shareableLink}&method=sharing`;
      response.status(HttpStatus.OK).json({
        link,
      });
      if (dto.isDone) {
        let instrutor = await this.prisma.users.findUnique({
          where: { id: dto.instructorId },
        });
        let profileurl = await this.serverFunctions.getAttachments(
          instrutor.id,
          "User"
        );
        await this.emailservice.sharesessionlinkwithmail(
          dto.leanerEmails,
          profileurl?.path,
          instrutor.user_name,
          link
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //======================================Edlink SSO==========================================================

  redirecttoSSoLogin(res: Response) {
    const EDLink_Client_Id = this.config.get("EDLink_Client_Id");
    const EDLink_Redirect_Uri = this.config.get("EDLink_Redirect_Uri");

    const state = crypto.randomBytes(10).toString("hex");
    const sso_url_string = `https://ed.link/sso/login?client_id=${EDLink_Client_Id}&redirect_uri=${encodeURIComponent(
      EDLink_Redirect_Uri
    )}&state=${state}&response_type=code`;
    res.redirect(sso_url_string);
  }

  //==========SwitchToProfessionalDevelopmentProfile==========================================
  async SwitchToProfessionalDevelopmentProfile(req: Request, response: Response) {
    try {
      let user: any = req.user;

      if (user.account_type_id === 1) {
        let isInstructorExist: any = await this.prisma.users.findFirst({
          where: {
            id: user.id,
            account_types: {
              name: 'Instructor'
            }
          },
          select: {
            id: true,
            instructor_pd_id: true,
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                user_name: true,
                email: true,
                bio: true,
                per_hour_rate: true,
                password: true,
                theme: true,
                account_type_id: true,
                email_verified_at: true,
                is_block: true,
                organization_id: true,
                is_active: true,
                is_independent: true,
                is_term_condition: true,
                is_private_policies: true,
                is_blacklisted: true,
                account_types: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                organizations: {
                  select: {
                    id: true,
                    name: true,
                    organization_type_id: true
                  }
                }
              }
            }
          }
        })
        if (!isInstructorExist) {
          throw new HttpException('Instructor Not Found!!', HttpStatus.BAD_REQUEST)
        }

        if (isInstructorExist.instructor_pd_id == null) {
          let activitedUser: any = await this.activatePdProfile(isInstructorExist.id)
          let token = await this.signToken(activitedUser.id, activitedUser.email);
          delete activitedUser.password;
          activitedUser.users.InstructorPD = true;
          response.status(HttpStatus.OK).json({
            token,
            user: activitedUser,
          })
        } else {
          let token = await this.signToken(isInstructorExist.users.id, isInstructorExist.users.email);
          delete isInstructorExist.users.password;
          isInstructorExist.users.InstructorPD = true;
          response.status(HttpStatus.OK).json({
            token,
            user: isInstructorExist.users,
          })
        }
      } else {
        let isLearnerExist: any = await this.prisma.users.findFirst({
          where: {
            instructor_pd_id: user.id,
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            user_name: true,
            email: true,
            bio: true,
            per_hour_rate: true,
            password: true,
            theme: true,
            account_type_id: true,
            email_verified_at: true,
            is_block: true,
            organization_id: true,
            is_active: true,
            is_independent: true,
            is_term_condition: true,
            is_private_policies: true,
            is_blacklisted: true,
            account_types: {
              select: {
                id: true,
                name: true
              }
            },
            organizations: {
              select: {
                id: true,
                name: true,
                organization_type_id: true
              }
            }
          }
        })
        if (!isLearnerExist) {
          throw new HttpException('Learner Not Found!!', HttpStatus.BAD_REQUEST)
        }

        let token = await this.signToken(isLearnerExist.id, isLearnerExist.email);
        delete isLearnerExist.password;
        isLearnerExist.InstructorPD = true;
        response.status(HttpStatus.OK).json({
          token,
          user: isLearnerExist,
        })
      }



    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async activatePdProfile(instructorId: number) {
    try {

      let isInstructorExist = await this.prisma.users.findFirst({
        where: {
          id: instructorId,
          account_types: {
            name: 'Instructor'
          }
        }
      })
      if (!isInstructorExist!) {
        throw new HttpException('Instructor Not Found!!', HttpStatus.BAD_REQUEST)
      }

      let account = await this.prisma.account_types.findUnique({
        where: {
          name: 'Learner'
        }
      })

      let role = await this.prisma.roles.findFirst({
        where: {
          name: 'Learner'
        }
      })

      let isPDAccountCreated = await this.prisma.users.create({
        data: {
          first_name: isInstructorExist.first_name,
          last_name: isInstructorExist.last_name,
          email: isInstructorExist?.email ?? '',
          password: isInstructorExist.password,
          user_name: isInstructorExist.user_name + '_learner',
          account_type_id: account.id,
          bio: "",
          per_hour_rate: 0,
          organization_id: isInstructorExist.organization_id,
          is_independent: isInstructorExist.is_independent,
          is_private_policies: isInstructorExist.is_private_policies,
          is_term_condition: isInstructorExist.is_term_condition,
          created_at: new Date().toISOString(),
          email_verified_at: isInstructorExist.email_verified_at,
          role_id: role.id,
          learner_details: {
            create: {
              to_grade_id: 1,
              from_grade_id: 12,
            },
          },
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          email: true,
          bio: true,
          per_hour_rate: true,
          password: true,
          theme: true,
          account_type_id: true,
          email_verified_at: true,
          is_block: true,
          organization_id: true,
          is_active: true,
          is_independent: true,
          is_term_condition: true,
          is_private_policies: true,
          is_blacklisted: true,
          account_types: {
            select: {
              id: true,
              name: true
            }
          },
          organizations: {
            select: {
              id: true,
              name: true,
              organization_type_id: true
            }
          }
        }
      })

      if (isPDAccountCreated) {
        await this.prisma.users.update({
          where: {
            id: instructorId
          },
          data: {
            instructor_pd_id: isPDAccountCreated.id
          }
        })

        console.log('Instructor Professional Development Account Activited!!')
        return isPDAccountCreated
      }

    } catch (error) {
      console.log(error)
    }
  }
}
