import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { appConfig } from './config/app.config';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(appConfig.port);
}
bootstrap();
