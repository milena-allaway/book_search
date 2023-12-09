const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            // check if user is authenticated
            if (context.user) {
                // if they are, query for and return their user data
                // minus the password (for security)
                //and __v (version number) fields (for aesthetics)
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')
                return userData;
            }
            // if user is not logged in, throw an Authentication error
            throw new AuthenticationError('Not logged in');
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            // create new user in db
            const user = await User.create(args);
            // sign a token for the user
            const token = signToken(user);
            // return an object that combines the token and user data
            return { token, user };
        },
    
        login: async (parent, { email, password }) => {
            // find user by email
            const user = await User.findOne({ email });
            // if no user found, throw an Authentication error
            if (!user) {
                throw new AuthenticationError('Cannot find a user with this email address!');
            }
            // check if password provided is correct
            const correctPw = await user.isCorrectPassword(password);
            // if password is incorrect, throw an Authentication error
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }
            // if user is found and password is correct, sign a token to the user
            // and return an object that combines the token and user data 
            const token = signToken(user);
            return { token, user };
        },
        
        saveBook: async (parent, { bookData }, context) => {
            // check if user is logged in/authenticated
            if (context.user) {
                // if they are, update the user by adding a new saved book
                // by adding the bookData to the savedBooks array
                // bookData will be structured like the bookInput type
                const updateUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                );
                // return the updated user data
                return updateUser;
            }
            // if user is not logged in, throw an Authentication error
            throw new AuthenticationError('You need to be logged in!');
        },
    
        removeBook: async (parent, { bookId }, context) => {
            // check if user is logged in/authenticated
            if (context.user) {
                // if they are, update the user by removing the specified book
                // by removing the bookId from the savedBooks array
                const updateUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                // return the updated user data
                return updateUser;
            }
            // if user is not logged in, throw an Authentication error
            throw new AuthenticationError('You need to be logged in!');
        }
    },
};

module.exports = resolvers;