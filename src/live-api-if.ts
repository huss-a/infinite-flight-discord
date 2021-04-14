import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { ApiResponse } from "./types";
const { API_KEY, SESSION_ID } = process.env;
import * as Discord from "discord.js";

export async function getFlight(user: string, message: Discord.Message) {
  const URL = `https://api.infiniteflight.com/public/v2/flights/${SESSION_ID}?apikey=${API_KEY}`;
  const res = await axios.get<ApiResponse>(URL);
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
      inline: true,
    },
    {
      name: "Callsign",
      value: userFlight.callsign,
      inline: true,
    },
    {
      name: "Heading",
      value: Math.floor(userFlight.heading) + "°",
      inline: true,
    },
    {
      name: "Speed",
      value: Math.floor(userFlight.speed) + "kts",
      inline: true,
    },
    {
      name: "Vertical Speed",
      value: Math.floor(userFlight.verticalSpeed) + "fpm",
      inline: true,
    },
    {
      name: "Altitude",
      value: Math.floor(userFlight.altitude),
      inline: true,
    },
    {
      name: "State",
      value:
        userFlight.verticalSpeed > 150
          ? "Climbing"
          : userFlight.verticalSpeed < -150
          ? "Descending"
          : "Cruising",
      inline: true,
    },
    {
      name: "Virtual Organization",
      value: userFlight.virtualOrganization,
      inline: true,
    },
  ];
  if (!userFlight.virtualOrganization || userFlight.virtualOrganization === "")
    Fields.pop();
  const embed = new Discord.MessageEmbed()
    .setTitle(`Flight Info for ${userFlight.username}`)
    .setDescription("Powered by Infinite Flight's Live API v2")
    .addFields(Fields)
    .setColor("#de5100");

  return message.channel.send(embed);
}
