const admin = require("firebase-admin")

module.exports = (req, res, next) => {

    const token = req.header('Authorization');
    admin.auth().verifyIdToken(token).then((decodedToken) => {
        const uid = decodedToken.uid;
        admin.auth().getUser(uid)
        .then((userRecord) => {
            //admin.auth().setCustomUserClaims(uid, { profesional: true })
            // See the UserRecord reference doc for the contents of userRecord.
            //console.log(userRecord)
            res.locals.user = userRecord
            next()
         })
      })
      .catch((error) => {
        // Handle error
        error.statusCode = 401;
        console.log('ERROR');
        next(error);
      });

}