import { HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { OnnetFilters } from "./dto/create-onnet.dto";

@Injectable()
export class OnetService {
  constructor(private prisma: PrismaService) {}
  async getInterestProfiler(url: string): Promise<any> {
    const response = await axios.get(url, {
      auth: {
        username: process.env.ONET_USER_NAME,
        password: process.env.ONET_USER_PASSWORD,
      },
    });
    return response.data;
  }

  async updateAnswers(query: OnnetFilters, response: Response) {
    try {
      let answer = "";
      if (query.answer) {
        answer = query.answer;
      }
      let findAnswer = await this.prisma.onet_api.findFirst({
        where: {
          user_id: query.learner_id,
        },
      });
      if (findAnswer) {
        let updateAnswer = await this.prisma.onet_api.update({
          where: {
            id: findAnswer.id,
          },
          data: {
            onet_description: query.answer,
          },
        });
        return response.status(HttpStatus.OK).json({ data: updateAnswer });
      } else if (!findAnswer && answer != "") {
        let createAnswer = await this.prisma.onet_api.create({
          data: {
            user_id: query.learner_id,
            onet_description: query.answer,
          },
        });
        return response.status(HttpStatus.OK).json({ data: createAnswer });
      } else if (findAnswer === null && answer === "") {
        return response
          .status(HttpStatus.OK)
          .json({ message: "Please create answer first" });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async gethottechnologies() {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://services.onetcenter.org/ws/online/hot_technology/",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic YnJhaW5fdXBicmFpbmVyeTozMzk4Ynph",
        },
      };

      let data = await axios.request(config);
      return data.data;
    } catch (error) {
      console.log(error);
    }
  }

  async onnetError(response: Response) {}
}
