import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DigestService } from '../modules/jobs/digest.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    await app.get(DigestService).runManual();
    // eslint-disable-next-line no-console
    console.log('Daily digest completed.');
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
