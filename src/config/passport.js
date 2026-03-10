// import passport from 'passport'
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
// import UserModel from '~/models/user.model'

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID!,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//   callbackURL: `${process.env.API_ROOT}/user/auth/google/callback`,
//   passReqToCallback: false
// },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const googleId = profile.id
//       const email = profile.emails?.[0].value
//       const fullName = profile.displayName
//       const avatar = profile.photos?.[0].value

//       if (!email) return done(new Error('Không thể lấy email từ Google.'), false)
      
//       let user = await UserModel.findOne({ 
//         $or: [{ googleId: googleId}, { email: email }],
//         deleted: false 
//       })

//       if (!user) {
//         user = new UserModel({
//           googleId,
//           email,
//           fullName,
//           avatar
//         })
//         await user.save()
//       } else {
//         if (!user.googleId) {
//           user.googleId = googleId
//           user.avatar = user.avatar || avatar
//           await user.save()
//         }
//       }
//       return done(null, user)
//     } catch (error) {
//       return done(error as Error, false)
//     }
//   }
// ))
