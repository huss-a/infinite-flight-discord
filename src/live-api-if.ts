import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import {
  ApiResponse,
  FlightInfo,
  AtcFreqType,
  AtcFreqs,
  UserStats,
  AtcRank,
} from "./types";
const { API_KEY, SESSION_ID_EXPERT } = process.env;
import * as Discord from "discord.js";

const BASE_URL = `https://api.infiniteflight.com/public/v2`;
const primaryColor = "#de5100";
export async function getFlight(user: string, message: Discord.Message) {
  try {
    const res = await axios.get<ApiResponse<FlightInfo>>(
      `${BASE_URL}/flights/${SESSION_ID_EXPERT}?apikey=${API_KEY}`
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

    if (
      !userFlight.virtualOrganization ||
      userFlight.virtualOrganization === ""
    )
      Fields.pop();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Flight Info for ${userFlight.username}`)
      .setDescription("Powered by Infinite Flight's Live API v2")
      .addFields(Fields)
      .setColor(primaryColor);

    return message.channel.send(embed);
  } catch (err) {
    console.log(err);
  }
}
export async function getAtcFreqs(server: string, message: Discord.Message) {
  let sessionIdToUse =
    server.toLowerCase() === "expert"
      ? process.env.SESSION_ID_EXPERT
      : server.toLowerCase() === "training"
      ? process.env.SESSION_ID_TRAINING
      : null;

  if (sessionIdToUse === null) return message.channel.send("Invalid server.");

  try {
    const res = await axios.get<ApiResponse<AtcFreqs>>(
      `${BASE_URL}/atc/${sessionIdToUse}?apikey=${API_KEY}`
    );
    // --- code snippet from https://github.com/velocity23/if-discord-bot/blob/master/src/index.ts#L35 ---
    let icaoMapping: { [key: string]: AtcFreqs[] } = {};
    const frequencies = res.data.result;
    for (let freq of frequencies) {
      if (freq.airportName == null) {
        const aipt = frequencies.filter((a) => {
          a.latitude === freq.latitude && a.longitude === freq.longitude;
        })[0];
        if (typeof aipt === "undefined") continue;
        freq.airportName = aipt.airportName;
      }
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
  } catch (err) {
    console.log(err);
  }
}

export async function getUserStats(user: string, message: Discord.Message) {
  const URL = `${BASE_URL}/user/stats?apikey=${process.env.API_KEY}`;
  const body = {
    discourseNames: [user],
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.post<ApiResponse<UserStats>>(URL, body, config);
    const { result } = res.data;
    if (result.length === 0) {
      return message.channel.send(
        "Invalid username or they don't have an active Infinite Flight Pro Subscription."
      );
    }

    if (typeof result[0].atcRank === "undefined")
      result[0].atcRank = AtcRank["Unknown"];

    const Fields: Discord.EmbedFieldData[] = [
      {
        name: "Online Flights",
        value: result[0].onlineFlights,
      },
      {
        name: "Violations",
        value: result[0].violations,
      },
      {
        name: "XP",
        value: result[0].xp,
      },
      {
        name: "Landing Count",
        value: result[0].landingCount,
      },
      {
        name: "Total Flight Time",
        value: Math.floor(result[0].flightTime / 60),
      },
      {
        name: "ATC Operations",
        value: result[0].atcOperations,
      },
      {
        name: "ATC Rank",
        value: AtcRank[result[0].atcRank],
      },
      {
        name: "Virtual Organization",
        value: result[0].virtualOrganization,
      },
    ];
    if (!result[0].virtualOrganization || result[0].virtualOrganization == "") {
      Fields.pop();
    }
    const embed = new Discord.MessageEmbed()
      .setTitle(`Stats for ${result[0].discourseUsername}`)
      .setColor(primaryColor)
      .addFields(Fields);

    return message.channel.send(embed);
  } catch (err) {
    console.log(err);
  }
}
