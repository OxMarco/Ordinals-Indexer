import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Token } from './token';

export type BalanceDocument = HydratedDocument<Balance>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Balance {
  @Prop({ required: true, index: true })
  address: string;

  @Prop({ required: true })
  balance: string;

  @Prop({ required: true, index: true })
  block: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true })
  token: Token;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
