import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.client";

@Injectable()
export class ForgetPasswordStrategy extends PassportStrategy(
    Strategy,
    "ForgetPasswordAuth"
) {
    constructor(config: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get("FORGET_PASSWORD_SECRET"),
        });
    }

    async validate(payload: { sub: number; email: string }) {

        const user = await this.prisma.users.findUnique({
            where: {
                id: payload.sub,
            },
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
