import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NumberPlateSchema = new Schema({
    number: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true,
    },
    _user: {
        type: Schema.Types.ObjectId,
        required:false,
        default: null
    },
}, {
        timestamps: true,
    });

class NumberPlateClass {

}

NumberPlateSchema.loadClass(NumberPlateClass);

const NumberPlateModel = mongoose.model('NumberPlate', NumberPlateSchema);

export default NumberPlateModel;
