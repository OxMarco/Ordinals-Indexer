import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Return server status' })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Get()
  index() {
    return { message: 'ok', time: new Date().toISOString() };
  }

  @ApiOperation({ summary: 'Upload a file to IPFS' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Post('upload')
  async uploadFile(
    @Body() body: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .addMaxSizeValidator({
          maxSize: 10000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const cid = await this.appService.uploadFile(file.buffer);
    return { message: cid };
  }
}
