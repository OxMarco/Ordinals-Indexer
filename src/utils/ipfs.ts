import { Web3Storage, getFilesFromPath } from 'web3.storage';

export class IpfsAdapter {
  private client: any;

  constructor() {
    this.client = new Web3Storage({ token: '' });
  }

  async getFiles(path: string) {
    const files = await getFilesFromPath(path);

    return files;
  }

  async storeFiles(files: any[]) {
    const cid = await this.client.put(files);

    return cid;
  }
}
