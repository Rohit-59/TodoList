const { INSPECT_MAX_BYTES } = require("buffer");
const express = require("express");
const app = express();
const mongoose = require("mongoose")
// const request = require("request");
const https = require("https");
const date = require(__dirname + "/date.js")
const _ = require("lodash")
// var item s = [];
// var wo r kIte ms = [];

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://rohit591:rohit1@cluster0.xjl1r7n.mongodb.net/todoListDB');
}
const itemSchema = {
  name: String
}
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your to do list"
})
const item2 = new Item({
  name: "Click on the + button to add more"
})
const item3 = new Item({
  name: "<--Click on this to delete "
})

const deafaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}
 const List = mongoose.model("List", listSchema)



app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

app.use("/public",express.static("public"));

app.get('/', (req,res)=>{

    Item.find({},(err, foundItems)=>{

      if(foundItems.length===0){
        Item.insertMany(deafaultItems,(err)=>{
          if(err){
            console.log(err);
          }else{
            console.log("Successfully saved defualt item to DB")
          }
        });
        res.redirect("/");
      }else{
        res.render("list",{listTitle : "Today", newlistItem : foundItems});
      }
      
    });
    
  
})

app.post('/',(req,res)=>{

  const itemName = req.body.input1;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
  List.findOne({name: listName}, (err, foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect('/' + listName);
  })
  }

  // res.redirect('/');

  // if(req.body.list==="Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else { 
  //  items.push(item);
  //   res.redirect('/');
  // }
});

app.post("/delete", (req,res)=>{
 const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

 if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId, (err)=>{
    if(!err){
      console.log("Successfully deleted the checked item from DB");
      res.redirect('/');
    }else{
      console.log(err);
    }
   })

 }else{
   List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, (err, fooundList)=>{
    if(!err){
 res.redirect("/"+ listName);
    }else{

    }
   })
 }

 

})

app.get("/:customListname",(req,res)=>{
   const customListname = _.capitalize(req.params.customListname);

    List.findOne({name: customListname}, (err, foundList)=>{
      if(!err){
        if(!foundList){
          const list = new List({
            name: customListname,
            items: deafaultItems
           });
           list.save();
           res.redirect("/" + customListname)
      //  console.log("Doesn't Exists");
        }else{
          res.render("list",{listTitle : foundList.name, newlistItem : foundList.items});
        }
      }

    });

   
})


app.get('/work',(req,res)=>{
  res.render("list", {listTitle: "Work List", newlistItem : workItems})
})

app.get('/about', (req,res)=>{
 res.render("about"); 
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,()=>{
    console.log("Server Started Succesfully");
})