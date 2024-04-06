import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3001/v1/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails, photos } = profile;
    const user = {
      userName: name.givenName + name.familyName,
      firstName: name.givenName,
      lastName: name.familyName,
      email: emails[0].value,
      photo: photos[0].value,
      accessToken,
      refreshToken,
    };
    return this.authService.validateOAuthLogin(user, "google");
  }
}
