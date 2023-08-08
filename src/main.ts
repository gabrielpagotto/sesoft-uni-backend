import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { appConfig } from './config/app.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('Sesoft Uni - API')
        .setDescription('API para projeto da faculdade')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    await app.listen(appConfig.port);
}
bootstrap();
