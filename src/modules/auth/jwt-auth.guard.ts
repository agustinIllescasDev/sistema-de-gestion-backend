//jwt-auth.guard.ts

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt"){}

//Pasamos el nombre de la estrategia (jwt).

//Recordemos que este nombre lo asigna Passport, por lo que de esta forma, el guard 
// le pasa el control a la Strategy para extraer el token y lo valide.

//Si el token es valido, la Strategy retorna el payload al Guard,
//y el Guard permite el paso a la ruta protegida. 
//Esta logica ocurre en la clase padre AuthGuard, usando su metodo canActivate.

//Si el token no es valido, la Strategy no retorna nada y el Guard bloquea el paso,
// arrojando un error 401 Unauthorized.

