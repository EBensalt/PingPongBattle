import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { GetUser } from '../auth/decorator'
import { FTAuthGuard, JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import JwtTwoFaGuard from 'src/auth/guard/twoFaAuth.guard';

@UseGuards(JwtTwoFaGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService )
    {
    }
    @Get('image')
    getImage(@Req() req) {
        console.log(req.user.id)
        return this.userService.getUserAvatar(req.user.id);
    }
    @Get('name')
    async getName(@Req() req) {
        const user = await this.userService.getProfileById(req.user.id)
        return ({username: user.username});
    }
    @Get('userid')
    async getProfileById(@Req() req, @Query('id') id: string) {
        console.log('-------------------------------');
        //console.log(intId);
        const userId: number = +id;
        return (this.userService.getProfileById(userId));
    }
    @Get('profile')
    getProfile(@Req()  req) {
            console.log(req.user.id)
        return (this.userService.getProfile(req.user.id));
    }
}