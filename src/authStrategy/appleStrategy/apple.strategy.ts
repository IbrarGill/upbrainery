import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-apple";

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, "apple") {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY,
      callbackURL: "YOUR_CALLBACK_URL",
      scope: ["name", "email"],
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
