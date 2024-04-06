import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import fs from "fs";
const AWS = require("aws-sdk");

@Injectable()
export class S3BucketService {
  public S3: S3;
  constructor() {
    this.init();
  }

  init() {
    AWS.config.update({
      accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
      region: process.env.S3_BUCKET_REGION,
    });
    this.S3 = new S3();
  }

  async getsignUrl(key: string) {
    if (key) {
      let url = this.S3.getSignedUrl("getObject", {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      });
      return url;
    }
    return ""
  }

  // listallbucket() {
  //   this.S3.listBuckets(function (err, data) {
  //     if (err) {
  //       console.log("Error", err);
  //     } else {
    
  //       data.Buckets.forEach((bucket) => {
  //         console.log(bucket.Name);
  //       });
  //     }
  //   });
  // }

  async upload(path: string, fileName: string, userId: number) {
    try {
      const stream = fs.createReadStream(path);
      stream.on("error", function (err) {
        console.log(err);
      });
      let objectkey = await this.S3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Body: stream,
        Key: `${userId}/${fileName}`,
        ContentDisposition: "inline",
      }).promise();

      return { key: objectkey.Key, url: objectkey.Location };
    } catch (error) {
      console.log("This is error", error);
    }
  }

}
