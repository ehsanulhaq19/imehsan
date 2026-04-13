import { NestFactory } from '@nestjs/core';
import * as readline from 'readline';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    }),
  );
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const users = app.get(UsersService);
  try {
    const firstName = await ask('First name: ');
    const lastName = await ask('Last name: ');
    const email = await ask('Email: ');
    const password = await ask('Password (min 8 chars): ');
    await users.createSystemUser({ firstName, lastName, email, password });
    // eslint-disable-next-line no-console
    console.log('System user created.');
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
