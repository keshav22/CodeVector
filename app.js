var express         =  require("express");
var app             =  express();
var bodyparser      =  require("body-parser");
var mongoose        =  require("mongoose");
var request         =  require("request");
var passport        =  require("passport");
var LocalStrategy   =  require("passport-local");
var PLM             =  require("passport-local-mongoose");
var User            =  require("./models/user");
mongoose.connect("mongodb://localhost/newprofile");

app.use(require("express-session")({
    secret: "CodeVector",
    resave: false,
    saveUninitialized: false
}));

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("functions"));
app.use(passport.initialize()); 
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",isLogged,function(req,res)
{
    request('https://www.episodate.com/api/most-popular?page=1',function(error,response,body)
    {
        if(!error && response.statusCode == 200)
        {
            var result = JSON.parse(body);
            console.log(result["total"]);
            res.render("mainpage.ejs", {data : result});
        }
    });
});

app.get("/secret",isLoggedIn,function(req, res) {
    request('https://www.episodate.com/api/most-popular?page=1',function(error,response,body)
               {
                    if(!error && response.statusCode == 200)
                    {
                        console.log(req.user);
                        var result = JSON.parse(body);
                        console.log(result["total"]);
                        return res.render("secret.ejs", {data : result, name: req.user.username});
                    }
                    else
                    {
                        res.send("404 Error");
                    } 
                });
    
})

app.get("/register",isLogged,function(req,res){
   res.render("register.ejs");
});
app.post("/register",function(req, res) {
    
    User.register(new User({username: req.body.username}), req.body.password ,function(err, user){
           if(err)
           {
               console.log(err);
               request('https://www.episodate.com/api/most-popular?page=1',function(error,response,body)
               {
                    if(!error && response.statusCode == 200)
                    {
                        var result = JSON.parse(body);
                        console.log(result["total"]);
                        return res.render("mainpage.ejs", {data : result});
                    }
                    else
                    {
                        res.send("404 Error");
                    } 
                });              
           }
           passport.authenticate("local")(req, res , function(){
           request('https://www.episodate.com/api/most-popular?page=1',function(error,response,body)
           {
                if(!error && response.statusCode == 200)
                {
                    var result = JSON.parse(body);
                    console.log(result["total"]);
                    res.redirect("/secret");
                }
                });
           });
           
        });
});


app.get("/login",isLogged,function(req,res){
    res.render("login.ejs");
});
app.post("/login",passport.authenticate("local",{
    successRedirect: "/secret",
    failureRedirect: "/login"
}),function(req,res){
    
});
app.post("/result",function(req,res)
{ 
    var name = req.body.search;
    request('https://www.episodate.com/api/search?q='+name+'&page=1',function(error,response,body)
    {
        if(!error && response.statusCode == 200)
        {
            var result = JSON.parse(body);
            var pages = result.pages;
            var tvshows = [];
             tvshows = result.tv_shows;
             console.log(pages);
            //if(pages>1)
            //{   
                var j=2;
                //for( j=2;j<=pages;j++)
                //{
                    //console.log(j);
                    request('https://www.episodate.com/api/search?q='+name+'&page='+j,function(error1,response1,body1)
                    {
                        if(!error1 && response1.statusCode == 200)
                        {
                            console.log(j);
                       
                            var result1 = JSON.parse(body1);
                            //console.log(result1.tv_shows);
                            var tvshows1 =[];
                            tvshows1 = result1.tv_shows;
                            tvshows = tvshows.concat(tvshows1);
                            console.log(tvshows);
                        }
                        
                    });
                  // console.log(j);
                       
                //}
                
            //}
            
            res.render("result.ejs",{data: tvshows});
                                
            //res.render("result.ejs", {data : result});
            //res.send(result["tv_shows"]);
            //res.render(JSON.parse(body.tv_shows));
            //var result = JSON.parse(body);
            //res.render(result);
        }
    });
    
});
app.get("/favorite",isLoggedIn,function(req, res) {
    res.render("favorite.ejs",{data: req.user.fav});
});

app.get("/remove",isLoggedIn,function(req, res) {
   res.redirect("/secret");
});
app.post("/remove",function(req, res)
{
    var v = req.body.favorite;
    var array = v.split("#");
    
    var rem = {_id: array[0], id:array[1], img_url:array[2], title: array[3] };
    
    console.log(v);
    User.findById(req.user._id,function(err, user) {
        if(err)
        {}
        else{
            user.fav.remove(rem);
            user.save();
        }
        
    });
    
    res.redirect("/secret");
});


app.post("/tvshow",function(req, res) {
    var tvid1 = req.body.tvid;
    console.log(tvid1);
    request('https://www.episodate.com/api/show-details?q='+tvid1,function(error,response,body)
    {
        if(!error && response.statusCode == 200)
        {
            var result = JSON.parse(body);
            //console.log(result["total"]);
            //res.send(result);
            res.render("tvshow.ejs",{title: result.tvShow.name,data: result});
            //res.render("mainpage.ejs", {data : result});
        }
    });
    
});

app.post("/favorite",isLoggedIn,function(req,res){
    //console.log(req.user);
    var v = req.body.favorite;
    var array = v.split("#");
    //console.log(array[0]);
    
    var id = array[0];
    var img_url = array[2];
    var title = array[1];
    var fv = [];
    var newfavorite = { id: id, img_url: img_url, title: title };
    
    User.findById(req.user._id,function(err, user){
       if(err)
       {
           
       }
       else
       {
           //console.log(user);
           user.fav.push(newfavorite);
           user.save();
           fv = user.fav;
       }
    });
    fv = req.user.fav;
    fv.push(newfavorite);
    
    res.render("favorite.ejs",{data : fv});
});
app.get("/logout", function(req,res)
{
    req.logout();
    res.redirect("/");
     
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
function isLogged(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect("/secret");
}

app.get("*",function(req,res)
{
    res.send("Page Not found");
});

app.listen(process.env.PORT,process.env.IP, function(){
    console.log("Server Started");
});