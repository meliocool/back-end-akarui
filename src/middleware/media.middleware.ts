import multer from "multer";

const storage = multer.memoryStorage(); // Go thru ram wont be saved on hdd

const upload = multer({
  storage,
});

export default {
  single(fieldName: string) {
    return upload.single(fieldName);
  },
  multiple(fieldName: string) {
    return upload.array(fieldName);
  },
};
