// Import các thư viện
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");

// Khai báo các routes
const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const supportRoutes = require("./routes/support");

// Tạo biến app
const app = express();

// Setting file storage
const fileStorage = multer.diskStorage({
  // Thư mục chứa image
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "/images"));
  },
  // Tên file [thời gian hiện tại] - tên file gốc
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

// Lọc image chỉ lấy các định dạng png,jpg,jpeg
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    return callback(null, true);
  }
  callback(null, false);
};

// Middleware cors để xử lý CORS policy
app.use(cors());

// Middleware để parse body thành json
app.use(bodyParser.json());

// Middleware để lưu và xử lí file image
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,

    // Giởi hạn chỉ được add 4 hình ảnh
  }).array("images", 4)
);

// Sử dụng các routes
app.use("/auth", authRoutes);
app.use("/shop", shopRoutes);
app.use("/admin", adminRoutes);
app.use("/support", supportRoutes);

// Chỉnh static path
app.use("/images", express.static(path.join(__dirname, "images")));

// Middleware handle error
app.use((error, req, res, next) => {
  console.log(error);
  res.sendStatus(error.httpStatusCode || 500);
  res.end();
});

const { chatHandler } = require("./helper/chat");

// Connect tới mongoDB
mongoose.connect(`${process.env.MONGO_DATABASE_URL}`).then((result) => {
  // Chạy app ở port 5000 và mở socket.io connection với client
  const server = app.listen(process.env.PORT || 3000);
  const io = require("./socket").init(server);
  io.on("connection", (socket) => {
    chatHandler(socket);
  });
});
