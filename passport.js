const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
        usernameField: 'Username',
        passwordField: 'Password',
        },
        async (username, password, calllback) => {
            console.log(`${username} ${password}`);
            await Users.findOne( { Username: username })
            .then((user) => {
                if (!user) {
                    console.log('incorrect username');
                    return calllback(null, false, {
                        message: 'Incorrect username or password.',
                    });
                }
                console.log('finished');
                return calllback(null, user);
            }) // end await Users.findOne ... .then
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return calllback(error);
                }
            }) // end .catch(error)
        } //end async (username, password, callback)
    ) //end LocalStrategy
); //END passport.use

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'}, 
    async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    }) //end return await
    .catch((error) => {
        return callback(error)
    });
})); // END passport.use (new JWTStrategy)