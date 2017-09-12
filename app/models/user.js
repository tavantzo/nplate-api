import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NumberPlate from './number-plate';
import Constants from '../config/constants';

const Schema = mongoose.Schema;

const ContactMethodSchema = new Schema({
    type: {
        default: 'mobile',
        type: String,
        required: true,
        enum: ['mobile', 'email'],
    },
    value: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const DeviceSchema = new Schema({
    signature: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        default: 'My Device',
        type: String,
        required: false,
    },
}, { timestamps: true });

const UserSchema = new Schema({
    firstname: String,
    lastname: String,
    country: {
        type: String,
        required: true,
        uppercase: true,
        validate: (country) => {
            if (country.length != 2) {
                return false;
            }
            return true;
        },
    },
    mobile: {
        type: String,
        index: true,
        unique: true,
        required: [true, 'Email is required'],
        trim: true,
    },
    nickname: {
        type: String,
        unique: false,
        required: [true, 'Nickname is required.'],
    },
    email: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        validate: {
            validator(email) {
                // eslint-disable-next-line max-len
                const emailRegex = /^[-a-z0-9%S_+]+(\.[-a-z0-9%S_+]+)*@(?:[a-z0-9-]{1,63}\.){1,125}[a-z]{2,63}$/i;
                return emailRegex.test(email);
            },
            message: '{VALUE} is not a valid email.',
        },
    },
    devices: [DeviceSchema],
    contact_methods: [ContactMethodSchema],
}, {
        timestamps: true,
    }
);

class UserClass {
    getNumberPlates() {
        return NumberPlate.find({ _user: this._id });
    }

    /**
     * Authenticate - check if the passwords are the same
     * @public
     * @param {String} password
     * @return {Boolean} passwords match
     */
    authenticate(password) {
        return bcrypt.compareSync(password, this.password);
    }

    /**
     * Generates a JSON Web token used for route authentication
     * @public
     * @return {String} signed JSON web token
     */
    generateToken() {
        return jwt.sign({ _id: this._id }, Constants.security.sessionSecret, {
            expiresIn: Constants.security.sessionExpiration,
        });
    }

    /**
     * Create password hash
     * @private
     * @param {String} password
     * @param {Number} saltRounds
     * @param {Function} callback
     * @return {Boolean} passwords match
     */
    _hashPassword(password, saltRounds = Constants.security.saltRounds, callback) {
        return bcrypt.hash(password, saltRounds, callback);
    }
}

UserSchema.loadClass(UserClass);

UserSchema.set('toJSON', {
    virtuals: true,
    transform(doc, obj) {
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        return obj;
    },
});

// Ensure email has not been taken
UserSchema
    .path('email')
    .validate((email, respond) => {
        UserModel.findOne({ email })
            .then((user) => {
                respond(user ? false : true);
            })
            .catch(() => {
                respond(false);
            });
    }, 'Email already in use.');

// Validate username is not taken
UserSchema
    .path('mobile')
    .validate((username, respond) => {
        UserModel.findOne({ username })
            .then((user) => {
                respond(user ? false : true);
            })
            .catch(() => {
                respond(false);
            });
    }, 'Mobile number already in use by another device.');

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
