import multer from "multer";

const storage = multer.memoryStorage(); // Go thru ram wont be saved on hdd

const upload = multer({
  storage,
});

export default {
  // To upload single files
  single(fieldName: string) {
    return upload.single(fieldName);
  },
  // To upload multiple files at the same time
  multiple(fieldName: string) {
    return upload.array(fieldName);
  },
};
