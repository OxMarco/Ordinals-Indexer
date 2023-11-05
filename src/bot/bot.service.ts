import { Injectable } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { TokenDto } from 'src/dtos/token';
import { HelpRequestDto } from 'src/dtos/help-request';
import { TokenService } from '../token/token.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class BotService {
  private openai;

  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {
    const key = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({
      apiKey: key,
    });
  }

  async askChatGPT(text: string) {
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: 'gpt-3.5-turbo',
      });
    return chatCompletion.choices[0].message.content;
  }

  @SlashCommand({ name: 'gm', description: 'GM Command' })
  public async onPingRequest(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: 'GM!' });
  }

  @SlashCommand({ name: 'help', description: 'Get support' })
  public async onHelpRequest(
    @Context() [interaction]: SlashCommandContext,
    @Options() { text }: HelpRequestDto,
  ) {
    const responses = [
      "Hang tight, I'm on it...",
      'Let me think about that...',
      'Sure thing! Coming up with an answer...',
      'Processing...beep..boop...',
      'I wish I knew! Let me ask my friend...',
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply({ content: response });

    try {
      const response = await this.askChatGPT(text);
      await interaction.editReply({ content: response });
    } catch (error) {
      await interaction.editReply({
        content: 'There was an error processing your request.',
      });
    }
  }

  @SlashCommand({ name: 'token', description: 'Get token data' })
  public async onTokenRequest(
    @Context() [interaction]: SlashCommandContext,
    @Options() { ticker, id }: TokenDto,
  ) {
    const token = await this.tokenService.get(ticker, id);
    if (!token) {
      return interaction.reply({ content: `Token ${ticker}:${id} not found` });
    }

    const name = `Token ${ticker}:${id}`;
    const description = `*MaxSupply*: ${token.maxSupply}
    *Collection #*: ${token.collectionNumber}
    *Collection address*: ${token.collectionAddress}
    *Deployment block*: ${token.block}`;

    if (token?.mime && token.mime.includes('image'))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(name)
            .setDescription(description)
            .setImage(
              'http://localhost:3000/indexer/token-metadata/' +
                token.ticker +
                '/' +
                token.id,
            ), // @todo change to prod url
        ],
      });
    else if (token?.ref) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(name)
            .setDescription(description)
            .setImage(token.ref),
        ],
      });
    } else {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle(name).setDescription(description)],
      });
    }
  }
}
