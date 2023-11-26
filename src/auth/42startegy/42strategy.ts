import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { FTUser } from "../42dto";
const Strategy = require('passport-42').Strategy;

@Injectable()
export class FTAuth extends PassportStrategy(Strategy, '42') {
    constructor(config: ConfigService) {
        super ({
            clientID: config.get('42_CLIENTID'),
            clientSecret: config.get('42_CLIENTSECRET'),
            callbackURL: 'http://localhost:3000/auth/callback',
        });
    }
    validate(accesToken: string, refreshToken: string, profile: any) {
        const user = {
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            userName: profile.username,
            avatar: profile._json.image.link,
            accesToken,
        }
        console.log(user);
        return user;
    }
}