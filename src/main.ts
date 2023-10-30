import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unknown properties
      transform: true, // auto-transform request payloads to specified types
    }),
  );

  await app.listen(3000);
}
bootstrap();
