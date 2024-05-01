import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { accessTokenOption, refreshTokenOption } from "../utils/jwt";

export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (!token) {
    const authHeader = req.headers.authorization;
    console.log("header", authHeader);
    if (!authHeader && authHeader?.startsWith("Bearer")) {
      throw new ErrorHandler("Please login to access this resources", 401);
    }
    token = authHeader?.split(" ")[1];
  }
  if (!token)
    throw new ErrorHandler("Please login to access this resources", 401);

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    const user = await redis.get(decoded.id);
    if (!user) {
      return next(
        new ErrorHandler("Please login to access this resources ", 400)
      );
    }
    req.user = JSON.parse(user);
    next();
  } catch (error) {
    return new ErrorHandler("Authentication Error", 401);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resources`,
          403
        )
      );
    }
    next();
  };
};

// export const authorizeUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const access_token = req.cookies.access_token as string;
//   console.log(access_token);
//   const refresh_token = req.cookies.refresh_token as string;
//   if (!refresh_token)
//     return next(
//       new ErrorHandler("Please login to access this resource  ", 400)
//     );

//   try {
//     const decoded = jwt.verify(
//       access_token,
//       process.env.ACCESS_TOKEN as string
//     ) as JwtPayload;

//     const user = await redis.get(decoded.id);
//     if (!user) {
//       return next(
//         new ErrorHandler("Please login to access this resources ", 400)
//       );
//     }
//     req.user = JSON.parse(user);
//     next();
//   } catch (error) {
//     if (!refresh_token) {
//       return next(
//         new ErrorHandler("Access Denied. No refresh token provided.", 400)
//       );
//     }

//     try {
//       const decoded = jwt.verify(
//         refresh_token,
//         process.env.REFRESH_TOKEN as string
//       ) as JwtPayload;

//       const session = await redis.get(decoded.id);
//       if (!session) {
//         return next(
//           new ErrorHandler("Please login to access this resources ", 400)
//         );
//       }

//       const user = JSON.parse(session);
//       req.user = user;

//       const accessToken = jwt.sign(
//         { id: user._id },
//         process.env.ACCESS_TOKEN as string,
//         { expiresIn: "1h" }
//       );

//       const refreshToken = jwt.sign(
//         { id: user._id },
//         process.env.REFRESH_TOKEN as string,
//         { expiresIn: "3d" }
//       );

//       res.cookie("access_token", accessToken, accessTokenOption);
//       res.cookie("refresh_token", refreshToken, refreshTokenOption);

//       await redis.set(user._id, JSON.stringify(user), "EX", 604800);
//       next();
//     } catch (error) {
//       return next(new ErrorHandler("Invalid Token.", 400));
//     }
//   }
// };
