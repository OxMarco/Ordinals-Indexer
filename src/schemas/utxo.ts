import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Token' })
  token: Token
}

export const UtxoSchema = SchemaFactory.createForClass(Utxo);
