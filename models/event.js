const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category: {type: String, required: [true, 'category is required']},
    title: {type: String, required: [true, 'title is required']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    details: {type: String, required: [true, 'details is required'], minLength: [10, ' the details should have at least 10 characters']},
    address: {type: String, required: [true, 'address is required']},
    date: {type: String, required: [true, 'date is required']},
    start: {type: String, required: [true, 'start is required']},
    end: {type: String, required: [true, 'end is required']},
    src: {type: String}
});

module.exports = mongoose.model('Event', eventSchema);

