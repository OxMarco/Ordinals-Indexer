import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import Arweave from 'arweave';

@Injectable()
export class AppService {
  private token;
  private arweaveKey: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.token = configService.get<string>('NFT_STORAGE_TOKEN');
    this.arweaveKey = JSON.parse(
      configService.get<string>('ARWEAVE_KEY') || '{}',
    );
  }

  async uploadFileToArweave(file: Buffer) {
    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    });

    const transaction = await arweave.createTransaction(
      { data: file.buffer },
      this.arweaveKey,
    );
    transaction.addTag('Content-Type', 'image/jpeg');

    await arweave.transactions.sign(transaction, this.arweaveKey);
    await arweave.transactions.post(transaction);
    const status = await arweave.transactions.getStatus(transaction.id);

    if (status.status !== 200) throw new Error('Could not upload the file');
    return transaction.id;
  }

  async uploadFileToIPFS(file: Buffer) {
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
