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

  /*@SlashCommand({ name: 'help', description: 'Get support' })
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
        content: 'There was an error processing your request',
      });
    }
  }*/

  @SlashCommand({ name: 'holders', description: 'Get token holders' })
  public async onHoldersRequest(
    @Context() [interaction]: SlashCommandContext,
    @Options() { ticker, id }: TokenDto,
  ) {
    const holders = await this.tokenService.getHoldersByToken(ticker, id);
    const data = JSON.parse(holders);
    const length = data.length || 0;
    if (length > 0)
      return interaction.reply({
        content:
          'There are ' + String(length) + ' lucky holders for this token',
      });
    else
      return interaction.reply({
        content: `Token \`${ticker}:${id}\` not found`,
      });
  }

  @SlashCommand({ name: 'token', description: 'Get token data' })
  public async onTokenRequest(
    @Context() [interaction]: SlashCommandContext,
    @Options() { ticker, id }: TokenDto,
  ) {
    try {
      const token = await this.tokenService.get(ticker, id);
      const name = `${ticker}:${id}`;
      const description = `*Type*: ${token.collectionAddress ? 'Art' : 'Token'}
      *Max supply*: ${token.maxSupply}
      *Remaining*: ${token.remaining}
      *Deployment block*: ${token.block}`;

      if (token?.mime && token.mime.includes('image'))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(name)
              .setDescription(description)
              .setImage(
                'https://indexer.inspip.com/token/metadata/' +
                  token.ticker +
                  '/' +
                  token.id,
              ),
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
          embeds: [
            new EmbedBuilder().setTitle(name).setDescription(description),
          ],
        });
      }
    } catch (e) {
      return interaction.reply({
        content: `Token \`${ticker}:${id}\` not found`,
      });
    }
  }
}
