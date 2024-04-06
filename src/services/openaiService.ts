import { Injectable } from "@nestjs/common";
import { response } from "express";
// import OpenAI from "openai-api";
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { PrismaException } from "src/prisma/prismaException/prismaException";

const defaultModelId = "text-davinci-003";
const newModelId = "gpt-3.5-turbo";
const defaulttemperature = 0.9;

@Injectable()
export class ChatGptService {
  openAi: OpenAIApi;
  
  constructor() {
    const configuration = new Configuration({
      organization: process.env.ORGANIZATION_ID,
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openAi = new OpenAIApi(configuration);
  }
  async getModelAnswer(question: string, temperature?: number) {
    // const params: CreateCompletionRequest = {
    //   model: defaultModelId,
    //   prompt: [{ role: "user", content: question }],
    //   temperature: temperature != undefined ? temperature : defaulttemperature,
    // };
    try {
      const response = await this.openAi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "assistant", content: question }],
      });
      return response.data.choices[0].message;
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

}
