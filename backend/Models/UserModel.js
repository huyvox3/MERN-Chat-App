const mongoose = require("mongoose");

const bcrypt = require('bcryptjs')
const userModel = mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    pic: {
      type: String,
      require: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);


// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

userModel.methods.matchPassword = async function (password){
  return await bcrypt.compare(password,this.password)
}
userModel.pre('save',async function (next){
  if(!this.isModified){
    next()
  }
  const salt  = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password,salt)
})

const User = mongoose.model('User',userModel)

module.exports = User