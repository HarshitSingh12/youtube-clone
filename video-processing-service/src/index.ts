import express from "express";
import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.post("/process-video", async (req, res) => {
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Bad Request: Missing filename");
  }

  const inputFilename = data.name;
  const outputFilename = `processed-${inputFilename}`;
  const videoId = inputFilename.split(".")[0];

  if (!isVideoNew(videoId)) {
    res.status(400).send("Bad Request: video already processing or processed.");
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      status: "processing",
    });
  }

  await downloadRawVideo(inputFilename);

  try {
    await convertVideo(inputFilename, outputFilename);
  } catch (err) {
    Promise.all([
      deleteRawVideo(inputFilename),
      deleteProcessedVideo(outputFilename),
    ]);
    res.status(500).send("Processing failed");
  }

  await uploadProcessedVideo(outputFilename);

  await setVideo(videoId, {
    status: "processed",
    filename: outputFilename,
  });

  Promise.all([
    deleteRawVideo(inputFilename),
    deleteProcessedVideo(outputFilename),
  ]);

  res.status(200).send("Processing finished successfully");
});

app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`);
});
