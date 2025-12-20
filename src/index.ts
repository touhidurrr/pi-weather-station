import { cron } from "@elysiajs/cron";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { prisma } from "./prisma";
import { chmod } from "node:fs/promises";

const { PORT: port = 3000, UNIX_SOCKET_PATH: unix } = process.env;

if (unix) {
  const file = Bun.file(unix);
  if (await file.exists()) {
    await file.unlink();
  }
}

new Elysia()
  .get("/readings", () => prisma.temperatureReading.findMany())
  .use(
    cron({
      name: "takereadings",
      pattern: "* * * * *",
      run: async () => {
        const file = Bun.file("/sys/class/thermal/thermal_zone0/temp");

        if (!(await file.exists())) {
          console.error("Temperature file not found");
          return;
        }

        const tempStr = await file.text();
        const temp = parseFloat(tempStr.trim()) / 1000;
        await prisma.temperatureReading.create({ data: { temperature: temp } });
      },
    }),
  )
  .use(staticPlugin({ prefix: "/", assets: "site", alwaysStatic: true }))
  .listen(unix ? { unix } : port, (server) => {
    if (unix) chmod(unix, 0o666);
    console.log(`Server listening to ${server.url}`);
  });
