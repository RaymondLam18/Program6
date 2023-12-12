import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    name: String,
    about: String,
    type: String
});

carSchema.virtual('links').get(function() {
    return {
        self: `/cars/${this._id}`
    };
});

const Car = mongoose.model('Car', carSchema);

export default Car;
