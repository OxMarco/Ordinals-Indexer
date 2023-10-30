import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { Token } from './token';

export type ActionDocument = HydratedDocument<Action>;

export enum ActionType {
  Mint = 'mint',
  Deploy = 'deploy',
  Transfer = 'transfer',
}

@Schema({ timestamps: true })
export class Action {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  value: number;

  @Prop({ type: String, enum: Object.values(ActionType), required: true })
  type: ActionType;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Token' })
  token?: Token;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
