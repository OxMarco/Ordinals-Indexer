import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Token } from './token';

export type UtxoDocument = HydratedDocument<Utxo>;

@Schema({ timestamps: true })
export class Utxo {
  @Prop({ required: true, index: true })
  address: string;

  @Prop({ required: true, index: true })
  txId: string;

  @Prop({ required: true })
  vout: number;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true, default: false })
  spent: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true })
  token: Token;

  @Prop({ required: true, index: true })
  block: number;
}

export const UtxoSchema = SchemaFactory.createForClass(Utxo);
