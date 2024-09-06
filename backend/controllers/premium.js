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

exports.leaderBoard = async (req, res) => {
  try {
    const result = await User.find({}, "name totalExpense").sort({
      totalExpense: -1,
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
    const expenses = await Expense.find({ userId: req.user._id });
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expenses_${req.user._id}/${new Date().toISOString()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses, filename);

    if (!fileURL) {
      return res
        .status(400)
        .json({ message: "File URL could not be generated" });
    }

    console.log(req.user);
    console.log("Expenses", expenses);

    req.user.files.push({
      fileUrl: fileURL,
      downloadDate: new Date(),
    });

    await req.user.save();

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
    const files = req.user.files || [];

    res.status(200).json({ files, success: true });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching file URLs" });
  }
};
