//jwt.strategy.ts

//       Anotaciones: 

//      - Strategy es un componente que implementa una logica de autenticacion especifica. (JWT,OAuth,etc).

//      - Al importar "Strategy" de passport-jwt, Passport le asigna automaticamente el nombre "jwt" a esta estrategia.

//      - Este nombre es usado por el JwtAuthGuard para identificar que estrategia usar.  

//      - Passport es un middleware de autenticacion para nodejs.

//      - El middleware se ejecuta antes de que la peticion llegue al controller.

//      - En NestJS, Passport deja de actuar como un middleware global y se convierte 
//        en una herramienta que el Guard utiliza.

//      - Nest detecta que una ruta tiene @UseGuard(JwtAuthGuard) y 
//        el guard toma el control cuando se recibe la request en dicha ruta.

//      - El Guard llama a Passport: En lugar de que Passport se ejecute solo
//        al principio de la aplicación (como un middleware tradicional), el Guard lo invoca manualmente.

//      - Passport hace su trabajo (revisar el token y la firma) dentro de la ejecución del Guard.

//      - El Guard decide: Basado en lo que Passport le respondió, el Guard permite o bloquea el paso. 


import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt,Strategy} from 'passport-jwt'
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(private readonly configService: ConfigService){

        //  Super() configura Passport. Si el token es falso, expiro, o no se pudo leer 
        // la secret key, la ejecución se detiene aquí y devuelve 401.

        super({
            //extraer el token del header de la peticion
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            //validar tambien la expiracion del token
            ignoreExpiration: false,

            //obtener jwt secre de .env
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }   


    // Este metodo es llamado automaticamente por passport si el token es valido.
    // El 'payload' es el contenido ya desencriptado del JWT.

    async validate(payload: any){
        return {
            //Lo que retornamos aca, Nest lo mete en el objeto 'request.user'.
            // Asi, en cualquier Controller se sabe quien hizo la peticion.
            userId: payload.sub,
            email: payload.email
        }
    } 
}