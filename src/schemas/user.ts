import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true, index: true })
  address: string;

  @Prop({ required: false })
  bio?: string;

  @Prop({ required: false, type: Map, of: String })
  socials?: Map<string, string>;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ required: false })
  header?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
