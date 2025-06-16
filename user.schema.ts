import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  declare _id: Types.ObjectId;
  @Prop()
  avatar?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: function (this: any) {
      return this.authProvider === 'local';
    },
  })
  password: string;

  @Prop({ type: String, default: null })
  otp?: string | null;

  @Prop({ type: Date, default: null })
  otpExpiry?: Date | null;

  @Prop({ type: String, default: null })
  refreshToken?: string | null;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: 'user' })
  role?: string;

  @Prop({ type: String, default: null })
  profilePic: string | null;

  @Prop({ type: String, enum: ['local', 'google'], default: 'local' })
  authProvider: 'local' | 'google';

  @Prop({ type: [String], default: [] })
  scope: string[];
  // src/users/schemas/user.schema.ts
  @Prop([{ workspace_id: { type: Types.ObjectId, ref: 'Workspace' } }])
  workspace_access?: { workspace_id: Types.ObjectId }[];
  @Prop({ unique: true, sparse: true })
  googleId?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
