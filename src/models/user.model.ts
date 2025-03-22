import mongoose, { SchemaType } from "mongoose"
import { encrypt } from "../utils/encryption"

export interface User {
  fullName: string
  username: string
  email: string
  password: string
  role: string
  profilePicture: string
  isActive: boolean
  activationCode: string
}

const Schema = mongoose.Schema

const UserSchema = new Schema<User>(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: ["admin", "user"],
      default: "user",
    },
    profilePicture: {
      type: Schema.Types.String,
      default: "user.jpg",
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: false,
    },
    activationCode: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  }
)

// Middleware buat encrypting password
// Harus declarative function jangan arrow, karna biar bisa pake this
UserSchema.pre("save", function (next) {
  const user = this
  user.password = encrypt(user.password)
  next()
})

// Middleware biar Passwordnya ga ikut ke-kirim ke depan
// Extra safety i guess
UserSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

// Sifatnya sebagai jembatan dari controller untuk menyimpan data user ke database
// Mengeluarkan beberapa function yang bisa digunakan untuk mengelola data User
const UserModel = mongoose.model("User", UserSchema) // User ini nama tabelnya

export default UserModel
