import { Injectable } from '@nestjs/common';
import { IpfsAdapter } from './utils/ipfs';

@Injectable()
export class AppService {
  private ipfs;

  constructor() {
    this.ipfs = new IpfsAdapter();
  }

  async uploadFile(name: string, file: Buffer) {
    const fileID = name + Date.now();
    return await this.ipfs.storeFiles([
      { path: '/uploads/' + fileID, content: file },
    ]);
  }
}
