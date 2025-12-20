import { cron } from "@elysiajs/cron";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { prisma } from "./prisma";
import type { server } from "typescript";

const { PORT: port = 3000, UNIX_SOCKET_PATH: unix } = process.env;

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
  .listen(unix ? { unix } : port, (server) =>
    console.log(`Server listening to ${server.url}`),
  );
