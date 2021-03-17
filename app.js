// jshint esverison:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const Schema = mongoose.Schema;
//module
const date = require(__dirname + "/date.js");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongose connection
const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(
  "mongodb+srv://admin-sila:cakesom212@cluster0.fd9za.mongodb.net/todolistDB",
  option
);

const itemSchema = new Schema({
  name: String,
});
const listSchema = new Schema({
  name: String,
  items: [itemSchema],
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to todolist",
});
const item2 = new Item({
  name: "Hello my name is sila",
});
const item3 = new Item({
  name: "My nickname is toey",
});

let workItems = [];

// Date
app.get("/", function (req, res) {
  Item.find((err, founditem) => {
    if (founditem.length === 0) {
      Item.insertMany([item1, item2, item3], (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Insert item Success!!");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: founditem });
    }
  });
});
app.post("/", function (req, res) {
  let item = req.body.newItem;
  let listName = req.body.list;

  const newItem = Item({
    name: item,
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  let id = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(id, (err) => {
      if (!err) console.log("deleted !");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: id } } },
      function (err, foundList) {
        if (!err) res.redirect("/" + listName);
      }
    );
  }
});

app.get("/:page", function (req, res) {
  let pagename = _.capitalize(req.params.page);

  const list = new List({
    name: pagename,
    items: [item1, item2, item3],
  });

  List.findOne({ name: pagename }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        list.save();
        res.redirect("/" + pagename);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/work", function (req, res) {
  console.log(req.body);
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

//about

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
