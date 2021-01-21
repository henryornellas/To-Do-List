const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const lodash = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin:admin@cluster0.kv0j7.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome nessa poha'
});

const item2 = new Item({
  name: 'Hit the "+" to add a new item'
});

const item3 = new Item({
  name: '<-- Hit this to delete an item'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);

app.get('/', function(req, res) {

  Item.find({}, function(err, results) {

    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('SAFEEEE');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', {listTitle: 'Today', newListItems: results});
    }
  });

});

app.get('/:listName', function(req, res) {
  const requestedTitle = lodash.capitalize(req.params.listName);

  List.findOne({name: requestedTitle}, function(err, foundList) {
      if (!err) {
        if(!foundList){
          //Create a list
          const list = new List({
            name: requestedTitle,
            items: defaultItems
          });
          list.save();
          res.redirect('/' + requestedTitle);

        }else {
          //Show that list
          res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
  });

});

app.post('/', function(req, res) {

  const itemName = req.body.newListItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === 'Today'){
    item.save();
    res.redirect('/');
  }else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }


});

app.post('/delete', function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.deleteOne({_id: checkedItemID}, function(err) {
      if (!err) {
        console.log('foi');
        res.redirect('/');
      }
    });
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect('/' + listName);
      }
    });
  }

});











app.listen(process.env.PORT || 3000, function() {
  console.log('FOOOOOI');
});
