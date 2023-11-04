import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async uploadFile(name: string, file: Buffer) {
    const response = await this.httpService.post('https://api.nft.storage/upload', {
    });
  }
}
