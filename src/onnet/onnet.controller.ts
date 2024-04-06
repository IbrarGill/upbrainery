import {
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "src/prisma/prisma.client";
import { OnnetFilters, OnnetQuery } from "./dto/create-onnet.dto";
import { OnetService } from "./onnet.service";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("interest-profiler")
@ApiTags("onnet")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class OnnetController {
  constructor(
    private readonly onetService: OnetService,
    private readonly prismaService: PrismaService
  ) { }

  @Get("questions")
  async getInterestProfilerResults(): Promise<any> {
    let url =
      "https://services.onetcenter.org/ws/mnm/interestprofiler/questions?start=1&end=60";
    return this.onetService.getInterestProfiler(url);
  }

  @Get("results")
  async getInterestProfiler(
    @Res() response: Response,
    @Query() query: OnnetFilters
  ): Promise<any> {
    let userAnswer = "";
    let findLearnerAnswer = await this.prismaService.onet_api.findFirst({
      where: {
        user_id: query.learner_id,
      },
    });
    if (findLearnerAnswer) {
      userAnswer = findLearnerAnswer.onet_description;
    }

    if (findLearnerAnswer === null && query.answer != undefined) {
      let saveLearnerAnswer = await this.prismaService.onet_api.create({
        data: {
          onet_description: query.answer,
          user_id: query.learner_id,
        },
      });
      userAnswer = saveLearnerAnswer.onet_description;
    } else if (
      !findLearnerAnswer ||
      (query.answer != undefined && userAnswer === "")
    ) {
      return response
        .status(HttpStatus.OK)
        .json({ message: "You didn't submitted the answers yet" });
    }

    let url = `https://services.onetcenter.org/ws/mnm/interestprofiler/results?answers=${userAnswer}`;
    let results = await this.onetService.getInterestProfiler(url);
    return response.status(HttpStatus.OK).json({ data: results });
  }

  @Patch("update/answer")
  update(@Query() query: OnnetFilters, @Res() response: Response) {
    return this.onetService.updateAnswers(query, response);
  }

  @Get("job-zone")
  async getInterestProfilerJobZones(): Promise<any> {
    let url =
      "https://services.onetcenter.org/ws/mnm/interestprofiler/job_zones";
    return this.onetService.getInterestProfiler(url);
  }
  @Get("careers")
  async getInterestProfilerCareers(@Query() query: OnnetQuery): Promise<any> {
    let findLearnerAnswer = await this.prismaService.onet_api.findFirst({
      where: {
        user_id: query.learner_id,
      },
    });
    let url = `https://services.onetcenter.org/ws/mnm/interestprofiler/careers/1?answers=${findLearnerAnswer.onet_description}&sort=name&start=1&end=500`;
    return this.onetService.getInterestProfiler(url);
  }

  @Get("job-zone/careers")
  async getInterestProfilerCareersByJobZone(@Query() query: OnnetQuery): Promise<any> {
    let findLearnerAnswer = await this.prismaService.onet_api.findFirst({
      where: {
        user_id: query.learner_id,
      },
    });
    let url = `https://services.onetcenter.org/ws/mnm/interestprofiler/careers?answers=${findLearnerAnswer.onet_description}&job_zone=${query.job_zone}`;
    return this.onetService.getInterestProfiler(url);
  }

  @Get("hot_technology")
  async getallhot_technology(): Promise<any> {
    return await this.onetService.gethottechnologies();
  }
}
