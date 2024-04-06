import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard("jwt") {
  constructor() {
    super();
  }
}

export class RefreshTokenGuard extends AuthGuard("RefreshTokenGuard") {
  constructor() {
    super();
  }
}


export class ForgetPasswordGuard extends AuthGuard("ForgetPasswordAuth") {
  constructor() {
    super();
  }
}