import { prisma } from "./src/prisma";

// read all data
prisma.temperatureReading.findMany().then((data) => console.log(data));
