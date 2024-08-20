const AWS = require("aws-sdk");
const User = require("../models/user");
const Expense = require("../models/expense");
const FilesUrl = require("../models/fileurl");

let result = [];

const s3 = new AWS.S3({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
});

const uploadToS3 = (data, filename) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3response) => {
      if (err) {
        console.log("Error::", err);
        reject(err);
      } else {
        console.log("Success", s3response);
        resolve(s3response.Location);
      }
    });
  });
};

exports.leaderBoard = async (req, res, next) => {
  try {
    result = await User.findAll({
      attributes: ["name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leaderboard" });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expenses_${req.user.id}/${new Date()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses, filename);
    //console.log("errrrrrrrrrrrrrrrrrrrrrrrorrr", fileURL);
    if (!fileURL) {
      return res.status(400).json({ message: "fileUrl is required" });
    }

    await FilesUrl.create({
      fileUrl: fileURL,
      userId: req.user.id,
      downloadDate: new Date(),
    });

    res.status(200).json({ fileURL, success: true });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error generating report" });
  }
};

exports.showFileUrl = async (req, res) => {
  try {
    const files = await req.user.getFilesUrls({
      attributes: ["fileUrl", "downloadDate"],
      order: [["downloadDate", "DESC"]],
    });

    res.status(200).json({ files, success: true });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching file URLs" });
  }
};
