const fs = require("fs");
const path = require("path");

// Hàm hỗ trợ delete file
const deleteImageFile = (imgFileName) => {
  fs.unlink(
    path.join(path.dirname(require.main.filename), "images", imgFileName),
    (err) => {
      if (err) {
        throw new Error(err);
      }
    }
  );
};

exports.deleteImageFile = deleteImageFile;
