import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, index: true, unique: true })
  pid: number;

  @Prop({ required: false })
  beneficiaryAddress: string;

  @Prop({ required: true, index: true })
  ticker: string;

  @Prop({ required: true, index: true })
  id: number;

  @Prop({ required: true })
  decimals: number;

  @Prop({ required: true })
  maxSupply: number;

  @Prop({ required: true })
  remaining: number;

  @Prop({ required: true })
  limit: number;

  @Prop({ required: false })
  mime?: string;

  @Prop({ required: false })
  metadata?: string;

  @Prop({ required: false })
  ref?: string;

  @Prop({ required: false })
  traits?: string;

  @Prop({ required: false })
  collectionNumber?: number;

  @Prop({ required: false })
  collectionAddress?: string;

  @Prop({ required: true })
  txId: string;

  @Prop({ required: true, index: true })
  block: number;

  @Prop({ required: true })
  bvo: number;

  @Prop({ required: true })
  vo: number;

  @Prop({
    type: Map,
    of: { type: String },
    default: { null: 0 },
    required: true,
  })
  balances: Map<string, string>;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
