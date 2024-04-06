import os from "os";
import fs from 'fs';
import helmet from "helmet";
import cluster from "cluster";
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require('compression');
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.client";
import { ExpressAdapter } from "@nestjs/platform-express";

require("aws-sdk/lib/maintenance_mode_message").suppress = true;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter()
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix("v1");

  const config = new DocumentBuilder()
    .setTitle("Brain Lab")
    .setDescription("Learning Management system for Users")
    .setVersion("1.0")
    .addTag("upbrainery")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter your JWT token",
        in: "header",
      },
      "JWT-AUTH"
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Refresh",
        name: "Refresh",
        description: "Enter your Refresh token",
        in: "header",
      },
      "Refresh-AUTH"
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "ForgetPassword",
        name: "ForgetPassword",
        description: "Enter your ForgetPassword token",
        in: "header",
      },
      "ForgetPasswordAuth"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Save the JSON to a file
  // fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup("Upbrainery", app, document);
  app.use(express.json());
  app.use(compression());
  app.enableCors({
    origin: [
      process.env.ALLOW_ORIGIN_URL1,
      process.env.ALLOW_ORIGIN_URL2,
      process.env.ALLOW_ORIGIN_URL3,
      process.env.ALLOW_ORIGIN_URL4,
      process.env.ALLOW_ORIGIN_URL5,
      process.env.ALLOW_ORIGIN_URL6,
      process.env.ALLOW_ORIGIN_URL7
    ],
    // You can also include other CORS options here
  });
  app.use(bodyParser.json({ limit: "1000gb", extended: true }));
  app.use(bodyParser.urlencoded({ limit: "1000gb", extended: true }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Cross-origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-origin-Opener-Policy', 'same-origin');
    next()
  });
  // Use Helmet
  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use("public", express.static(path.join(__dirname, "../public")));
  app.use(express.static(path.join(__dirname, "../views")));
  app.setViewEngine("hbs");
  //
  app.use(cookieParser());
  //
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.listen(process.env.Server_Port, () => {
    console.log(
      `listening on http://localhost:${process.env.Server_Port} ${process.pid}`
    );
  });

  // if (cluster.isPrimary) {
  //   const numCPUs = os.cpus().length;

  //   for (let i = 0; i < numCPUs - numCPUs / 2; i++) {
  //     cluster.fork();
  //   }

  //   cluster.on("exit", (worker, code, signal) => {
  //     console.log(`Worker ${worker.process.pid} died`);
  //     cluster.fork();
  //   });
  // } else {
  //   await app.listen(process.env.Server_Port, () => {
  //     console.log(
  //       `listening on http://localhost:${process.env.Server_Port} ${process.pid}`
  //     );
  //   });
  // }
}
bootstrap();