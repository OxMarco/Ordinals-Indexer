import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async uploadFile(name: string, file: Buffer) {
    const fileID = name + Date.now();
    // @todo fix it
  }
}
