import BaseController from './base.controller';
import User from '../models/user';

class UsersController extends BaseController {

    whitelist = [
        'firstname',
        'lastname',
        'mobile',
        'nickname',
        'country',
        'devices',
        'device',
        'contact_methods',
    ];

    _populate = async (req, res, next) => {
        const { username } = req.params;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                const err = new Error('User not found.');
                err.status = 404;
                return next(err);
            }

            req.user = user;
            next();
        } catch (err) {
            next(err);
        }
    }

    view = async (req, res, next) => {
        const { _id } = req.params || null;

        try {
            // @TODO Add pagination
            res.json(await User.findOne({ _id }));
        } catch (err) {
            next(err);
        }
    }

    search = async (req, res, next) => {
        try {
            // @TODO Add pagination
            res.json(await User.find());
        } catch (err) {
            next(err);
        }
    }

    fetch = (req, res) => {
        const user = req.user || req.currentUser;

        if (!user) {
            return res.sendStatus(404);
        }

        res.json(user);
    }

    create = async (req, res, next) => {
        const params = this.filterParams(req.body, this.whitelist);
        const { device_signature, device_name } = req.body;

        console.log(params, { device_signature, device_name });

        let newUser = new User({
            ...params,
            provider: 'local',
        });

        try {
            const savedUser = await newUser.save();
            const token = savedUser.generateToken();
            res.status(201).json({ token });
        } catch (err) {
            err.status = 400;
            next(err);
        }
    }

    update = async (req, res, next) => {
        const id = req.params._id || null;
        const newAttributes = this.filterParams(req.body, this.whitelist);
        let user;

        if ( id !== null) {
            user = await User.findById(id);
        } else {
            user = req.currentUser;
        }

        const updatedUser = Object.assign(user, newAttributes);

        try {
            res.status(200).json(await updatedUser.save());
        } catch (err) {
            next(err);
        }
    }

    delete = async (req, res, next) => {
        if (!req.currentUser) {
            return res.sendStatus(403);
        }

        try {
            await req.currentUser.remove();
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}

export default new UsersController();
