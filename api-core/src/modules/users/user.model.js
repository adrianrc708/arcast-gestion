const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, ingresa un correo válido']
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "boss"],
    default: "user",
  },
  watchlist: [
    {
      item: { type: Schema.Types.ObjectId, required: true },
      kind: { type: String, enum: ["Movie", "TVShow"] },
    },
  ],
  watchHistory: [
    {
      contentId: String,
      contentType: { type: String, enum: ["Movie", "TVShow"] }, // Rescatado de tu compañero
      percentWatched: Number,
      currentTime: Number,
      lastTimeWatched: { type: Date, default: Date.now },
    },
  ],
  lastTimeWatched: { type: Date, default: Date.now },
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", UserSchema);
