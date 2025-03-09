import mongoose, { Schema } from "mongoose"
import bcrypt from 'bcryptjs'

export interface Usermodel extends Document{
    username: string
    email: string
    password: string
    comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<Usermodel>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean>{
    return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<Usermodel>('user', userSchema)