import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: function() {
        return this.provider == 'local'
    } },
    password: { type: String, required: function() {
        return this.provider == 'local'
    }},
    fullName: { type: String, required: true },
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer"
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {type: String}
})

userSchema.pre('save', async function () {
    if (!this.isModified("password")) {
        return
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePasswords = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model('user', userSchema)

export default userModel