import * as Discord from "discord.js";
import dotenv from "dotenv";
import { foo, getAtcFreqs, getFlight, getUserStats } from "./live-api-if";
dotenv.config();

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("message", async (message) => {
  const content = message.content.toLowerCase().trim();
  if (message.content.startsWith("*ping")) {
    message.channel.send(`Pong! **Latency: ${client.ws.ping}ms** ✈`);
  }

  if (content.startsWith("*flight")) {
    const user = content.split(" ", 2)[1];
    await getFlight(user, message);
  }
  if (content.startsWith("*atc")) {
    const server = content.split(" ", 2)[1].trim();
    await getAtcFreqs(server, message);
  }

  if (content.startsWith("*stats")) {
    const user = content.split(" ", 2)[1].trim();
    await getUserStats(user, message);
  }

  if (content.startsWith("*set")) {
    const user = content.split(" ", 2)[1].trim();
    await foo(user, message);
  }
});

client.login(process.env.TOKEN);
