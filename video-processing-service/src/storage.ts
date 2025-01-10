import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideosBucketName = "hrs-yt-raw-videos";
const processedVideosBucketName = "hrs-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectories() {
  ensureDirectoryExists(localRawVideoPath);
  ensureDirectoryExists(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted
 */

export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale = -1:360")
      .on("end", () => {
        console.log("Processing finished successfully");
        resolve();
      })
      .on("error", (err) => {
        console.error(`An error occurred: ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param filename - The name of the file to download from the {@link rawVideosBucketName} bucket into the {@link localRawVideoPath} folder
 * @return A promise that resolves when the file has been downloaded
 */

export async function downloadRawVideo(filename: string) {
  await storage
    .bucket(rawVideosBucketName)
    .file(filename)
    .download({ destination: `${localRawVideoPath}/${filename}` });

  console.log(
    `gs://${rawVideosBucketName}/${filename} downloaded to ${localRawVideoPath}/${filename}`
  );
}

/**
 * @param filename - The name of the file to upload from the {@link localProcessedVideoPath} folder into the {@link processedVideosBucketName} bucket
 * @return A promise that resolves when the file has been uploaded
 */

export async function uploadProcessedVideo(filename: string) {
  const bucket = storage.bucket(processedVideosBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${filename}`, {
    destination: filename,
  });

  console.log(
    `${localProcessedVideoPath}/${filename} uploaded to gs://${processedVideosBucketName}/${filename}`
  );

  await bucket.file(filename).makePublic();
}

/**
 * @param filename - The name of the file to delete from the {@link localRawVideoPath} folder
 * @return A promise that resolves when the file has been deleted
 */
export function deleteRawVideo(filename: string) {
  return deleteFile(`${localRawVideoPath}/${filename}`);
}

/**
 * @param filename - The name of the file to delete from the {@link localProcessedVideoPath} folder
 * @return A promise that resolves when the file has been deleted
 */
export function deleteProcessedVideo(filename: string) {
  return deleteFile(`${localProcessedVideoPath}/${filename}`);
}

/**
 * @param filePath - The path of the file to delete
 * @return A promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filePath}`);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete`);
      resolve();
    }
  });
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created at ${dirPath}`);
  }
}
