// xss-protection.middleware.ts
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
const prisma = new PrismaClient();
@Injectable()
export class DecryptAuthToken implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {

        let encryptAuthToken = req.headers["authorization"]?.split(" ")[1];
        const origin = req.get('origin');
        let site_url = null;



        if (encryptAuthToken?.length === 60) {
            let findUserTokenWithAccessHash = await prisma.user_sessions.findFirst({
                where: {
                    access_hash: encryptAuthToken
                },
                select: {
                    access_token: true,

                    users: {
                        select: {
                            id: true,
                            roles: {
                                select: {
                                    name: true
                                }
                            },
                            organizations: {
                                select: {
                                    id: true,
                                    site_url: true,
                                }
                            }
                        }
                    }
                }
            })
            if (findUserTokenWithAccessHash) {
                req.headers["authorization"] = `Bearer ${findUserTokenWithAccessHash?.access_token}`;
                req.user = findUserTokenWithAccessHash?.users;
                site_url = findUserTokenWithAccessHash?.users.organizations.site_url;
            } else {
                let findUserTokenWithRefreshHash = await prisma.user_sessions.findFirst({
                    where: {
                        refresh_hash: encryptAuthToken
                    },
                    select: {
                        refresh_token: true,
                        users: {
                            select: {
                                id: true,
                                roles: {
                                    select: {
                                        name: true
                                    }
                                },
                                organizations: {
                                    select: {
                                        id: true,
                                        site_url: true,
                                    }
                                }
                            }
                        }
                    }
                })
                req.headers["authorization"] = `Bearer ${findUserTokenWithRefreshHash?.refresh_token}`;
                req.user = findUserTokenWithRefreshHash?.users;
                site_url = findUserTokenWithRefreshHash?.users.organizations.site_url;
            }

        } else if (encryptAuthToken?.length > 60) {
                let payload = this.parseJwt(encryptAuthToken);
                const user = await prisma.users.findUnique({
                    where: {
                        id: payload.sub,
                    },
                    select: {
                        organizations: {
                            select: {
                                site_url: true
                            }
                        }
                    }
                });
                site_url = user?.organizations?.site_url;
        }

        if (origin === site_url ||
            origin === 'http://localhost:4200' ||
            origin === 'http://localhost:3001' ||
            origin === 'https://test-api.upbrainery.com' ||
            origin === 'https://demo-api.upbrainery.com' ||
            origin === 'https://test-cms.upbrainery.com' ||
            origin === 'https://demo.upbrainery.com' ||
            origin === 'http://up-brainery.test' ||
            origin === 'http://localhost:8000' ||
            origin === 'http://upbrainery-cms.test'
        ) {
            next();
        } else if (encryptAuthToken === 'null') {
            next();
        } else {
            res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'UNAUTHORIZED REQUEST!!'
            })
        }


    }

    parseJwt(token: string) {
        var base64Payload = token.split(".")[1];
        var payload = Buffer.from(base64Payload, "base64");
        return JSON.parse(payload.toString());
    }
}
