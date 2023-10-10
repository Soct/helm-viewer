import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client
} from "@aws-sdk/client-s3";
import { join } from 'path'

export async function readFileFromS3(
  path: string,
): Promise<string | undefined> {
  const command = new GetObjectCommand({
    Bucket: process.env.BACKEND_S3_BUCKETNAME,
    Key: join(process.env.NODE_ENV ?? "default", path),
  });
  
  const s3Client = getClient();
  let answer: GetObjectCommandOutput;
  try {
    answer = await s3Client.send(command)
  } catch (err) {
    console.log(err)
    throw err;
  }

  const content = await answer.Body.transformToString('utf-8');
  s3Client.destroy();

  return content
}

function getClient(): S3Client {
  let config = { region: process.env.BACKEND_S3_REGION };

  if (
    process.env.BACKEND_S3_ACCESS_KEY &&
    process.env.BACKEND_S3_SECRET_KEY
  ) {
    config = {
      endpoint: process.env.BACKEND_S3_ENDPOINT,
      region: process.env.BACKEND_S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.BACKEND_S3_ACCESS_KEY ?? "",
        secretAccessKey: process.env.BACKEND_S3_SECRET_KEY ?? "",
      }
    }
  }

  return new S3Client(config);
}
