import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  Query,
  Param,
  Get,
  Redirect,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import {
  AuthloginDto,
  AuthRegisterInstructorDto,
  AuthRegisterLearnerDto,
  AuthRegisterParentDto,
  ChangePasswordDto,
  ForgetEmailDto,
  ForgetPasswordDto,
  LogoutDto,
  ShareableLinkdto,
  VerifyEmailDto,
  VerifyPassworVerificationCode,
} from "./dto/create-auth.dto";
import { ForgetPasswordGuard, JwtGuard, RefreshTokenGuard } from "src/authStrategy/guard";
import {
  LoginResponse,
  PasswordChanged,
  RegisteredResponse,
  token,
} from "./entities/auth.entity";
import { InstructorImageValidation } from "src/AssetValidation/instructorImageValidation";
import { AuthGuard } from "@nestjs/passport";
import axios from "axios";

@Controller("")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/login")
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponse,
  })
  login(@Body() dto: AuthloginDto, @Res() response: Response,@Req() request:Request) {
    return this.authService.login(dto, response,request);
  }

  @Get("apple")
  @UseGuards(AuthGuard("apple"))
  async appleAuth() { }

  @Get("apple/callback")
  @UseGuards(AuthGuard("apple"))
  @Redirect("http://localhost:3000")
  async appleAuthRedirect() { }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() { }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const User = req.user;
    const origin = req.get('origin');
    if (User) {
      const token = await this.authService.googleLogin(User, res);
      if (token) {
        res.redirect(
          `${origin}/success?access_token=${token["access_token"]}&refresh_token=${token["refresh_token"]}`
        );
      } else {
        res.redirect(`${origin}?error=invalid_token`);
      }
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "Could not authenticate with Google!!!",
      });
    }
  }

  @Get("/:username")
  @ApiParam({ name: "username", description: "The UserName of the User" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponse,
  })
  findUserByUserName(
    @Param("username") username: string,
    @Res() response: Response
  ) {
    return this.authService.findUserByUserName(username, response);
  }

  @Post("/register/learner")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredResponse,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  registerlearner(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: AuthRegisterLearnerDto,
    @Res() response: Response,
    @Req() request:Request
  ) {
    return this.authService.registerlearner(files, dto, response,request);
  }

  @Post("/register/instructor")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredResponse,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  registerInstructor(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: AuthRegisterInstructorDto,
    @Res() response: Response,
    @Req() request:Request
  ) {
    return this.authService.registerInstructor(files, dto, response,request);
  }

  @Post("/register/parents")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredResponse,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  registerparents(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: AuthRegisterParentDto,
    @Res() response: Response,
    @Req() request:Request
  ) {
    return this.authService.registerparents(files, dto, response,request);
  }

  @UseGuards(RefreshTokenGuard)
  @ApiSecurity("Refresh-AUTH")
  @Post("refreshToken")
  @ApiOkResponse({
    status: 200,
    description: "OK",
    type: token,
  })
  refreshtoken(@Req() request: Request, @Res() response: Response) {
    return this.authService.getrefreshtoken(request, response);
  }

  @Post("verifyEmail")
  @ApiOkResponse({
    status: 200,
    description: "OK",
  })
  verifyEmail(@Body() dto: VerifyEmailDto, @Res() response: Response) {
    return this.authService.verifyuseremail(dto, response);
  }

  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @Post("changepassword")
  @ApiResponse({
    status: HttpStatus.OK,
    type: PasswordChanged,
  })
  @ApiOkResponse({
    status: 200,
    description: "OK",
  })
  changepassword(@Body() dto: ChangePasswordDto, @Res() response: Response) {
    return this.authService.changepassword(dto, response);
  }

  @Post("forgetpassword")
  forgetpassword(@Body() dto: ForgetEmailDto, @Res() response: Response,@Req() request:Request) {
    return this.authService.forgetpassword(dto, response,request);
  }

  @Post("forgetapppassword")
  forgetapppassword(@Body() dto: ForgetEmailDto, @Res() response: Response) {
    return this.authService.forgetapppassword(dto, response);
  }


  @Get("forgetpassword/verifycode")
  verifypasswordverificationcode(@Query() code: VerifyPassworVerificationCode, @Res() response: Response) {
    return this.authService.verifypasswordverificationcode(code, response);
  }


  @Post("saveforgetPassword")
  @ApiSecurity("ForgetPasswordAuth")
  @UseGuards(ForgetPasswordGuard)
  Saveforgetpassword(
    @Body() dto: ForgetPasswordDto,
    @Res() response: Response
  ) {
    return this.authService.Saveforgetpassword(dto, response);
  }

  //=====================shareable link===============================

  @Post("/share")
  createsharelink(@Body() dto: ShareableLinkdto, @Res() response: Response,@Req() request:Request) {
    return this.authService.createsharelink(dto, response,request);
  }

  //=====================Ed link===============================

  @Get("/edlink/login")
  loginEdlink(@Res() res: Response) {
    this.authService.redirecttoSSoLogin(res)
  }

  @Get("/redirect")
  async redirect(@Req() req: Request) {
    const { code, state } = req.query;
    const request = {
      code,
      client_id: process.env.EDLink_Client_Id,
      client_secret: process.env.EDLink_Client_Secret,
      redirect_uri: process.env.EDLink_Redirect_Uri,
      grant_type: "authorization_code",
    };

    const response = await axios.post(
      "https://ed.link/api/authentication/token",
      request
    );

    const access_token = response.data.$data.access_token;
    const profile = await axios.get("https://ed.link/api/v2/my/profile", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

  }



  @Get("user/logout")
  logoutUser(
    @Query() query: LogoutDto,
    @Res() response: Response
  ) {
    return this.authService.logOut(query, response);
  }


  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @Get("/instructor/switchprofile")
  SwitchToProfessionalDevelopmentProfile(
    @Req() req: Request,
    @Res() response: Response
  ) {
    return this.authService.SwitchToProfessionalDevelopmentProfile(req, response);
  }
}
