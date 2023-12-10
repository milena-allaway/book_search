const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
   // authentication error handling for GraphQL
   AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),

  // function for our authenticated routes
  // authMiddleware: function (req, res, next) {
    authMiddleware: function ({req}) {
    // allows token to be sent via body, query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // split the token string into an array and return actual token
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }
    
    if (!token) {
      // return res.status(400).json({ message: 'You have no token!' });
      return req;
    }

    // if token can be verified, add the decoded user's data to the request so it can be accessed in the resolver
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      // return res.status(400).json({ message: 'invalid token!' });
    }

    // send to next endpoint
    // next();
    return req;
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
