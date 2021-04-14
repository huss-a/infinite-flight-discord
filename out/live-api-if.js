"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlight = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const { API_KEY, SESSION_ID } = process.env;
const Discord = __importStar(require("discord.js"));
function getFlight(user, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = `https://api.infiniteflight.com/public/v2/flights/${SESSION_ID}?apikey=${API_KEY}`;
        const res = yield axios_1.default.get(URL);
        const userFlight = res.data.result.filter((f) => { var _a; return ((_a = f.username) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === user.toLowerCase(); })[0];
        if (!userFlight)
            return message.channel.send("That user is not currently flying or don't have their Username set.");
        const Fields = [
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
                value: userFlight.verticalSpeed > 150
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
    });
}
exports.getFlight = getFlight;
