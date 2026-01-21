"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const bullboard_1 = require("./queue/bullboard");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global prefix
    app.setGlobalPrefix('api/v1');
    // CORS
    app.enableCors();
    // Validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    // Mount Bull Board UI
    const bullBoardService = app.get(bullboard_1.BullBoardService);
    app.use('/admin/queues/ui', bullBoardService.getRouter());
    // Swagger configuration
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Hotel Booking API')
        .setDescription('Backend system for hotel booking with vendor integration')
        .setVersion('1.0')
        .addTag('Bookings')
        .addTag('Queue Monitoring')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    console.log(`📊 Queue monitoring: http://localhost:${port}/admin/queues/ui`);
}
bootstrap();
//# sourceMappingURL=main.js.map