import { Injectable } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { IndexerService } from './indexer.service';
import { TokenDto } from 'src/dtos/token';
import { text } from 'stream/consumers';
import { HelpRequestDto } from 'src/dtos/help-request';

@Injectable()
export class IndexerBot {
  constructor(private indexerService: IndexerService) {}

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
      const response = await this.indexerService.askChatGPT(text);
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
    const token = await this.indexerService.get(ticker, id);
    if (!token) {
      return interaction.reply({ content: `Token ${ticker}:${id} not found` });
    } else {
      if (token.mime.includes('image'))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Token ${ticker}:${id}`)
              .setDescription(
                `*MaxSupply*: ${token.maxSupply}\n*Collection address*: ${token.collectionAddress}`,
              )
              .setImage(
                'http://localhost:3000/indexer/token-metadata/' +
                  token.ticker +
                  '/' +
                  token.id,
              ), // @todo change to prod url
          ],
        });
      else {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Token ${ticker}:${id}`)
              .setDescription(
                `*MaxSupply*: ${token.maxSupply}\n*Collection address*: ${token.collectionAddress}`,
              ),
          ],
        });
      }
    }
  }
}
