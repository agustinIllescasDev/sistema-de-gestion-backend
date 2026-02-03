//login.dto.ts

import {IsString, IsNotEmpty, IsEmail} from 'class-validator'

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    mail: string

    @IsString()
    @IsNotEmpty()
    password: string
}