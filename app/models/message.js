import mongoose from 'mongoose';
import User from './user';
import NumberPlate from './number-plate';

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    _plate_number: {
        type: Schema.Types.ObjectId,
        ref: NumberPlate,
    },
    _sender: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    _recipient: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: false,
        default: null,
    },
}, {
        timestamps: true,
    });

class MessageClass {

}

MessageSchema.loadClass(MessageClass);
const MessagetModel = mongoose.model('Post', MessageSchema);
export default MessagetModel;
