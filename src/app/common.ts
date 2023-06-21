import { NextRequest } from "next/server";
import jwt from "jsonwebtoken"

function isAuthorized(request: NextRequest) {
    try {
      const authorizationToken: string  = request?.headers.get('Authorization') ?? '';
      const clientSecret: string = process.env.CLIENT_SECRET ?? '';
      console.log('client-secret', clientSecret);
      console.log('authorizationToken', authorizationToken);
      const payload = jwt.verify(authorizationToken, clientSecret);
      if (payload) {
        return true;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }