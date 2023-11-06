import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Token } from './token';

export type RemainingDocument = HydratedDocument<Remaining>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Remaining {
  @Prop({ required: true })
  remaining: number;

  @Prop({ required: true, index: true })
  block: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true })
  token: Token;
}

export const RemainingSchema = SchemaFactory.createForClass(Remaining);
