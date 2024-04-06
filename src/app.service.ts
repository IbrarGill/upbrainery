import { Injectable } from "@nestjs/common";
import { Response } from "express";
import fs from "fs";
@Injectable()
export class AppService {
  getHello(): string {
    return "Upbrainery Server is returning Pong!!!";
  }

  async getServerLog(response: Response) {
    try {
      let serverLog = await fs.readFileSync("./src/utils/server.log", {
        encoding: "utf8",
        flag: "r",
      });
      serverLog = serverLog.replace(/\s/gm, "");
      serverLog = serverLog.replace(" ", "");
      // serverLog = serverLog.replace(/\//g, '');
      // console.log(serverLog.length);
      let result = [],
        org = [];
      let string = "";

      for (let i = 0; i < serverLog.length; i++) {
        if (serverLog[i] == "}") {
          string += serverLog[i].toString();
          result.push(string);
          string = "";
        } else if (serverLog[i] !== '"') {
          // console.log(serverLog[i]);
          string = string + serverLog[i].toString();
        }
      }
      for (let i = 0; i < result.length; i++) {
        org.push(result[i]);
        // console.log(result[i]);
      }
      response.json(org);
    } catch (error) {
      console.log(error);
    }
  }
}
