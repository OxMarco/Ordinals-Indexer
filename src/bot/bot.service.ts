import { Injectable } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { TokenDto } from 'src/dtos/token';
import { TokenService } from '../token/token.service';

@Injectable()
export class BotService {
  constructor(private tokenService: TokenService) {}

  @SlashCommand({ name: 'gm', description: 'GM Command' })
  public async onPingRequest(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: 'GM!' });
  }

  @SlashCommand({ name: 'faq', description: 'Show the FAQ' })
  public async onFaqRequest(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({
      content:
        '*Pipe Protocol:* an evolution on Ordinals for inscriptions on Bitcoin core\
      *What you can do with it:* deploy, mint and transfer both fungible and non fungible tokens\
      *Why it is different:* allows for truly open mints and account-based logic',
    });
  }

  @SlashCommand({ name: 'holders', description: 'Get token holders' })
  public async onHoldersRequest(
    @Context() [interaction]: SlashCommandContext,
    @Options() { ticker, id }: TokenDto,
  ) {
    try {
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
    } catch (e) {
      return interaction.reply({
        content: 'Generic error',
      });
    }
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
