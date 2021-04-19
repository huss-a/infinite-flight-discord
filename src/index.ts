import * as Discord from "discord.js";
import dotenv from "dotenv";
import {
  getAtcFreqs,
  getAtis,
  getFlight,
  getFPL,
  getStatus,
  getTracks,
  getUserStats,
} from "./live-api-if";
dotenv.config();
import { client as DBClient } from "./db";

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
      const apt = content.split(" ", 2)[1].trim().toLowerCase();
      await getAtis(apt, message);
    } catch (err) {
      return message.channel.send("Please provide an active airport!");
    }
  }

  if (content.startsWith("*status")) {
    try {
      const apt = content.split(" ", 2)[1].trim().toLowerCase();
      const server = content.split(" ", 3)[2].trim().toLowerCase();
      await getStatus(apt, server, message);
    } catch (err) {
      return message.channel.send(
        "Please provide an airport and server! `*status <airport> <server>`"
      );
    }
  }

  if (content.startsWith("*fpl")) {
    try {
      const user = content.split(" ", 2)[1].trim().toLowerCase();
      await getFPL(user, message);
    } catch (err) {
      return message.channel.send("Please provide a user! `*fpl <user>`");
    }
  }

  if (content.startsWith("*tracks")) {
    await getTracks(message);
  }
});
client.login(process.env.TOKEN);
