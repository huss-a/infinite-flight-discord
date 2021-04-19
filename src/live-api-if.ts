import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import {
  ApiResponseArr,
  FlightInfo,
  AtcFreqType,
  AtcFreqs,
  UserStats,
  AtcRank,
  OceanicTracks,
  FPL,
} from "./types";
const { API_KEY, SESSION_ID_EXPERT } = process.env;
import * as Discord from "discord.js";
import { client } from "./db";

const BASE_URL = `https://api.infiniteflight.com/public/v2`;
const primaryColor = "#de5100";
export async function getFlight(user: string, message: Discord.Message) {
  try {
    const res = await axios.get<ApiResponseArr<FlightInfo[]>>(
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
    const res = await axios.get<ApiResponseArr<AtcFreqs[]>>(
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
    const res = await axios.post<ApiResponseArr<UserStats[]>>(
      URL,
      body,
      config
    );
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
        name: "Grade",
        value: result[0].grade,
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
    for (const field of Fields) field.inline = true;

    const embed = new Discord.MessageEmbed()
      .setTitle(`Stats for ${result[0].discourseUsername}`)
      .setColor(primaryColor)
      .addFields(Fields);

    return message.channel.send(embed);
  } catch (err) {
    console.log(err);
  }
}

export async function getAtis(apt: string, message: Discord.Message) {
  try {
    const res = await axios.get<ApiResponseArr<string>>(
      `${BASE_URL}/airport/${apt.toUpperCase()}/atis/${SESSION_ID_EXPERT}?apikey=${API_KEY}`
    );

    const embed = new Discord.MessageEmbed()
      .setTitle(`ATIS For ${apt.toUpperCase()} on the Expert Server`)
      .setColor(primaryColor)
      .addField(apt.toUpperCase(), res.data.result, true);
    return message.channel.send(embed);
  } catch (err) {
    return message.channel.send(
      "That airport is currently inactive or the airport ICAO is invalid."
    );
  }
}

export async function getStatus(
  apt: string,
  server: string,
  message: Discord.Message
) {
  let sessionIdToUse =
    server.toLowerCase() === "expert"
      ? process.env.SESSION_ID_EXPERT
      : server.toLowerCase() === "training"
      ? process.env.SESSION_ID_TRAINING
      : null;

  if (sessionIdToUse === null) return message.channel.send("Invalid server.");

  try {
    const res = await axios.get(
      `${BASE_URL}/airport/${apt.toUpperCase()}/status/${sessionIdToUse}?apikey=${API_KEY}`
    );

    const Fields: Discord.EmbedFieldData[] = [
      {
        name: "Inbound Flights",
        value: res.data.result.inboundFlightsCount,
      },
      {
        name: "Outbound Flights",
        value: res.data.result.outboundFlightsCount,
      },
    ];
    for (const f of Fields) f.inline = true;
    const embed = new Discord.MessageEmbed()
      .setTitle(`Status for ${res.data.result.airportIcao}`)
      .addFields(Fields)
      .setColor(primaryColor);

    return message.channel.send(embed);
  } catch (err) {
    console.log(err);
  }
}

// Get Flight plan
// First call the `Get Flights` endpoint and retrieve the `flightId`
// Then pass that ID to the `Get Flight Plan` endpoint

export async function getFPL(user: string, message: Discord.Message) {
  try {
    // GET FLIGHT
    const FlightRes = await axios.get<ApiResponseArr<FlightInfo[]>>(
      `${BASE_URL}/flights/${SESSION_ID_EXPERT}?apikey=${API_KEY}`
    );
    const userFlight = FlightRes.data.result.filter(
      (f) => f.username?.toLowerCase() === user.toLowerCase()
    )[0];
    if (!userFlight)
      return message.channel.send(
        "That user is not currently flying or don't have their Username set."
      );

    // GET FPL
    const FPLRes = await axios.get<ApiResponseArr<FPL>>(
      `${BASE_URL}/flight/${userFlight.flightId}/flightplan?apikey=${API_KEY}`
    );

    const waypoints = FPLRes.data.result.waypoints.join(" ");

    const embed = new Discord.MessageEmbed()
      .setTitle(`FPL for ${userFlight.username}`)
      .setDescription(waypoints)
      .setColor(primaryColor)
      .setFooter(
        "This command may take sometime as it has to make 2 different API calls."
      );
    return message.channel.send(embed);
  } catch (err) {
    console.log(err.message);
  }
}

export async function getTracks(message: Discord.Message) {
  try {
    const res = await axios.get<ApiResponseArr<OceanicTracks[]>>(
      `${BASE_URL}/tracks?apikey=${API_KEY}`
    );
    const embed = new Discord.MessageEmbed().setTitle("Current Oceanic Tracks");
    const Fields: Discord.EmbedFieldData[] = [];
    res.data.result.forEach((o) => {
      Fields.push({
        name: `**Name:** ${o.name}`,
        value: `
**Path:** ${o.path.join(" ")}

**Type**: ${o.type}
`,
        inline: false,
      });
    });
    embed.addFields(Fields).setColor(primaryColor);
    return message.channel.send(embed);
  } catch (err) {
    console.log(err);
  }
}
