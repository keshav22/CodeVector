var mongoose = require("mongoose");
var PLM =  require("passport-local-mongoose");

var newprofile = new mongoose.Schema({
        username : String,
        password : String,
        fav      : [{
            id: Number,
            img_url: String,
            title: String  
        }]
});

newprofile.plugin(PLM); 

module.exports = mongoose.model("User",newprofile);
