import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: false })
  pid: number;

  @Prop({ required: true, index: true })
  ticker: string;

  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  decimals: number;

  @Prop({ required: true })
  maxSupply: number;

  @Prop({ required: true })
  limit: number;

  @Prop({ required: true })
  mime: string;

  @Prop({ required: true })
  metadata: string;

  @Prop({ required: false })
  ref?: string;

  @Prop({ required: false })
  traits?: string;

  @Prop({ required: true })
  collectionNumber: number;

  @Prop({ required: true, index: true })
  collectionAddress: string;

  @Prop({ required: true })
  txId: string;

  @Prop({ required: true, index: true })
  block: number;

  @Prop({
    type: Map,
    of: { type: String },
    default: { null: 0 },
    required: true,
  })
  balances: Map<string, string>;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
