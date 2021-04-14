import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { ApiResponse, FlightInfo, AtcFreqType, AtcFreqs } from "./types";
const { API_KEY, SESSION_ID } = process.env;
import * as Discord from "discord.js";

const BASE_URL = `https://api.infiniteflight.com/public/v2`;
const primaryColor = "#de5100";
export async function getFlight(user: string, message: Discord.Message) {
  const res = await axios.get<ApiResponse<FlightInfo>>(
    `${BASE_URL}/flights/${SESSION_ID}?apikey=${API_KEY}`
  );
  const userFlight = res.data.result.filter(
    (f) => f.username?.toLowerCase() === user.toLowerCase()
  )[0];
  if (!userFlight)
    return message.channel.send(
      "That user is not currently flying or don't have their Username set."
    );
  const Fields: Discord.EmbedFieldData[] = [
    {
      name: "Username",
      value: userFlight.username,
    },
    {
      name: "Callsign",
      value: userFlight.callsign,
    },
    {
      name: "Heading",
      value: Math.floor(userFlight.heading) + "°",
    },
    {
      name: "Speed",
      value: Math.floor(userFlight.speed) + "kts",
    },
    {
      name: "Vertical Speed",
      value: Math.floor(userFlight.verticalSpeed) + "fpm",
    },
    {
      name: "Altitude",
      value: Math.floor(userFlight.altitude),
    },
    {
      name: "State",
      value:
        userFlight.verticalSpeed > 150
          ? "Climbing"
          : userFlight.verticalSpeed < -150
          ? "Descending"
          : "Cruising",
    },
    {
      name: "Virtual Organization",
      value: userFlight.virtualOrganization,
    },
  ];

  for (const field of Fields) {
    field.inline = true;
  }

  if (!userFlight.virtualOrganization || userFlight.virtualOrganization === "")
    Fields.pop();
  const embed = new Discord.MessageEmbed()
    .setTitle(`Flight Info for ${userFlight.username}`)
    .setDescription("Powered by Infinite Flight's Live API v2")
    .addFields(Fields)
    .setColor(primaryColor);

  return message.channel.send(embed);
}
export async function getAtcFreqs(server: string, message: Discord.Message) {
  let sessionIdToUse =
    server.toLowerCase() === "expert"
      ? process.env.SESSION_ID_EXPERT
      : server.toLowerCase() === "training"
      ? process.env.SESSION_ID_TRAINING
      : null;

  if (sessionIdToUse === null) return message.channel.send("Invalid server.");

  const res = await axios.get<ApiResponse<AtcFreqs>>(
    `${BASE_URL}/atc/${sessionIdToUse}?apikey=${API_KEY}`
  );
  // --- code snippet from https://github.com/velocity23/if-discord-bot/blob/master/src/index.ts#L35 ---
  let icaoMapping: { [key: string]: AtcFreqs[] } = {};
  const frequencies = res.data.result;
  for (let freq of frequencies) {
    if (!icaoMapping[freq.airportName]) {
      icaoMapping[freq.airportName] = [];
    }
    icaoMapping[freq.airportName].push(freq);
  }
  const splitServerName = server.split("");
  splitServerName[0] = splitServerName[0].toUpperCase();
  server = splitServerName.join("");
  const embed = new Discord.MessageEmbed()
    .setTitle(`Active ATC frequencies on the ${server} server`)
    .setColor(primaryColor);
  for (const [icao, frequencies] of Object.entries(icaoMapping)) {
    embed.addField(
      icao,
      frequencies.map((freq) => AtcFreqType[freq.type]).join(", ")
    );
  }
  //-------------------------------------------------------
  return message.channel.send(embed);
}
