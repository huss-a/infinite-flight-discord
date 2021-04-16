import * as Discord from "discord.js";
import dotenv from "dotenv";
import { getAtcFreqs, getAtis, getFlight, getUserStats } from "./live-api-if";
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
    try {
      const user = content.split(" ", 2)[1];
      if (!user) return message.channel.send("Please provide a user!");
      await getFlight(user, message);
    } catch (err) {
      console.log(err);
    }
  }
  if (content.startsWith("*atc")) {
    try {
      const server = content.split(" ", 2)[1].trim();
      await getAtcFreqs(server, message);
    } catch (err) {
      await getAtcFreqs("expert", message);
    }
  }

  if (content.startsWith("*stats")) {
    try {
      const user = content.split(" ", 2)[1].trim();
      await getUserStats(user, message);
    } catch (err) {
      return message.channel.send("Please provide a valid user!");
    }
  }

  if (content.startsWith("*atis")) {
    try {
      const apt = content.split(" ", 2)[1].trim().toUpperCase();
      await getAtis(apt, message);
    } catch (err) {
      return message.channel.send("Please provide an active airport!");
    }
  }
});

client.login(process.env.TOKEN);
