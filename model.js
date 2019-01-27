const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true,
  },
  member: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  finished:{
    type: Boolean,
    default: false,
  }
});
// collection name 'report' in mlab
const User = mongoose.model('report', UserSchema);

module.exports = User;


/* CRUD
// create
function create_(data_obj){
    var newUser = new User(data_obj);
    newUser.save().catch(err=>console.log(err));
    // User.insertMany([{},{},{}]).exec();
}
// read
function read_(data_obj){
    User.findOne(data_obj).then(user=>{return user})
}
// update
function update_(find_obj,updata_obj){
    User.update(find_obj,updata_obj)
    .exec()
    .then()
    .catch(err=>console.log(err));
}
// delete
function delete_(data_obj){
    User.deleteOne(data_obj)
    .exec()
    .then()
    .catch(err=>console.log(err));
}
*/
