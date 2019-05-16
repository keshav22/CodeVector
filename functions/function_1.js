var mongoose        =  require("mongoose");
mongoose.connect("mongodb://localhost/newprofile");

function overflw(ths)
{
    if(ths==1)
    document.getElementById("menu").style.overflowX = "auto";
    else
    document.getElementById("menu").style.overflowX = "hidden";
    
    //alert(document.getElementById("menu").;    
    
}
function clicked(val)
{
    alert(document.getElementById(val).value);
}
function check(ch)
{
    if(ch==1)
    {
        var v = document.getElementById("ticket").value;
        //alert(v);
        if(v!="")
        {
            return true;
        }
        alert("Enter a valid Input");
        return false;
    }
    else
    {
        var v = document.getElementById("user").value;
        var v1 = document.getElementById("pass").value;
        if(v!="")
        {
            if(v1!="")
            {
                return true;
            }
            alert("Enter something on password feild");
            return false;
            
        }
        alert("Enter something on username feild");
        return false;
        
    }
}