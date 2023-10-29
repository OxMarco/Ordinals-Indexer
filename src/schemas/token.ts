import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: false })
export class Token {
  @Prop({ required: true })
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
  traits?: string;

  @Prop({ required: true })
  collectionNumber: number;

  @Prop({ required: true })
  collectionAddress: string;

  @Prop({ required: true })
  txId: string;

  @Prop(
    raw({
      address: { type: String },
      balance: { type: String },
    }),
  )
  balances: Map<string, string>;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
