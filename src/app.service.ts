import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AppService {
  private token;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.token = configService.get<string>('NFT_STORAGE_TOKEN');
  }

  async uploadFile(file: Buffer) {
    const headersRequest = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/octet-stream',
    };

    this.httpService
      .post('https://api.nft.storage/upload', file.buffer, {
        headers: headersRequest,
      })
      .subscribe((response) => {
        if (
          response.data.ok &&
          response.data.value &&
          response.data.value.cid
        ) {
          return response.data.value.cid;
        } else {
          throw new Error('Could not upload the file');
        }
      });
  }
}
